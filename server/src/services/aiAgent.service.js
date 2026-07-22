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
function heuristicExtract(latestMsg, existingFields = {}) {
  const text = (latestMsg || '').toLowerCase();
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
  else if (text.includes('sde') || text.includes('software')) role = 'Software Development Engineer';

  let exp = existingFields.experience || null;
  const expMatch = text.match(/(\d+\+?\s*(years?|yrs?)|fresher|intern|final\s*year|college\s*student|student)/i);
  if (expMatch) {
    exp = expMatch[0];
  }

  const skills = [...(existingFields.skills || [])];
  if (text.includes('dp') || text.includes('dynamic programming')) skills.push('Dynamic Programming');
  if (text.includes('redis')) skills.push('Redis');
  if (text.includes('react')) skills.push('React');
  if (text.includes('node')) skills.push('Node.js');

  const mergedFields = {
    company: comp,
    role: role,
    experience: exp,
    skills: Array.from(new Set(skills)),
    technologies: Array.from(new Set([...(existingFields.technologies || [])])),
    interviewTypes: Array.from(new Set([...(existingFields.interviewTypes || [])])),
    seniority: existingFields.seniority || null,
  };

  const { missingFields } = validateConversation(mergedFields);
  return {
    fields: mergedFields,
    confidence: 0.85,
    missingFields,
  };
}

/**
 * Call Gemini to extract intent from user message & history.
 * Tries multiple models and falls back to heuristic extraction if needed.
 */
export const extractIntent = async (chatHistory = [], existingFields = {}) => {
  const ai = getGeminiClient();
  const latestMsg = chatHistory[chatHistory.length - 1]?.content || '';

  if (!ai) {
    console.warn('[extractIntent Note]: Gemini API client unavailable. Using heuristic fallback.');
    return heuristicExtract(latestMsg, existingFields);
  }

  const promptText = buildIntentPrompt(chatHistory, existingFields);

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

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      const parsed = await attemptCall(modelName);
      if (parsed) {
        return normalizeIntentResponse(parsed, existingFields);
      }
    } catch (err) {
      console.warn(`[extractIntent ${modelName} Note]:`, err.message);
    }
  }

  // Fallback to heuristic parser if Gemini API fails
  return heuristicExtract(latestMsg, existingFields);
};

/**
 * Normalize and merge extracted intent JSON with existing fields.
 */
function normalizeIntentResponse(extracted, existingFields = {}) {
  if (!extracted || typeof extracted !== 'object') {
    return null;
  }

  const mergedFields = {
    company: extracted.company || existingFields.company || null,
    role: extracted.role || existingFields.role || null,
    experience: extracted.experience || existingFields.experience || null,
    skills: Array.from(new Set([...(existingFields.skills || []), ...(extracted.skills || [])])),
    technologies: Array.from(new Set([...(existingFields.technologies || []), ...(extracted.technologies || [])])),
    interviewTypes: Array.from(new Set([...(existingFields.interviewTypes || []), ...(extracted.interviewTypes || [])])),
    seniority: extracted.seniority || existingFields.seniority || null,
  };

  const { missingFields } = validateConversation(mergedFields);

  return {
    fields: mergedFields,
    confidence: typeof extracted.confidence === 'number' ? extracted.confidence : 0.9,
    missingFields,
  };
}

/**
 * Call Gemini to generate a natural follow-up question.
 */
export const generateFollowUpQuestion = async (chatHistory = [], missingFields = [], currentFields = {}) => {
  const ai = getGeminiClient();
  
  const generateFallbackQuestion = () => {
    if (missingFields.includes('company')) {
      return "Which company are you preparing for (e.g. Amazon, Google, Microsoft)?";
    }
    if (missingFields.includes('role')) {
      return "What job role or title are you aiming for (e.g. Backend Developer, SDE-1)?";
    }
    if (missingFields.includes('experience')) {
      return "How many years of experience or what experience level do you have?";
    }
    return "Could you provide a bit more detail about your interview target?";
  };

  if (!ai) {
    return generateFallbackQuestion();
  }

  const promptText = buildFollowUpPrompt(missingFields, currentFields, chatHistory);

  const attemptCall = async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        temperature: 0.7,
      },
    });
    return (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
  };

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      const result = await attemptCall(modelName);
      if (result) return result;
    } catch (err) {
      console.warn(`[generateFollowUpQuestion ${modelName} Note]:`, err.message);
    }
  }

  return generateFallbackQuestion();
};

/**
 * Persist conversation and updated fields inside Cloud Firestore.
 */
