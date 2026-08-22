import { getGeminiModel } from './gemini';
import { FallbackAiEngine } from './fallbackEngine';

export interface MessageAnalysisResult {
  intentCategory: string; // QUESTION | COMPLAINT | SALES_INQUIRY | FEEDBACK
  priority: string; // NORMAL | HIGH | URGENT
  sentiment: string; // POSITIVE | NEUTRAL | NEGATIVE
  suggestedReply: string;
  source: 'GEMINI_2_0' | 'INTELLIGENT_AI_ENGINE';
}

export class AiMessagingIntelligence {
  static async analyzeAndSuggest(
    userId: string,
    messageText: string,
    platform: string,
    senderName?: string
  ): Promise<MessageAnalysisResult> {
    const model = await getGeminiModel(userId);

    if (model) {
      try {
        const prompt = `You are MetaSphere AI Assistant managing customer communication for an official Meta account (${platform}).
Sender: ${senderName || 'Customer'}
Message: "${messageText}"

Analyze this message and formulate a professional, helpful, context-aware reply suggestion.
Respond ONLY with valid JSON in this exact structure:
{
  "intentCategory": "QUESTION" or "COMPLAINT" or "SALES_INQUIRY" or "FEEDBACK",
  "priority": "NORMAL" or "HIGH" or "URGENT",
  "sentiment": "POSITIVE" or "NEUTRAL" or "NEGATIVE",
  "suggestedReply": "Your suggested reply text here"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            intentCategory: parsed.intentCategory || 'QUESTION',
            priority: parsed.priority || 'NORMAL',
            sentiment: parsed.sentiment || 'NEUTRAL',
            suggestedReply: parsed.suggestedReply || '',
            source: 'GEMINI_2_0',
          };
        }
      } catch (err) {
        console.warn('Gemini messaging analysis failed, using fallback:', err);
      }
    }

    const fallback = FallbackAiEngine.analyzeMessage(messageText, platform);
    return {
      ...fallback,
      source: 'INTELLIGENT_AI_ENGINE',
    };
  }
}
