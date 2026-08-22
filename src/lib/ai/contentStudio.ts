import { getGeminiModel } from './gemini';
import { FallbackAiEngine, CaptionGenInput } from './fallbackEngine';

export interface ContentGenerationResult {
  primaryCaption: string;
  variations: string[];
  suggestedHashtags: string[];
  estimatedEngagementScore: string;
  bestTimeToPost: string;
  source: 'GEMINI_2_0' | 'INTELLIGENT_AI_ENGINE';
}

export class AiContentStudio {
  static async generateContent(userId: string, input: CaptionGenInput): Promise<ContentGenerationResult> {
    const model = await getGeminiModel(userId);

    if (model) {
      try {
        const prompt = `You are MetaSphere AI, an expert social media manager for Meta platforms (Facebook, Instagram, WhatsApp Business).
Generate engaging content for:
- Platform: ${input.platform}
- Topic / Concept: ${input.topic}
- Desired Tone: ${input.tone}
- Target Audience: ${input.targetAudience || 'General tech & digital audience'}
- Include Hashtags: ${input.includeHashtags ? 'Yes' : 'No'}

Respond ONLY with valid JSON in this exact structure:
{
  "primaryCaption": "The full primary post caption with emojis and appropriate spacing",
  "variations": ["Short catchy variation 1", "Alternative angle variation 2"],
  "suggestedHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "estimatedEngagementScore": "9.1 / 10",
  "bestTimeToPost": "Best recommended time"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            primaryCaption: parsed.primaryCaption || '',
            variations: parsed.variations || [],
            suggestedHashtags: parsed.suggestedHashtags || [],
            estimatedEngagementScore: parsed.estimatedEngagementScore || '8.8 / 10',
            bestTimeToPost: parsed.bestTimeToPost || 'Tomorrow at 10:30 AM',
            source: 'GEMINI_2_0',
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in AI engine:', err);
      }
    }

    const fallback = FallbackAiEngine.generateCaptions(input);
    return {
      ...fallback,
      source: 'INTELLIGENT_AI_ENGINE',
    };
  }
}
