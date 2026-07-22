import env from './env.js';

// TODO: Initialize Gemini API Client instance using process.env.GEMINI_API_KEY
export const getGeminiClient = () => {
  if (!env.gemini.apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
    return null;
  }
  // TODO: Instantiate GoogleGenAI client (e.g. new GoogleGenAI({ apiKey: env.gemini.apiKey }))
  return {
    apiKey: env.gemini.apiKey,
    model: 'gemini-1.5-pro',
  };
};

export default getGeminiClient;
