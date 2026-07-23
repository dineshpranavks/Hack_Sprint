import { getGeminiClient } from '../config/gemini.js';

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Role-Based Fallback Knowledge for Topic Inference
 */
const ROLE_TOPIC_KNOWLEDGE = {
  frontend: {
    codingTopics: [{ name: 'Arrays', priority: 5 }, { name: 'Strings', priority: 5 }, { name: 'Sliding Window', priority: 5 }, { name: 'HashMap', priority: 4 }, { name: 'Binary Search', priority: 4 }],
    technicalTopics: [{ name: 'JavaScript & Event Loop', priority: 5 }, { name: 'React Architecture', priority: 5 }, { name: 'Web Performance & DOM', priority: 4 }],
    learningOrder: ['JavaScript & Event Loop', 'React Architecture', 'Arrays', 'Strings', 'Sliding Window', 'HashMap', 'Web Performance & DOM'],
  },
  backend: {
    codingTopics: [{ name: 'Graphs', priority: 5 }, { name: 'Trees', priority: 5 }, { name: 'Heap', priority: 4 }, { name: 'Trie', priority: 4 }, { name: 'Dynamic Programming', priority: 4 }],
    technicalTopics: [{ name: 'Database Management Systems', priority: 5 }, { name: 'Operating Systems', priority: 5 }, { name: 'Computer Networks', priority: 4 }, { name: 'REST APIs & Caching', priority: 4 }],
    learningOrder: ['Database Management Systems', 'Operating Systems', 'Graphs', 'Trees', 'Heap', 'Computer Networks', 'Dynamic Programming'],
  },
  cloud: {
    codingTopics: [{ name: 'Graphs', priority: 5 }, { name: 'Greedy', priority: 5 }, { name: 'Shortest Path', priority: 4 }, { name: 'Union Find', priority: 4 }],
    technicalTopics: [{ name: 'Computer Networks', priority: 5 }, { name: 'Operating Systems', priority: 5 }, { name: 'Docker & Kubernetes', priority: 4 }],
    learningOrder: ['Computer Networks', 'Operating Systems', 'Graphs', 'Greedy', 'Docker & Kubernetes'],
  },
  ai: {
    codingTopics: [{ name: 'Heap', priority: 5 }, { name: 'Priority Queue', priority: 5 }, { name: 'Graphs', priority: 4 }, { name: 'Dynamic Programming', priority: 4 }],
    technicalTopics: [{ name: 'Python Data Stack', priority: 5 }, { name: 'PyTorch & Neural Networks', priority: 5 }, { name: 'Statistics & Linear Algebra', priority: 4 }],
    learningOrder: ['Python Data Stack', 'PyTorch & Neural Networks', 'Priority Queue', 'Graphs', 'Dynamic Programming'],
  },
};

function inferRoleKey(role = '') {
  const r = role.toLowerCase();
  if (r.includes('frontend') || r.includes('react') || r.includes('ui')) return 'frontend';
  if (r.includes('cloud') || r.includes('devops') || r.includes('aws')) return 'cloud';
  if (r.includes('machine learning') || r.includes('ai') || r.includes('ml')) return 'ai';
  return 'backend';
}

/**
 * CALL 1: TOPIC INFERENCE ENGINE
 * Input: User Profile (Company, Role, Experience, Skills, Language)
 * Output: Pure Topic Inference JSON (Coding Topics, Technical Topics, Learning Order)
 */
export const inferTopics = async (profile = {}) => {
  const company = profile.company || 'General Software Engineering';
  const role = profile.role || 'Software Engineer';
  const roleKey = inferRoleKey(role);
  const fallback = ROLE_TOPIC_KNOWLEDGE[roleKey] || ROLE_TOPIC_KNOWLEDGE.backend;

  const ai = getGeminiClient();
  if (!ai) {
    return fallback;
  }

  const prompt = `
You are the Topic Inference Engine for HackSprint.
Given a candidate's target company, role, experience, skills, and language, infer ONLY the target Coding Topics and Technical CS Topics.

DO NOT generate search queries.
DO NOT generate coding questions.
DO NOT return markdown (\`\`\`json).

MUST RETURN RAW VALID JSON ONLY:
{
  "codingTopics": [
    { "name": string, "priority": number }
  ],
  "technicalTopics": [
    { "name": string, "priority": number }
  ],
  "learningOrder": string[]
}

CANDIDATE PROFILE:
Company: ${company}
Role: ${role}
Experience: ${profile.experience || 'Not Specified'}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not Specified'}
Language: ${profile.language || 'Not Specified'}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.1 },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    if (parsed && Array.isArray(parsed.codingTopics) && parsed.codingTopics.length > 0) {
      return {
        codingTopics: parsed.codingTopics,
        technicalTopics: Array.isArray(parsed.technicalTopics) ? parsed.technicalTopics : fallback.technicalTopics,
        learningOrder: Array.isArray(parsed.learningOrder) ? parsed.learningOrder : fallback.learningOrder,
      };
    }
  } catch (err) {
    console.warn('[inferTopics Gemini Warning]:', err.message);
  }

  return fallback;
};

export default inferTopics;
