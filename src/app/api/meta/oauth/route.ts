import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encryptToken } from '@/lib/encryption';
import { logActivity } from '@/lib/audit';
import { MOCK_ACCOUNTS } from '@/lib/meta/simulator';

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { platform, liveCredentials } = body; // platform: 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP'

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform required' }, { status: 400 });
    }

    let accountName = '';
    let accountType = 'PAGE';
    let platformAccountId = '';
    let avatarUrl = '';
    let rawToken = '';
    let scopes: string[] = [];

    if (liveCredentials && liveCredentials.accessToken) {
      // Live Meta Credentials supplied by user
      accountName = liveCredentials.accountName || `${platform} Live Account`;
      accountType = liveCredentials.accountType || (platform === 'FACEBOOK' ? 'PAGE' : platform === 'INSTAGRAM' ? 'BUSINESS' : 'WHATSAPP_BUSINESS');
      platformAccountId = liveCredentials.platformAccountId || `live_${Date.now()}`;
      avatarUrl = liveCredentials.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150';
      rawToken = liveCredentials.accessToken;
      scopes = liveCredentials.scopes || ['pages_manage_posts', 'instagram_basic', 'whatsapp_business_messaging'];
    } else {
      // Simulation / Instant Mock OAuth Flow
      const mockData = MOCK_ACCOUNTS.find((m) => m.platform === platform);
      if (!mockData) {
        return NextResponse.json({ success: false, error: 'Unsupported platform mock' }, { status: 400 });
      }
      accountName = mockData.name;
      accountType = mockData.type;
      platformAccountId = mockData.id;
      avatarUrl = mockData.avatarUrl;
      rawToken = `EAAB_simulated_token_${platform.toLowerCase()}_${Date.now()}`;
      scopes = mockData.scopes;
    }

    // Upsert Connected Account
    const existing = await prisma.connectedAccount.findFirst({
      where: { userId: user.id, platform },
    });

    let account;
    if (existing) {
      account = await prisma.connectedAccount.update({
        where: { id: existing.id },
        data: {
          accountName,
          accountType,
          platformAccountId,
          avatarUrl,
          connectionStatus: 'ACTIVE',
        },
      });

      // Update token vault
      await prisma.oAuthTokenVault.upsert({
        where: { accountId: account.id },
        create: {
          accountId: account.id,
          encryptedAccessToken: encryptToken(rawToken),
          tokenType: 'BEARER',
          scopes: JSON.stringify(scopes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        },
        update: {
          encryptedAccessToken: encryptToken(rawToken),
          scopes: JSON.stringify(scopes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        },
      });
    } else {
      account = await prisma.connectedAccount.create({
        data: {
          userId: user.id,
          platform,
          platformAccountId,
          accountName,
          accountType,
          avatarUrl,
          connectionStatus: 'ACTIVE',
        },
      });

      // Save encrypted token
      await prisma.oAuthTokenVault.create({
        data: {
          accountId: account.id,
          encryptedAccessToken: encryptToken(rawToken),
          tokenType: 'BEARER',
          scopes: JSON.stringify(scopes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        },
      });

      // Save permissions
      for (const scope of scopes) {
        await prisma.accountPermission.create({
          data: {
            accountId: account.id,
            permissionName: scope,
            grantedStatus: true,
          },
        });
      }
    }

    await logActivity({
      userId: user.id,
      actorType: 'USER',
      actionType: 'OAUTH_CONNECT',
      platform: platform as any,
      actionStatus: 'SUCCESS',
      details: `Connected ${platform} account "${accountName}" with ${scopes.length} authorized scopes. Tokens secured in AES-256 vault.`,
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
