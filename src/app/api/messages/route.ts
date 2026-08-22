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

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    const whereClause: any = {
      account: { userId: user.id },
    };
    if (platform) whereClause.platform = platform;

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        account: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { messageId, replyText, recipientId, accountId, platform, conversationId } = body;

    if (!replyText) {
      return NextResponse.json({ success: false, error: 'Reply text required' }, { status: 400 });
    }

    let targetAccountId = accountId;
    let targetPlatform = platform;
    let targetRecipientId = recipientId;
    let targetConversationId = conversationId;

    if (messageId) {
      const originalMessage = await prisma.message.findUnique({
        where: { id: messageId },
        include: { account: true },
      });
      if (originalMessage) {
        targetAccountId = originalMessage.accountId;
        targetPlatform = originalMessage.platform;
        targetRecipientId = originalMessage.senderId;
        targetConversationId = originalMessage.conversationId;

        // Mark original message status
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'SENT', isApproved: true },
        });
      }
    }

    if (!targetAccountId || !targetPlatform || !targetRecipientId) {
      return NextResponse.json({ success: false, error: 'Missing recipient, account, or platform target' }, { status: 400 });
    }

    // Send direct message via Meta Integration Service
    const sendResult = await MetaIntegrationService.sendDirectMessage(
      user.id,
      targetAccountId,
      targetPlatform as MetaPlatform,
      targetRecipientId,
      replyText
    );

    // Create outbound message record in database
    const outboundMessage = await prisma.message.create({
      data: {
        accountId: targetAccountId,
        platform: targetPlatform,
        conversationId: targetConversationId || `conv_${Date.now()}`,
        senderId: 'SYSTEM_ACCOUNT',
        senderName: 'MetaSphere Business Agent',
        messageText: replyText,
        direction: 'OUTBOUND',
        status: 'SENT',
        isApproved: true,
      },
      include: { account: true },
    });

    await logActivity({
      userId: user.id,
      actorType: 'USER',
      actionType: 'MESSAGE_SEND',
      platform: targetPlatform as any,
      actionStatus: 'SUCCESS',
      details: `Sent ${targetPlatform} response to ${targetRecipientId}: "${replyText.substring(0, 80)}..."`,
    });

    return NextResponse.json({ success: true, message: outboundMessage, sendResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { messageId } = body;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });

    const analysis = await AiMessagingIntelligence.analyzeAndSuggest(
      user.id,
      message.messageText,
      message.platform,
      message.senderName
    );

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        suggestedReply: analysis.suggestedReply,
        intentCategory: analysis.intentCategory,
        priority: analysis.priority,
      },
      include: { account: true },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
