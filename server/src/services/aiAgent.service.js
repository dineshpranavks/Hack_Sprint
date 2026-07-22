import { getGeminiClient } from '../config/gemini.js';
import { getDb, FieldValue } from '../config/db.js';
import { buildIntentPrompt } from '../prompts/intent.prompt.js';
import { buildQueryGenerationPrompt } from '../prompts/queryGeneration.prompt.js';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt.js';

const COLLECTION_NAME = 'conversationSessions';
const QUERIES_COLLECTION_NAME = 'generatedQueries';
const SEARCH_RESULTS_COLLECTION_NAME = 'searchResults';
const ANALYSIS_COLLECTION_NAME = 'analysisResults';

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

export const validateConversation = (fields = {}) => {
  return { completed: true, missingFields: [] };
};

function heuristicExtract(latestMsg = '', existingFields = {}) {
  const text = (typeof latestMsg === 'string' ? latestMsg : JSON.stringify(latestMsg)).toLowerCase();
  
  const companies = [
    'zoho', 'amazon', 'google', 'microsoft', 'meta', 'apple', 'netflix', 'uber',
    'linkedin', 'adobe', 'twitter', 'oracle', 'salesforce', 'flipkart', 'atlassian',
    'paypal', 'tcs', 'infosys', 'wipro', 'swiggy', 'zomato', 'goldman', 'walmart',
    'stripe', 'cisco', 'intel', 'nvidia'
  ];
  let comp = existingFields.company || null;
  for (const c of companies) {
    if (text.includes(c)) {
      comp = c.charAt(0).toUpperCase() + c.slice(1);
      if (c === 'tcs') comp = 'TCS';
      break;
    }
  }

  let role = existingFields.role || null;
  if (text.includes('frontend') || text.includes('react') || text.includes('ui')) {
    role = 'Frontend Engineer';
  } else if (text.includes('backend') || text.includes('node') || text.includes('spring')) {
    role = 'Backend Engineer';
  } else if (text.includes('cloud') || text.includes('devops') || text.includes('aws')) {
    role = 'Cloud/DevOps Engineer';
  } else if (text.includes('data engineer') || text.includes('spark') || text.includes('etl')) {
    role = 'Data Engineer';
  } else if (text.includes('machine learning') || text.includes('ml engineer') || text.includes('pytorch')) {
    role = 'Machine Learning Engineer';
  } else if (text.includes('sde2') || text.includes('sde 2') || text.includes('sde-2') || text.includes('sd2')) {
    role = 'Software Development Engineer II';
  } else if (text.includes('sde1') || text.includes('sde 1') || text.includes('sde-1') || text.includes('sd1') || text.includes('sd 1') || text.includes('sd-1')) {
    role = 'Software Development Engineer I';
  } else if (text.includes('sde3') || text.includes('sde 3') || text.includes('sde-3') || text.includes('sd3')) {
    role = 'Senior Software Engineer';
  }

  let exp = existingFields.experience || null;
  if (text.includes('5 years') || text.includes('5 yrs') || text.includes('6 years') || text.includes('senior')) {
    exp = 'Senior (5+ yrs)';
  } else if (text.includes('2 years') || text.includes('2 yrs') || text.includes('3 years') || text.includes('3 yrs')) {
    exp = 'Mid-Level (2-4 yrs)';
  } else if (text.includes('fresher') || text.includes('0 years') || text.includes('intern') || text.includes('graduate')) {
    exp = 'Junior / Fresher (0-1 yrs)';
  }

  const topics = [...(existingFields.topics || [])];
  const knownTopics = [
    'Dynamic Programming', 'Graphs', 'Trees', 'Sliding Window', 'Two Pointers',
    'Binary Search', 'Heap', 'Backtracking', 'Object Oriented Programming',
    'Database Management Systems', 'Operating Systems', 'Computer Networks'
  ];
  for (const t of knownTopics) {
    if (text.includes(t.toLowerCase()) && !topics.includes(t)) {
      topics.push(t);
    }
  }

  let lang = existingFields.language || null;
  if (text.includes('java') && !text.includes('javascript')) lang = 'Java';
  else if (text.includes('python')) lang = 'Python';
  else if (text.includes('c++') || text.includes('cpp')) lang = 'C++';
  else if (text.includes('javascript') || text.includes('js')) lang = 'JavaScript';

  return {
    company: comp,
    role,
    experience: exp,
    skills: existingFields.skills || [],
    technologies: existingFields.technologies || [],
    topics,
    difficulty: existingFields.difficulty || null,
    language: lang,
    interviewType: existingFields.interviewType || null,
    confidence: 0.95,
  };
}

