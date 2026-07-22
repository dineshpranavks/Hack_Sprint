import { getGeminiClient } from '../config/gemini.js';
import { getDb, FieldValue } from '../config/db.js';
import { buildIntentPrompt } from '../prompts/intent.prompt.js';
import { buildFollowUpPrompt } from '../prompts/followup.prompt.js';
import { buildQueryGenerationPrompt } from '../prompts/queryGeneration.prompt.js';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt.js';

const REQUIRED_FIELDS = ['company', 'role', 'experience'];
const COLLECTION_NAME = 'conversationSessions';
const QUERIES_COLLECTION_NAME = 'generatedQueries';
const SEARCH_RESULTS_COLLECTION_NAME = 'searchResults';
const ANALYSIS_COLLECTION_NAME = 'analysisResults';

/**
 * Clean JSON text by stripping markdown code blocks if present.
 */
function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Validate conversation fields against required criteria.
 */
export const validateConversation = (fields = {}) => {
  const missingFields = REQUIRED_FIELDS.filter((f) => {
    const val = fields[f];
    return !val || (typeof val === 'string' && val.trim().length === 0);
  });

  const completed = missingFields.length === 0;
  return { completed, missingFields };
};

/**
 * Smart heuristic extraction fallback if Gemini API is unavailable or throws errors.
 */
function heuristicExtract(latestMsg = '', existingFields = {}) {
  const text = (typeof latestMsg === 'string' ? latestMsg : JSON.stringify(latestMsg)).toLowerCase();
  const companies = ['amazon', 'google', 'microsoft', 'meta', 'apple', 'netflix', 'uber', 'linkedin', 'adobe', 'twitter', 'oracle'];
  
  let comp = existingFields.company || null;
  for (const c of companies) {
    if (text.includes(c)) {
      comp = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  let role = existingFields.role || null;
  if (text.includes('backend')) role = 'Backend Developer';
  else if (text.includes('frontend')) role = 'Frontend Engineer';
  else if (text.includes('fullstack') || text.includes('full stack')) role = 'Fullstack Engineer';
  else if (text.includes('sde') || text.includes('software') || text.includes('developer') || text.includes('engineer')) role = 'Software Development Engineer';

  let exp = existingFields.experience || null;
  if (text.includes('senior') || text.includes('lead') || text.includes('5') || text.includes('6') || text.includes('7')) {
    exp = 'Senior (5+ yrs)';
  } else if (text.includes('mid') || text.includes('2') || text.includes('3') || text.includes('4')) {
    exp = 'Mid-Level (2-4 yrs)';
  } else if (
    text.includes('student') || text.includes('fresher') || text.includes('junior') || text.includes('graduate') ||
    text.includes('entry') || text.includes('intern') || text.includes('0') || text.includes('1') ||
    text.includes('experience yet') || text.includes('final-year') || text.includes('college')
  ) {
    exp = 'Junior / Fresher (0-1 yrs)';
  }

  // Fallback defaults for interview intent if company or role was detected
  if (!comp && (text.includes('interview') || text.includes('coding') || text.includes('prep'))) comp = 'Target Tech Company';
  if (!role && (text.includes('interview') || text.includes('coding') || text.includes('prep'))) role = 'Software Engineer';
  if (!exp && (comp || role)) exp = 'Junior / Fresher (0-1 yrs)';

  return {
    company: comp,
    role: role || existingFields.role || null,
    experience: exp || existingFields.experience || null,
    skills: existingFields.skills || ['DSA', 'Problem Solving'],
    technologies: existingFields.technologies || [],
    interviewTypes: existingFields.interviewTypes || ['Coding'],
    seniority: existingFields.seniority || exp || null,
  };
}

/**
 * Extract candidate fields using Gemini with fallback.
 */
export const extractIntent = async (messages = [], existingFields = {}) => {
  const lastUserObj = [...messages].reverse().find((m) => m.sender === 'user' || m.role === 'user');
  const latestUserMsg = lastUserObj?.text || lastUserObj?.content || (typeof lastUserObj === 'string' ? lastUserObj : '');

  const fallback = heuristicExtract(latestUserMsg, existingFields);
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('[extractIntent Note]: Gemini API key unavailable. Using smart heuristic extraction.');
    return fallback;
  }

  const promptText = buildIntentPrompt(messages, existingFields);

  const attemptCall = async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  };

  let parsed = null;
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      parsed = await attemptCall(modelName);
      if (parsed) break;
    } catch (err) {
      console.warn(`[extractIntent ${modelName} Note]:`, err.message);
    }
  }

  const result = {
    company: parsed?.company || existingFields.company || fallback.company,
    role: parsed?.role || existingFields.role || fallback.role,
    experience: parsed?.experience || existingFields.experience || fallback.experience,
    skills: Array.isArray(parsed?.skills) ? parsed.skills : existingFields.skills || ['DSA'],
    technologies: Array.isArray(parsed?.technologies) ? parsed.technologies : existingFields.technologies || [],
    interviewTypes: Array.isArray(parsed?.interviewTypes) ? parsed.interviewTypes : existingFields.interviewTypes || ['Coding'],
    seniority: parsed?.seniority || parsed?.experience || existingFields.seniority || fallback.experience,
  };

  return result;
};

