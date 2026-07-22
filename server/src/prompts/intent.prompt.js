/**
 * System prompt template for extractIntent()
 */
export const INTENT_EXTRACTION_PROMPT = `
You are an expert AI intent extraction agent for an interview preparation platform.
Analyze the user's latest message along with existing conversation context to extract structured interview preparation criteria.

Schema Requirements (MUST RETURN VALID JSON ONLY):
{
  "company": string | null,
  "role": string | null,
  "experience": string | null,
  "skills": string[],
  "technologies": string[],
  "interviewTypes": string[],
  "seniority": string | null,
  "confidence": number,
  "missingFields": string[]
}

Rules:
1. REQUIRED FIELDS: "company", "role", "experience".
2. "missingFields" MUST contain any of ["company", "role", "experience"] that remain null or empty.
3. Keep pre-existing non-null fields from existingContext unless the user explicitly changes them.
4. "confidence" must be a float between 0.0 and 1.0.
5. Return ONLY a single raw valid JSON object. DO NOT include markdown formatting (no \`\`\`json), explanations, or preambles.
`;

export const buildIntentPrompt = (chatHistory, currentFields = {}) => {
  const historyText = chatHistory
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n');

  return `${INTENT_EXTRACTION_PROMPT}

CURRENT KNOWN FIELDS:
${JSON.stringify(currentFields, null, 2)}

CONVERSATION HISTORY:
${historyText}

Return the extracted JSON object now:`;
};

export default buildIntentPrompt;
