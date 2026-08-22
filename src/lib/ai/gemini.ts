import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../db';

/**
 * Initializes Gemini client with either user-configured or env API key
 */
export async function getGeminiModel(userId?: string, modelName = 'gemini-1.5-flash') {
  let apiKey = process.env.GEMINI_API_KEY;

  if (userId) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    if (settings?.geminiApiKey) {
      apiKey = settings.geminiApiKey;
    }
  }

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
  } catch (error) {
    console.error('Failed to initialize Google Generative AI client:', error);
    return null;
  }
}
