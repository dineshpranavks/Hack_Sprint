/**
 * Parser utility for Gemini AI response outputs.
 */

// TODO: Parse structured JSON responses returned by Gemini API models
export const parseAIResponse = (rawResponse) => {
  try {
    if (typeof rawResponse === 'object') return rawResponse;
    return JSON.parse(rawResponse);
  } catch (error) {
    console.error('Failed to parse AI raw response:', error);
    return null;
  }
};

export default parseAIResponse;
