import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MetaIntegrationService } from '@/lib/meta/client';
import { AiMessagingIntelligence } from '@/lib/ai/messagingIntelligence';
import { logActivity } from '@/lib/audit';
import { MetaPlatform } from '@/lib/meta/types';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const comments = await prisma.comment.findMany({
      where: {
        account: { userId: user.id },
      },
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { commentId, replyText } = body;

    if (!commentId || !replyText) {
      return NextResponse.json({ success: false, error: 'Comment ID and reply text required' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { account: true },
    });

    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    // Send reply via official Meta API
    await MetaIntegrationService.replyToComment(
      user.id,
      comment.accountId,
      comment.platform as MetaPlatform,
      comment.externalCommentId,
      replyText
    );

    // Update comment status
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        replyStatus: 'REPLIED',
        repliedText: replyText,
        repliedAt: new Date(),
      },
      include: { account: true },
    });

    await logActivity({
      userId: user.id,
      actorType: 'USER',
      actionType: 'COMMENT_REPLY',
      platform: comment.platform as any,
      actionStatus: 'SUCCESS',
      details: `Replied to comment by ${comment.authorName}: "${replyText.substring(0, 80)}..."`,
    });

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { commentId } = body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });

    // Generate fresh AI suggestion
    const aiAnalysis = await AiMessagingIntelligence.analyzeAndSuggest(
      user.id,
      comment.commentText,
      comment.platform,
      comment.authorName
    );

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        suggestedReply: aiAnalysis.suggestedReply,
        sentiment: aiAnalysis.sentiment,
        priority: aiAnalysis.priority,
      },
      include: { account: true },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