export const updateConversation = async ({
  conversationId = null,
  userId = null,
  userMessage = '',
  assistantResponse = '',
  updatedFields = {},
  isCompleted = false,
}) => {
  const db = getDb();
  if (!db) {
    console.warn('[Firestore] Database instance unavailable. Operating in memory.');
    return {
      id: conversationId || `local-${Date.now()}`,
      userId,
      status: isCompleted ? 'completed' : 'active',
      completed: isCompleted,
      fields: updatedFields,
      chatHistory: [
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const collectionRef = db.collection(COLLECTION_NAME);
  const now = new Date().toISOString();

  const newUserMsg = { role: 'user', content: userMessage, timestamp: now };
  const newAssistantMsg = assistantResponse ? { role: 'assistant', content: assistantResponse, timestamp: now } : null;

  let docRef;
  let existingHistory = [];

  if (conversationId) {
    docRef = collectionRef.doc(conversationId);
    try {
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        existingHistory = data.chatHistory || [];
      }
    } catch (e) {
      console.warn('[updateConversation doc read note]:', e.message);
    }
  } else {
    docRef = collectionRef.doc();
  }

  const updatedHistory = [...existingHistory, newUserMsg];
  if (newAssistantMsg) {
    updatedHistory.push(newAssistantMsg);
  }

  const docPayload = {
    userId: userId || null,
    status: isCompleted ? 'completed' : 'active',
    completed: isCompleted,
    fields: updatedFields,
    chatHistory: updatedHistory,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!conversationId) {
    docPayload.createdAt = FieldValue.serverTimestamp();
  }

  try {
    await docRef.set(docPayload, { merge: true });
  } catch (err) {
    console.error('[Firestore updateConversation set Error]:', err.message);
  }

  return {
    id: docRef.id,
    userId: userId || null,
    status: isCompleted ? 'completed' : 'active',
    completed: isCompleted,
    fields: updatedFields,
    chatHistory: updatedHistory,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Generate 10 to 20 optimized search queries using Gemini from completed profile fields.
 */
export const generateSearchQueries = async (conversationId, fields = {}, userId = null) => {
  const { completed } = validateConversation(fields);
  if (!completed) {
    throw new Error('Conversation is incomplete.');
  }

  const ai = getGeminiClient();
  const defaultQueries = [
    { category: 'company', query: `${fields.company} ${fields.role} Interview` },
    { category: 'skills', query: `${fields.company} ${fields.role} Interview Questions` },
    { category: 'coding', query: `${fields.company} Dynamic Programming Questions` },
    { category: 'system_design', query: `${fields.company} System Design LLD` },
    { category: 'behavioral', query: `${fields.company} Leadership Principles` },
    { category: 'experience_level', query: `${fields.company} ${fields.role} ${fields.experience} Experience` },
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
 * Execute Phase 4 end-to-end intelligence analysis.
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

  const ai = getGeminiClient();
  const defaultAnalysis = {
    summary: {
      company: profile.company || null,
      role: profile.role || null,
      experience: profile.experience || null,
      totalResults: searchResults.length,
      recommendedQuestions: Math.min(searchResults.length, 10),
      confidence: 0.9,
    },
    categories: [
      {
        name: 'Backend',
        count: searchResults.length,
        questions: searchResults.map(r => ({
          title: r.title,
          source: r.source,
          difficulty: r.difficulty || 'Medium',
          category: 'Backend',
          reasonRecommended: `Relevant for ${profile.company || 'Tech'} ${profile.role || 'Developer'} interview`,
          shortExplanation: r.description || 'Practice core backend principles and algorithms.',
          estimatedInterviewFrequency: 'High',
          estimatedStudyTime: '45 mins',
        })),
      },
    ],
    priorityTopics: [
      { topic: 'System Design & Architecture', importance: 'High', reason: 'Critical for backend roles' },
      { topic: 'Data Structures & Algorithms', importance: 'High', reason: 'Essential for technical coding rounds' },
    ],
    learningRoadmap: [
      { step: 1, title: 'Core Data Structures', description: 'Master Arrays, HashMaps, Trees, and Graphs' },
      { step: 2, title: 'System Design & APIs', description: 'Study REST API design, caching, and database indexing' },
    ],
    recommendations: [
      { title: 'Focus on Company Specific Patterns', reason: `High probability of occurrence in ${profile.company || 'target'} rounds` },
    ],
    companyInsights: [
      { title: `${profile.company || 'Target Company'} Prep`, description: 'Emphasis on clean code, scalability, and problem solving.' },
    ],
    interviewStrategy: [
      { title: 'Study Priority', description: 'Start with high-frequency coding patterns first, then move to System Design.' },
    ],
    weakAreas: [
      { topic: 'System Design LLD', reason: 'Recommended for mid/senior level roles' },
    ],
    similarTopics: [
      { topic: 'Data Structures', related: ['Array', 'HashMap', 'Trees', 'Graphs'] },
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
      if (parsed?.summary) break;
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
