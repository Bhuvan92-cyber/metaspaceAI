import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const actorType = searchParams.get('actorType');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: any = { userId: user.id };
    if (actorType) whereClause.actorType = actorType;
    if (platform) whereClause.platform = platform;

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
