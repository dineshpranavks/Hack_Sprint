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
 * Role Differentiation Blueprint Knowledge Matrix
 */
const BLUEPRINT_KNOWLEDGE_MATRIX = {
  frontend: {
    technicalSubjects: ['React', 'JavaScript (ES6+ & Event Loop)', 'TypeScript', 'DOM Manipulation', 'Browser Rendering & Critical Path', 'Web Performance & CSS'],
    dsaTopics: ['Arrays & String Parsing', 'Sliding Window', 'HashMap & HashSet', 'Two Pointers', 'Binary Search'],
    queries: (company) => [
      `${company} Frontend React Coding Questions`,
      `${company} JavaScript DOM Manipulation Problems`,
      `${company} Sliding Window Array Problems`,
      `${company} HashMap String Parsing Questions`,
      `${company} Web Performance JavaScript Questions`,
    ],
  },
  backend: {
    technicalSubjects: ['Node.js & Asynchronous I/O', 'Java & Spring Boot', 'REST API Architecture', 'Authentication & JWT Security', 'Caching & Redis', 'Database SQL & NoSQL', 'Concurrency & Thread Pools'],
    dsaTopics: ['Binary Trees & BST', 'Graphs & Network Traversal', 'Min-Heap / Priority Queue', 'Trie & Prefix Tree', 'Dynamic Programming'],
    queries: (company) => [
      `${company} Backend Node.js REST API Questions`,
      `${company} Java Database Concurrency Problems`,
      `${company} Graph Traversal BFS DFS Problems`,
      `${company} Binary Tree Lowest Common Ancestor Questions`,
      `${company} Heap Priority Queue Scheduling Problems`,
    ],
  },
  cloud: {
    technicalSubjects: ['AWS Core Infrastructure', 'Docker & Containerization', 'Kubernetes Orchestration', 'Linux Kernel & Shell Scripting', 'Computer Networks (OSI, TCP/IP, DNS)', 'Terraform Infrastructure as Code', 'System Monitoring & Logging'],
    dsaTopics: ['Graphs & Network Topologies', 'Greedy Resource Allocation', 'Shortest Path (Dijkstra)', 'Union Find (Disjoint Set)'],
    queries: (company) => [
      `${company} AWS Docker Cloud Questions`,
      `${company} Kubernetes Container Networking Problems`,
      `${company} Graph Shortest Path Dijkstra Questions`,
      `${company} Greedy Resource Scheduling Problems`,
      `${company} Union Find Network Connectivity Problems`,
    ],
  },
  ai: {
    technicalSubjects: ['Python Data Science Stack', 'PyTorch & Neural Networks', 'Transformers & Attention Mechanisms', 'Statistics & Probability', 'NumPy Matrix Operations', 'LLM Fine-Tuning & RAG Architecture'],
    dsaTopics: ['Heap & Min-Heap Beam Search', 'Priority Queue', 'Graph Neural Traversals', 'Dynamic Programming Optimization'],
    queries: (company) => [
      `${company} Machine Learning Python PyTorch Questions`,
      `${company} Transformer LLM Architecture Problems`,
      `${company} Priority Queue Beam Search Problems`,
      `${company} Matrix Transformation Array Questions`,
      `${company} Dynamic Programming Optimization Problems`,
    ],
  },
  mobile: {
    technicalSubjects: ['Android Architecture & Jetpack', 'Kotlin Coroutines & Flow', 'Swift & iOS Core Data', 'Jetpack Compose / SwiftUI UI', 'Flutter & Cross-Platform Engine'],
    dsaTopics: ['Arrays & String Parsing', 'Strings & Trie Search', 'Trees & View Hierarchies', 'HashMap Memory Caching'],
    queries: (company) => [
      `${company} Mobile Android Kotlin Questions`,
      `${company} iOS Swift UI Performance Problems`,
      `${company} Array String Parsing Questions`,
      `${company} Trie Prefix Search Problems`,
      `${company} HashMap Caching Questions`,
    ],
  },
  sde1: {
    technicalSubjects: ['Object Oriented Programming (OOP)', 'Database Management Systems (DBMS & SQL)', 'Operating Systems (Process vs Thread, Memory)', 'Computer Networks (TCP/UDP, HTTP/HTTPS)'],
    dsaTopics: ['Arrays & Two Pointers', 'HashMap & Frequency Counters', 'Recursion & Backtracking', 'Binary Trees & BST Operations', 'Sorting & Binary Search'],
    queries: (company) => [
      `${company} SDE1 Two Pointer Array Problems`,
      `${company} SDE1 HashMap Frequency Questions`,
      `${company} SDE1 Binary Tree Traversal Problems`,
      `${company} SDE1 Object Oriented Design Questions`,
      `${company} SDE1 Database SQL Query Problems`,
    ],
  },
  sde2: {
    technicalSubjects: ['System Design & High Availability', 'Distributed Systems & Consensus', 'Microservices Architecture', 'Concurrency, Lock-Free & Mutex', 'Database Sharding, Partitioning & Replication'],
    dsaTopics: ['Advanced Dynamic Programming', 'Complex Graph Traversals (Tarjan, Kosaraju)', 'Trie & Segment Tree', 'Advanced Tree & Ancestor Operations'],
    queries: (company) => [
      `${company} SDE2 Advanced Dynamic Programming Problems`,
      `${company} SDE2 Complex Graph Traversal Questions`,
      `${company} SDE2 Distributed System Design Problems`,
      `${company} SDE2 Concurrency Lock-Free Coding Questions`,
      `${company} SDE2 Segment Tree Prefix Questions`,
    ],
  },
};

