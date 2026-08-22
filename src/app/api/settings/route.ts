import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst({
      include: { settings: true },
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, settings: user.settings, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const {
      simulationModeEnabled,
      autoReplyApprovalReq,
      emailNotifications,
      metaAppId,
      metaAppSecret,
      geminiApiKey,
    } = body;

    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        simulationModeEnabled: simulationModeEnabled ?? true,
        autoReplyApprovalReq: autoReplyApprovalReq ?? true,
        emailNotifications: emailNotifications ?? true,
        metaAppId,
        metaAppSecret,
        geminiApiKey,
      },
      update: {
        simulationModeEnabled: simulationModeEnabled !== undefined ? simulationModeEnabled : undefined,
        autoReplyApprovalReq: autoReplyApprovalReq !== undefined ? autoReplyApprovalReq : undefined,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        metaAppId: metaAppId !== undefined ? metaAppId : undefined,
        metaAppSecret: metaAppSecret !== undefined ? metaAppSecret : undefined,
        geminiApiKey: geminiApiKey !== undefined ? geminiApiKey : undefined,
      },
    });

    await logActivity({
      userId: user.id,
      actorType: 'USER',
      actionType: 'SETTINGS_UPDATE',
      platform: 'SYSTEM',
      actionStatus: 'SUCCESS',
      details: `Updated system configuration (Simulation Mode: ${updatedSettings.simulationModeEnabled ? 'ON' : 'OFF'})`,
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
