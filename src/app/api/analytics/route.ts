import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MOCK_ANALYTICS } from '@/lib/meta/simulator';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst({
      include: {
        accounts: true,
        contentItems: {
          where: { status: 'PUBLISHED' },
        },
      },
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const totalPostsCount = await prisma.contentItem.count({
      where: { userId: user.id, status: 'PUBLISHED' },
    });

    const scheduledCount = await prisma.contentItem.count({
      where: { userId: user.id, status: 'SCHEDULED' },
    });

    const pendingCommentsCount = await prisma.comment.count({
      where: { account: { userId: user.id }, replyStatus: 'UNREPLIED' },
    });

    const unreadMessagesCount = await prisma.message.count({
      where: { account: { userId: user.id }, direction: 'INBOUND', status: 'RECEIVED' },
    });

    // Separation of Raw Platform API Data vs AI Interpreted Recommendations
    const rawApiData = {
      overview: {
        ...MOCK_ANALYTICS.overview,
        totalPosts: totalPostsCount || 8,
        activeSchedules: scheduledCount,
        pendingTriage: pendingCommentsCount + unreadMessagesCount,
      },
      timeseries: MOCK_ANALYTICS.timeseries,
      topPosts: MOCK_ANALYTICS.topPosts,
    };

    const aiGeneratedInsights = [
      {
        type: 'PERFORMANCE_SPIKE',
        title: 'Friday Engagement Surge',
        description: 'Posts published on Fridays generate 28% higher comment depth compared to mid-week posts. Consider shifting high-impact campaign releases to Friday 10:30 AM.',
        confidence: '94%',
      },
      {
        type: 'MESSAGING_EFFICIENCY',
        title: 'WhatsApp Response Velocity',
        description: 'Average inbound WhatsApp customer inquiry response time is 4m 12s, maintaining a 98.6% customer satisfaction score.',
        confidence: '98%',
      },
      {
        type: 'CONTENT_REPURPOSING',
        title: 'Carousel Format Outperforming Singles',
        description: 'Multi-slide Instagram carousels retain 2.4x more viewer interaction time than single image posts across your audience demographic.',
        confidence: '89%',
      },
    ];

    return NextResponse.json({
      success: true,
      rawApiData,
      aiGeneratedInsights,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