/**
 * Infer exact Role Archetype from role string
 */
function matchRoleArchetype(role = '') {
  const r = (role || '').toLowerCase();
  if (r.includes('frontend') || r.includes('react') || r.includes('ui') || r.includes('web')) return 'frontend';
  if (r.includes('cloud') || r.includes('devops') || r.includes('infrastructure') || r.includes('aws')) return 'cloud';
  if (r.includes('machine learning') || r.includes('ai') || r.includes('ml') || r.includes('data scientist')) return 'ai';
  if (r.includes('mobile') || r.includes('android') || r.includes('ios') || r.includes('flutter')) return 'mobile';
  if (r.includes('sde1') || r.includes('sde 1') || r.includes('sd1') || r.includes('fresher') || r.includes('junior')) return 'sde1';
  if (r.includes('sde2') || r.includes('sde 2') || r.includes('sd2') || r.includes('senior') || r.includes('lead')) return 'sde2';
  return 'backend';
}

/**
 * Generate Interview Blueprint JSON object.
 */
export const generateInterviewBlueprint = async (intent = {}) => {
  const company = intent.company || 'General Software Engineering';
  const role = intent.role || 'Software Engineer';
  const archetypeKey = matchRoleArchetype(role);
  const matrix = BLUEPRINT_KNOWLEDGE_MATRIX[archetypeKey] || BLUEPRINT_KNOWLEDGE_MATRIX.backend;

  const defaultBlueprint = {
    company: intent.company || null,
    role,
    technicalSubjects: matrix.technicalSubjects,
    dsaTopics: matrix.dsaTopics,
    searchQueries: matrix.queries(company),
    priorityTopics: [matrix.dsaTopics[0], matrix.technicalSubjects[0]],
  };

  const ai = getGeminiClient();
  if (!ai) {
    return defaultBlueprint;
  }

  const prompt = `
You are a Senior Interview Architect at ${company}.
Your task is to generate a role-specific INTERVIEW BLUEPRINT for candidate target position: "${role}".

MUST RETURN RAW VALID JSON ONLY:
{
  "company": string | null,
  "role": string,
  "technicalSubjects": string[],
  "dsaTopics": string[],
  "searchQueries": string[],
  "priorityTopics": string[]
}

Rules:
1. "technicalSubjects" MUST contain ONLY technical subjects for THAT SPECIFIC ROLE.
2. "dsaTopics" MUST contain ONLY DSA topics relevant for THAT SPECIFIC ROLE.
3. "searchQueries" MUST generate 5-10 specific query strings like "${company} [Topic] Problems".
4. Do NOT output markdown (\`\`\`json).
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

    if (parsed && Array.isArray(parsed.technicalSubjects) && parsed.technicalSubjects.length > 0 && Array.isArray(parsed.dsaTopics) && parsed.dsaTopics.length > 0) {
      return {
        company: parsed.company || intent.company || null,
        role: parsed.role || role,
        technicalSubjects: parsed.technicalSubjects,
        dsaTopics: parsed.dsaTopics,
        searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0 ? parsed.searchQueries : matrix.queries(company),
        priorityTopics: Array.isArray(parsed.priorityTopics) ? parsed.priorityTopics : [parsed.dsaTopics[0], parsed.technicalSubjects[0]],
      };
    }
  } catch (err) {
    console.warn('[Blueprint Service Gemini Note]:', err.message);
  }

  return defaultBlueprint;
};

/**
 * STEP 10: BLUEPRINT VALIDATION
 * Validates that technicalSubjects and dsaTopics are non-empty.
 */
export const validateInterviewBlueprint = (blueprint = {}) => {
  const hasTech = Array.isArray(blueprint.technicalSubjects) && blueprint.technicalSubjects.length > 0;
  const hasDsa = Array.isArray(blueprint.dsaTopics) && blueprint.dsaTopics.length > 0;
  return hasTech && hasDsa;
};

export default {
  generateInterviewBlueprint,
  validateInterviewBlueprint,
};
