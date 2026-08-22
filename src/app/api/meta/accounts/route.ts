import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const accounts = await prisma.connectedAccount.findMany({
      where: { userId: user.id },
      include: {
        permissions: true,
        tokenVault: {
          select: {
            id: true,
            tokenType: true,
            scopes: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Account ID required' }, { status: 400 });
    }

    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    // Delete token and account (Cascade will delete TokenVault and Permissions)
    await prisma.connectedAccount.delete({
      where: { id: accountId },
    });

    await logActivity({
      userId: account.userId,
      actorType: 'USER',
      actionType: 'OAUTH_DISCONNECT',
      platform: account.platform as any,
      actionStatus: 'SUCCESS',
      details: `Disconnected ${account.platform} account "${account.accountName}". Revoked OAuth tokens from secure vault.`,
    });

    return NextResponse.json({ success: true, message: 'Account disconnected and tokens wiped.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { permissionId, grantedStatus } = body;

    const permission = await prisma.accountPermission.update({
      where: { id: permissionId },
      data: { grantedStatus },
      include: { account: true },
    });

    await logActivity({
      userId: permission.account.userId,
      actorType: 'USER',
      actionType: 'PERMISSION_UPDATE',
      platform: permission.account.platform as any,
      actionStatus: 'SUCCESS',
      details: `Updated permission "${permission.permissionName}" to ${grantedStatus ? 'GRANTED' : 'REVOKED'}.`,
    });

    return NextResponse.json({ success: true, permission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
