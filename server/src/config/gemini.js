import { GoogleGenAI } from '@google/genai';
import env from './env.js';

let aiInstance = null;

/**
 * Singleton factory for Google Gen AI client.
 * Reuses existing Gemini client instance across all services.
 */
export const getGeminiClient = () => {
  const apiKey = env.gemini?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini Config] GEMINI_API_KEY is missing in process.env or env config.');
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export default getGeminiClient;