/**
 * Generate a follow-up question asking ONLY for missing fields.
 */
export const generateFollowUpQuestion = async (fields = {}, missingFields = []) => {
  if (!missingFields.length) {
    return "Great! I have all the details needed. Generating your custom DSA Topic recommendations now!";
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fieldName = missingFields[0];
    if (fieldName === 'company') return "Which company are you preparing for (e.g. Amazon, Google, Meta, Microsoft)?";
    if (fieldName === 'role') return "What target role are you interviewing for (e.g. Backend Developer, SDE-2, Fullstack)?";
    if (fieldName === 'experience') return "What is your experience level (e.g. Junior 0-2 yrs, Mid-Level 2-4 yrs, Senior 5+ yrs)?";
    return `Could you please specify your ${missingFields.join(', ')}?`;
  }

  const promptText = buildFollowUpPrompt(fields, missingFields);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: { temperature: 0.4 },
    });
    return response.text?.trim() || `Could you please provide your ${missingFields.join(', ')}?`;
  } catch (err) {
    return `Could you please share your ${missingFields.join(', ')} so I can build your tailored DSA prep kit?`;
  }
};

/**
 * Update conversation state in Cloud Firestore.
 */
export const updateConversation = async (conversationId, messages = [], fields = {}, userId = null) => {
  const activeId = conversationId || `conv-${Date.now()}`;
  const { completed, missingFields } = validateConversation(fields);
  const db = getDb();

  const dataToSave = {
    userId: userId || null,
    conversationId: activeId,
    messages,
    chatHistory: messages,
    extractedFields: fields,
    fields,
    missingFields,
    completed,
    status: completed ? 'completed' : 'in_progress',
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (db && activeId) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(activeId);
      const snap = await docRef.get();
      if (!snap.exists) {
        dataToSave.createdAt = FieldValue.serverTimestamp();
      }
      await docRef.set(dataToSave, { merge: true });
    } catch (err) {
      console.error('[Firestore updateConversation Error]:', err.message);
    }
  }

  return {
    id: activeId,
    conversationId: activeId,
    fields,
    completed,
    missingFields,
    status: dataToSave.status,
    messages,
    chatHistory: messages,
  };
};

/**
 * Generate 20 to 40 DSA topic search queries using Gemini from completed profile fields.
 */
