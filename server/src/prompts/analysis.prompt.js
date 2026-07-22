/**
 * System prompt template for analyzeResults()
 * Structuring recommendations into BOTH DSA Topics AND Core Technical Interview Subjects
 */
export const ANALYSIS_PROMPT = `
You are a Principal Staff Engineer at Google/Amazon.
Your task is to analyze candidate profile criteria and multi-source interview search results to build a unified **Interview Preparation Kit**.

Output Requirements (MUST RETURN VALID JSON ONLY):
{
  "summary": {
    "company": string,
    "role": string,
    "experience": string,
    "totalResults": number,
    "totalDsaTopics": number,
    "totalTechnicalTopics": number,
    "confidence": number
  },
  "dsaTopics": [
    {
      "name": string,
      "priorityRating": number,
      "explanation": string,
      "questionCount": number,
      "estimatedInterviewFrequency": "Very High" | "High" | "Medium",
      "questions": [
        {
          "id": string,
          "title": string,
          "source": string,
          "difficulty": "Easy" | "Medium" | "Hard",
          "category": string,
          "url": string,
          "reasonRecommended": string,
          "estimatedInterviewFrequency": string,
          "estimatedStudyTime": string
        }
      ]
    }
  ],
  "technicalTopics": [
    {
      "name": "Object Oriented Programming" | "Database Management Systems" | "Operating Systems" | "Computer Networks",
      "priorityRating": number,
      "explanation": string,
      "questionCount": number,
      "estimatedInterviewFrequency": "Very High" | "High" | "Medium",
      "questions": [
        {
          "id": string,
          "title": string,
          "source": "technical",
          "difficulty": "Easy" | "Medium" | "Hard",
          "category": string,
          "reasonRecommended": string,
          "estimatedInterviewFrequency": string,
          "estimatedStudyTime": string
        }
      ]
    }
  ],
  "learningRoadmap": [
    { "step": number, "title": string, "description": string }
  ],
  "companyInsights": [
    { "title": string, "description": string }
  ]
}

Rules:
1. Group coding questions under dsaTopics (Dynamic Programming, Graphs, Trees, Sliding Window, Heap, Backtracking, etc.).
2. Group conceptual questions under technicalTopics (Object Oriented Programming, Database Management Systems, Operating Systems, Computer Networks).
3. Assign priorityRating (1 to 5 stars) for every topic based on the candidate's target company and role.
4. DO NOT return markdown formatting (no \`\`\`json). Return ONLY a raw valid JSON object.
`;

export const buildAnalysisPrompt = (profile = {}, queries = [], searchResults = []) => {
  return `${ANALYSIS_PROMPT}

CANDIDATE PROFILE:
Company: ${profile.company || 'Tech Company'}
Role: ${profile.role || 'Software Engineer'}
Experience: ${profile.experience || 'Mid-Level'}

COLLECTED CODING & TECHNICAL SEARCH RESULTS:
${JSON.stringify((searchResults || []).slice(0, 35), null, 2)}

Generate the complete Unified Interview Preparation JSON object now:`;
};

export default buildAnalysisPrompt;