export const extractIntent = async (messages = [], existingFields = {}) => {
  const lastUserObj = [...messages].reverse().find((m) => m.sender === 'user' || m.role === 'user');
  const latestUserMsg = lastUserObj?.text || lastUserObj?.content || (typeof lastUserObj === 'string' ? lastUserObj : '');

  const fallback = heuristicExtract(latestUserMsg, existingFields);
  const ai = getGeminiClient();
  if (!ai) {
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

  return {
    company: parsed?.company !== undefined ? parsed.company : (existingFields.company || fallback.company),
    role: parsed?.role !== undefined ? parsed.role : (existingFields.role || fallback.role),
    experience: parsed?.experience !== undefined ? parsed.experience : (existingFields.experience || fallback.experience),
    skills: Array.isArray(parsed?.skills) ? parsed.skills : (existingFields.skills || fallback.skills),
    technologies: Array.isArray(parsed?.technologies) ? parsed.technologies : (existingFields.technologies || fallback.technologies),
    topics: Array.isArray(parsed?.topics) ? parsed.topics : (existingFields.topics || fallback.topics),
    difficulty: parsed?.difficulty || existingFields.difficulty || null,
    language: parsed?.language || existingFields.language || fallback.language,
    interviewType: parsed?.interviewType || existingFields.interviewType || null,
    confidence: parsed?.confidence || 0.95,
  };
};

export const generateFollowUpQuestion = async (fields = {}, missingFields = []) => {
  const safeMissing = Array.isArray(missingFields) ? missingFields : [];
  if (!safeMissing.length) {
    return "Got it! Generating your custom interview preparation kit now!";
  }
  return `Could you please share your ${safeMissing.join(', ')}?`;
};

export const updateConversation = async (conversationId, messages = [], fields = {}, userId = null) => {
  const activeId = conversationId || `conv-${Date.now()}`;
  const db = getDb();

  const dataToSave = {
    userId: userId || null,
    conversationId: activeId,
    messages,
    chatHistory: messages,
    extractedFields: fields,
    fields,
    missingFields: [],
    completed: true,
    status: 'completed',
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
    completed: true,
    missingFields: [],
    status: 'completed',
    messages,
    chatHistory: messages,
  };
};

export const generateSearchQueries = async (conversationId, fields = {}, userId = null) => {
  const ai = getGeminiClient();
  const company = fields.company ? fields.company : 'General Software Engineering';
  const role = fields.role || 'Software Engineer';

  const defaultQueries = [
    { category: 'dsa', topic: 'Arrays & Two Pointers', query: `${company} ${role} Arrays Two Pointer Problems`, priorityRating: 5, rankCategory: 'Must Learn' },
    { category: 'dsa', topic: 'Sliding Window', query: `${company} ${role} Sliding Window Problems`, priorityRating: 5, rankCategory: 'Must Learn' },
    { category: 'dsa', topic: 'Dynamic Programming', query: `${company} ${role} Dynamic Programming Problems`, priorityRating: 4, rankCategory: 'Important' },
    { category: 'technical', topic: 'Object Oriented Programming', query: `${company} OOP Interview Questions`, priorityRating: 5, rankCategory: 'Must Learn' },
    { category: 'technical', topic: 'Database Management Systems', query: `${company} DBMS SQL Interview Questions`, priorityRating: 5, rankCategory: 'Must Learn' },
    { category: 'technical', topic: 'Operating Systems', query: `${company} Operating Systems Questions`, priorityRating: 4, rankCategory: 'Important' },
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
 * Backend Categorizer: Groups ACTUAL searchResults into topics without ANY fake questions.
 */
function buildCategorizedDsaTopics(profile = {}, searchResults = []) {
  const targetLabel = profile.company ? profile.company : 'General Software Engineering';
  const dsaItems = searchResults.filter(q => q && q.source !== 'technical');

  if (!dsaItems.length) return [];

  const groups = {};
  dsaItems.forEach((q) => {
    const topName = (q.topics && q.topics[0]) || (q.tags && q.tags[0]) || 'Arrays & Data Structures';
    if (!groups[topName]) {
      groups[topName] = [];
    }
    groups[topName].push({
      id: q.id || q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: q.title,
      source: q.source || 'codeforces',
      difficulty: q.difficulty || 'Medium',
      url: q.url || '',
      reasonRecommended: `Recommended DSA question for ${targetLabel}`,
    });
  });

  return Object.entries(groups).map(([name, qList]) => ({
    name,
    priorityRating: 5,
    rankCategory: 'Must Learn',
    explanation: `Targeted ${name} coding problems collected for ${targetLabel}.`,
    questionCount: qList.length,
    estimatedInterviewFrequency: 'Very High',
    questions: qList,
  }));
}

/**
 * Backend Categorizer: Groups ACTUAL technical searchResults into subject modules without ANY fake questions.
 */
function buildCategorizedTechnicalTopics(profile = {}, searchResults = []) {
  const targetLabel = profile.company ? profile.company : 'General Software Engineering';
  const techItems = searchResults.filter(q => q && (q.source === 'technical' || q.subject));

  if (!techItems.length) return [];

  const groups = {};
  techItems.forEach((q) => {
    const subName = q.subject || q.topic || 'Core CS Technical Concepts';
    if (!groups[subName]) {
      groups[subName] = [];
    }
    groups[subName].push({
      id: q.id || q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: q.title,
      source: 'technical',
      difficulty: q.difficulty || 'Easy',
      reasonRecommended: `Core concept question for ${targetLabel}`,
    });
  });

  return Object.entries(groups).map(([name, qList]) => ({
    name,
    priorityRating: 5,
    rankCategory: 'Must Learn',
    explanation: `Core technical interview subjects for ${targetLabel}.`,
    questionCount: qList.length,
    estimatedInterviewFrequency: 'Very High',
    questions: qList,
  }));
}

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

  const defaultDsa = buildCategorizedDsaTopics(profile, searchResults);
  const defaultTech = buildCategorizedTechnicalTopics(profile, searchResults);

  const ai = getGeminiClient();

  const defaultAnalysis = {
    summary: {
      company: profile.company || null,
      role: profile.role || null,
      experience: profile.experience || null,
      totalResults: searchResults.length,
      totalDsaTopics: defaultDsa.length,
      totalTechnicalTopics: defaultTech.length,
      confidence: 0.95,
    },
    dsaTopics: defaultDsa,
    technicalTopics: defaultTech,
    topics: [...defaultDsa, ...defaultTech],
    learningRoadmap: [],
    companyInsights: [],
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
      if (parsed?.dsaTopics || parsed?.technicalTopics || parsed?.summary) break;
    } catch (err) {
      console.warn(`[analyzeResults ${modelName} Note]:`, err.message);
    }
  }

  const analysisPayload = {
    userId: userId || null,
    conversationId,
    dsaTopics: parsed?.dsaTopics || defaultDsa,
    technicalTopics: parsed?.technicalTopics || defaultTech,
    topics: [...(parsed?.dsaTopics || defaultDsa), ...(parsed?.technicalTopics || defaultTech)],
    ...(parsed || defaultAnalysis),
  };

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
