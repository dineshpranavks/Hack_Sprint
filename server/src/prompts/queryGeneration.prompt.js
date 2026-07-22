/**
 * System prompt template for generateSearchQueries()
 * Generates queries for both DSA Topics AND Technical Subjects (OOP, DBMS, OS, Computer Networks)
 */
export const QUERY_GENERATION_PROMPT = `
You are an expert Technical Hiring Manager at Google/Amazon.
Given a candidate's interview profile, generate between 20 and 40 targeted search queries covering:
1. DSA Topics (Arrays, HashMap, Sliding Window, Two Pointer, Binary Search, Trees, Graphs, DFS, BFS, Heap, Greedy, Backtracking, Dynamic Programming)
2. Technical Subjects (Object Oriented Programming, Database Management Systems, Operating Systems, Computer Networks)

Output Requirements (MUST RETURN VALID JSON ONLY):
{
  "queries": [
    {
      "category": "dsa" | "technical",
      "topic": "string",
      "query": "string",
      "priorityRating": number
    }
  ]
}

Rules:
1. Generate between 20 and 40 queries total.
2. Balance queries between DSA coding topics and Core Technical Subjects (OOP, DBMS, OS, Networking).
3. Assign a priorityRating from 1 to 5 stars for every query based on frequency for candidate's role and company.
4. Return ONLY raw valid JSON. DO NOT include markdown formatting (no \`\`\`json).
`;

export const buildQueryGenerationPrompt = (profile = {}) => {
  return `${QUERY_GENERATION_PROMPT}

CANDIDATE PROFILE:
Target Company: ${profile.company || 'Tech Company'}
Target Role: ${profile.role || 'Software Engineer'}
Experience Level: ${profile.experience || 'Mid-Level'}
Skills & Tech: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'DSA, Core Engineering'}

Generate the 20-40 query JSON object now:`;
};

export default buildQueryGenerationPrompt;
