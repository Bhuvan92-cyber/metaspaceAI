import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AiContentStudio } from '@/lib/ai/contentStudio';
import { AiMessagingIntelligence } from '@/lib/ai/messagingIntelligence';
import { AiAnalyticsIntelligence } from '@/lib/ai/analyticsIntelligence';
import { logActivity } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { action, payload } = body;

    if (action === 'GENERATE_CONTENT') {
      const { topic, tone, platform, targetAudience, includeHashtags } = payload;
      const result = await AiContentStudio.generateContent(user.id, {
        topic: topic || 'New Product Feature',
        tone: tone || 'engaging',
        platform: platform || 'INSTAGRAM',
        targetAudience,
        includeHashtags,
      });

      // Store in AiSuggestion table
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          userId: user.id,
          sourceType: 'CAPTION',
          promptInput: `Topic: ${topic} | Tone: ${tone} | Platform: ${platform}`,
          generatedContent: result.primaryCaption,
          approvedStatus: 'PENDING',
        },
      });

      await logActivity({
        userId: user.id,
        actorType: 'AI',
        actionType: 'AI_GENERATE',
        platform: platform as any,
        actionStatus: 'SUCCESS',
        details: `Generated post captions for "${topic}" using ${result.source}.`,
      });

      return NextResponse.json({ success: true, result, suggestionId: suggestion.id });
    } else if (action === 'SUGGEST_REPLY') {
      const { text, platform, senderName } = payload;
      const result = await AiMessagingIntelligence.analyzeAndSuggest(user.id, text, platform, senderName);

      return NextResponse.json({ success: true, result });
    } else if (action === 'ANALYTICS_QUERY') {
      const { query } = payload;
      const result = await AiAnalyticsIntelligence.queryInsights(user.id, query);

      await logActivity({
        userId: user.id,
        actorType: 'AI',
        actionType: 'AI_ANALYSIS',
        platform: 'SYSTEM',
        actionStatus: 'SUCCESS',
        details: `Answered AI Command Query: "${query}"`,
      });

      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid AI action type' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