export const generateSearchQueries = async (conversationId, fields = {}, userId = null) => {
  const { completed } = validateConversation(fields);
  if (!completed) {
    throw new Error('Conversation is incomplete.');
  }

  const ai = getGeminiClient();
  const company = fields.company || 'Tech';
  const defaultQueries = [
    { topic: 'Dynamic Programming', query: `${company} Dynamic Programming Problems`, priorityRating: 5 },
    { topic: 'Graphs', query: `${company} Graph BFS DFS Problems`, priorityRating: 5 },
    { topic: 'Sliding Window', query: `${company} Sliding Window Two Pointer Problems`, priorityRating: 5 },
    { topic: 'Binary Search', query: `${company} Binary Search Problems`, priorityRating: 4 },
    { topic: 'Trees & BST', query: `${company} Binary Tree Problems`, priorityRating: 4 },
    { topic: 'Heap & Priority Queue', query: `${company} Heap Priority Queue Problems`, priorityRating: 4 },
    { topic: 'Backtracking', query: `${company} Backtracking Recursion Problems`, priorityRating: 4 },
    { topic: 'HashMap & Strings', query: `${company} HashMap Array String Problems`, priorityRating: 4 },
    { topic: 'Prefix Sum', query: `${company} Prefix Sum Range Query Problems`, priorityRating: 3 },
    { topic: 'Union Find', query: `${company} Union Find DSU Problems`, priorityRating: 3 },
  ];

  if (!ai) {
    return defaultQueries;
  }

  const promptText = buildQueryGenerationPrompt(fields);

  const attemptCall = async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  };

  let parsed = null;
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      parsed = await attemptCall(modelName);
      if (parsed?.queries) break;
    } catch (err) {
      console.warn(`[generateSearchQueries ${modelName} Note]:`, err.message);
    }
  }

  const queries = (parsed && Array.isArray(parsed.queries)) ? parsed.queries : defaultQueries;

  // Save to Cloud Firestore
  const db = getDb();
  if (db && conversationId) {
    try {
      const queriesCollection = db.collection(QUERIES_COLLECTION_NAME);
      const queryDocRef = queriesCollection.doc(conversationId);
      await queryDocRef.set({
        userId: userId || null,
        conversationId,
        queries,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (dbErr) {
      console.error('[Firestore generatedQueries Save Error]:', dbErr.message);
    }
  }

  return queries;
};

/**
 * Group search results into DSA topics for fallbacks.
 */
function buildDefaultDsaTopics(profile = {}, searchResults = []) {
  const company = profile.company || 'Tech Company';
  const role = profile.role || 'Software Engineer';

  // Group items by topic tags
  const dpQuestions = searchResults.filter(r => (r.topics || r.tags || []).some(t => t.toLowerCase().includes('dp') || t.toLowerCase().includes('dynamic')));
  const graphQuestions = searchResults.filter(r => (r.topics || r.tags || []).some(t => t.toLowerCase().includes('graph') || t.toLowerCase().includes('dfs') || t.toLowerCase().includes('bfs')));
  const treeQuestions = searchResults.filter(r => (r.topics || r.tags || []).some(t => t.toLowerCase().includes('tree')));
  const otherQuestions = searchResults.filter(r => !dpQuestions.includes(r) && !graphQuestions.includes(r) && !treeQuestions.includes(r));

  return [
    {
      name: 'Dynamic Programming',
      priorityRating: 5,
      explanation: `High frequency in ${company} ${role} technical rounds (knapsack, state transitions, memoization).`,
      questionCount: dpQuestions.length || 5,
      estimatedInterviewFrequency: 'Very High',
      questions: dpQuestions.length ? dpQuestions : [
        { id: 'water-overflow', title: 'Water Overflow / DP State Transition', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset', reasonRecommended: `High frequency DP pattern for ${company}` },
        { id: 'cut-ribbon', title: 'Cut Ribbon (Unbounded Knapsack)', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset', reasonRecommended: `Classic DP optimization question for ${company}` },
      ],
    },
    {
      name: 'Graphs & BFS/DFS',
      priorityRating: 5,
      explanation: `Crucial for ${role} roles evaluating shortest paths, grid traversals, and topological sorting.`,
      questionCount: graphQuestions.length || 6,
      estimatedInterviewFrequency: 'Very High',
      questions: graphQuestions.length ? graphQuestions : [
        { id: 'lunar-new-year-and-a-wander', title: 'Lunar New Year and a Wander (Graph Traversal)', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset', reasonRecommended: `Graph BFS/DFS priority queue pattern for ${company}` },
        { id: 'two-buttons', title: 'Two Buttons (Shortest Path BFS)', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset', reasonRecommended: `State-space BFS graph search for ${company}` },
      ],
    },
    {
      name: 'Trees & Binary Search Trees',
      priorityRating: 4,
      explanation: `Evaluates recursive tree traversals, BST operations, and LCA algorithms.`,
      questionCount: treeQuestions.length || 5,
      estimatedInterviewFrequency: 'High',
      questions: treeQuestions.length ? treeQuestions : [
        { id: 'k-tree', title: 'k-Tree (Tree DP & Traversal)', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset', reasonRecommended: `Tree traversal & DP recurrence pattern` },
      ],
    },
    {
      name: 'Arrays, HashMap & Two Pointers',
      priorityRating: 4,
      explanation: `Foundational DSA topic tested in initial phone screens.`,
      questionCount: otherQuestions.length || 8,
      estimatedInterviewFrequency: 'High',
      questions: otherQuestions.length ? otherQuestions : [
        { id: 't-primes', title: 'T-primes (Number Theory & Binary Search)', source: 'codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/230/B', reasonRecommended: `High frequency problem asked in ${company} coding rounds` },
      ],
    },
  ];
}

/**
 * Execute Phase 4 end-to-end intelligence analysis (DSA Topic Centric).
 */
export const analyzeResults = async (conversationId) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required for AI analysis.');
  }

  const db = getDb();
  let profile = {};
  let queries = [];
  let searchResults = [];
  let userId = null;

  if (db) {
    try {
      const sessionSnap = await db.collection(COLLECTION_NAME).doc(conversationId).get();
      if (sessionSnap.exists) {
        const sData = sessionSnap.data();
        profile = sData.fields || {};
        userId = sData.userId || null;
      }

      const queriesSnap = await db.collection(QUERIES_COLLECTION_NAME).doc(conversationId).get();
      if (queriesSnap.exists) {
        const qData = queriesSnap.data();
        queries = qData.queries || [];
      }

      const searchSnap = await db.collection(SEARCH_RESULTS_COLLECTION_NAME).doc(conversationId).get();
      if (searchSnap.exists) {
        const srData = searchSnap.data();
        searchResults = srData.results || [];
      }
    } catch (dbErr) {
      console.warn('[analyzeResults Firestore Load Warning]:', dbErr.message);
    }
  }

  const defaultTopics = buildDefaultDsaTopics(profile, searchResults);

  const ai = getGeminiClient();
  const defaultAnalysis = {
    summary: {
      company: profile.company || null,
      role: profile.role || null,
      experience: profile.experience || null,
      totalResults: searchResults.length,
      totalTopics: defaultTopics.length,
      confidence: 0.95,
    },
    topics: defaultTopics,
    learningRoadmap: [
      { step: 1, title: 'Master Core Data Structures', description: 'Focus on Arrays, HashMaps, Trees, and Graphs first.' },
      { step: 2, title: 'Advanced Algorithmic Patterns', description: 'Practice Dynamic Programming, Sliding Window, and Backtracking.' },
    ],
    companyInsights: [
      { title: `${profile.company || 'Target Company'} DSA Expectations`, description: 'High emphasis on clean code modularity, state space analysis, and optimal time complexities.' },
    ],
  };

  if (!ai) {
    return defaultAnalysis;
  }

  const promptText = buildAnalysisPrompt(profile, queries, searchResults);

  const attemptCall = async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  };

  let parsed = null;
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      parsed = await attemptCall(modelName);
      if (parsed?.topics || parsed?.summary) break;
    } catch (err) {
      console.warn(`[analyzeResults ${modelName} Note]:`, err.message);
    }
  }

  const analysisPayload = {
    userId: userId || null,
    conversationId,
    ...(parsed || defaultAnalysis),
  };

  // Save to Cloud Firestore
  if (db && conversationId) {
    try {
      const docRef = db.collection(ANALYSIS_COLLECTION_NAME).doc(conversationId);
      await docRef.set({
        ...analysisPayload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (dbErr) {
      console.error('[Firestore analysisResults Save Error]:', dbErr.message);
    }
  }

  return analysisPayload;
};

export default {
  extractIntent,
  generateFollowUpQuestion,
  updateConversation,
  validateConversation,
  generateSearchQueries,
  analyzeResults,
};
