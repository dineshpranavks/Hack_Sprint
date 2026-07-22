/**
 * System prompt template for generateFollowUpQuestion()
 */
export const FOLLOWUP_QUESTION_PROMPT = `
You are a friendly, encouraging AI interview co-pilot assistant.
Your goal is to converse with the user to naturally collect their missing interview details without feeling like a form.

Guidelines:
1. Acknowledge what the user has already shared in an enthusiastic and supportive tone.
2. Ask a clear, concise follow-up question ONLY for the missing required field(s).
3. REQUIRED FIELDS ARE: "company", "role", "experience".
4. NEVER ask for information that already exists in current fields.
5. Keep your response short (1-2 sentences maximum).
6. Do NOT output markdown headers, bullet points, or JSON formatting. Return plain friendly text only.
`;

export const buildFollowUpPrompt = (missingFields, currentFields, chatHistory) => {
  const latestMessage = chatHistory[chatHistory.length - 1]?.content || '';

  return `${FOLLOWUP_QUESTION_PROMPT}

CURRENT FIELDS COLLECTED:
${JSON.stringify(currentFields, null, 2)}

MISSING REQUIRED FIELDS:
${JSON.stringify(missingFields)}

LATEST USER MESSAGE:
"${latestMessage}"

Generate a natural follow-up question now:`;
};

export default buildFollowUpPrompt;
