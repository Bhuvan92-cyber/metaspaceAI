import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AiMessagingIntelligence } from '@/lib/ai/messagingIntelligence';
import { logActivity } from '@/lib/audit';

/**
 * Meta Webhook Challenge Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'metasphere_secure_webhook_verify_token';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ Meta Webhook successfully verified with challenge token');
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ error: 'Webhook verification token mismatch' }, { status: 403 });
}

/**
 * Meta Webhook Ingestion Receiver (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'No user registered to receive webhooks' }, { status: 404 });
    }

    // Process entries
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        // 1. WhatsApp Inbound Messages
        if (body.object === 'whatsapp_business_account') {
          const changes = entry.changes?.[0]?.value;
          const messages = changes?.messages;
          const contacts = changes?.contacts;

          if (messages && messages.length > 0) {
            const msg = messages[0];
            const senderPhone = msg.from;
            const senderName = contacts?.[0]?.profile?.name || senderPhone;
            const textContent = msg.text?.body || '[Media/Attachment]';

            const waAccount = await prisma.connectedAccount.findFirst({
              where: { platform: 'WHATSAPP', userId: user.id },
            });

            if (waAccount) {
              const aiAnalysis = await AiMessagingIntelligence.analyzeAndSuggest(
                user.id,
                textContent,
                'WHATSAPP',
                senderName
              );

              await prisma.message.create({
                data: {
                  accountId: waAccount.id,
                  platform: 'WHATSAPP',
                  conversationId: `conv_${senderPhone}`,
                  senderId: senderPhone,
                  senderName,
                  messageText: textContent,
                  direction: 'INBOUND',
                  intentCategory: aiAnalysis.intentCategory,
                  priority: aiAnalysis.priority,
                  suggestedReply: aiAnalysis.suggestedReply,
                  status: 'RECEIVED',
                  externalMessageId: msg.id,
                },
              });

              await logActivity({
                userId: user.id,
                actorType: 'META_WEBHOOK',
                actionType: 'MESSAGE_SEND',
                platform: 'WHATSAPP',
                actionStatus: 'SUCCESS',
                details: `Received inbound WhatsApp message from ${senderName} (${aiAnalysis.intentCategory} - ${aiAnalysis.priority})`,
              });
            }
          }
        }

        // 2. Instagram Direct Messages / Comments
        if (body.object === 'instagram') {
          const messaging = entry.messaging?.[0];
          if (messaging && messaging.message) {
            const senderId = messaging.sender.id;
            const text = messaging.message.text;

            const igAccount = await prisma.connectedAccount.findFirst({
              where: { platform: 'INSTAGRAM', userId: user.id },
            });

            if (igAccount) {
              const aiAnalysis = await AiMessagingIntelligence.analyzeAndSuggest(
                user.id,
                text,
                'INSTAGRAM',
                senderId
              );

              await prisma.message.create({
                data: {
                  accountId: igAccount.id,
                  platform: 'INSTAGRAM',
                  conversationId: `conv_ig_${senderId}`,
                  senderId,
                  senderName: `IG User ${senderId.substring(0, 6)}`,
                  messageText: text,
                  direction: 'INBOUND',
                  intentCategory: aiAnalysis.intentCategory,
                  priority: aiAnalysis.priority,
                  suggestedReply: aiAnalysis.suggestedReply,
                  status: 'RECEIVED',
                  externalMessageId: messaging.message.mid,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Meta webhook payload:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
