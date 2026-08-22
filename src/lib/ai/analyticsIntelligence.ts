import { getGeminiModel } from './gemini';
import { FallbackAiEngine } from './fallbackEngine';

export interface AnalyticsQueryResult {
  summary: string;
  metrics: { label: string; value: string }[];
  recommendation: string;
  source: 'GEMINI_2_0' | 'INTELLIGENT_AI_ENGINE';
}

export class AiAnalyticsIntelligence {
  static async queryInsights(
    userId: string,
    userQuery: string,
    contextData?: any
  ): Promise<AnalyticsQueryResult> {
    const model = await getGeminiModel(userId);

    if (model) {
      try {
        const prompt = `You are MetaSphere AI Command Assistant.
The user is asking an analytics or strategic question about their connected Meta accounts (Facebook, Instagram, WhatsApp).
User Query: "${userQuery}"
Context Data: ${JSON.stringify(contextData || {})}

Provide a concise, highly insightful answer.
Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Direct factual answer summary with key observations",
  "metrics": [
    { "label": "Metric Name", "value": "Value or Stat" },
    { "label": "Metric Name 2", "value": "Value or Stat 2" }
  ],
  "recommendation": "1-2 actionable, concrete next steps to boost growth or performance"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || '',
            metrics: parsed.metrics || [],
            recommendation: parsed.recommendation || '',
            source: 'GEMINI_2_0',
          };
        }
      } catch (err) {
        console.warn('Gemini analytics query failed, using fallback:', err);
      }
    }

    const fallback = FallbackAiEngine.processNaturalLanguageQuery(userQuery);
    return {
      ...fallback,
      source: 'INTELLIGENT_AI_ENGINE',
    };
  }
}
