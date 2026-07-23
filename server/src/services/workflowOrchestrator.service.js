import { getDb } from '../config/db.js';
import {
  extractIntent,
  generateFollowUpQuestion,
  updateConversation,
  validateConversation,
  recommendQuestions as runRecommendQuestions,
} from './aiAgent.service.js';
import { inferTopics } from './topicInference.service.js';
import { runSearchOrchestrator } from './searchOrchestrator.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const ANALYSIS_COLLECTION = 'analysisResults';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

export const getCachedAnalysis = async (conversationId) => {
  const db = getDb();
  if (!db || !conversationId) return null;

  try {
    const analysisSnap = await db.collection(ANALYSIS_COLLECTION).doc(conversationId).get();
    const searchSnap = await db.collection(SEARCH_RESULTS_COLLECTION).doc(conversationId).get();

    if (analysisSnap.exists) {
      return {
        analysis: analysisSnap.data(),
        questions: searchSnap.exists ? searchSnap.data().results || [] : [],
      };
    }
  } catch (err) {
    console.warn('[getCachedAnalysis Firestore Warning]:', err.message);
  }
  return null;
};

export const buildFrontendResponse = (profile = {}, analysis = {}, questions = []) => {
  return {
    status: 'completed',
    completed: true,
    profile: {
      company: profile.company || null,
      role: profile.role || null,
      experience: profile.experience || null,
      skills: profile.skills || [],
      technologies: profile.technologies || [],
      interviewTypes: profile.interviewTypes || [],
      seniority: profile.seniority || profile.experience || null,
    },
    analysis: {
      summary: analysis.summary || {},
      topics: analysis.topics || [],
      dsaTopics: analysis.dsaTopics || [],
      technicalTopics: analysis.technicalTopics || [],
      learningRoadmap: analysis.learningRoadmap || [],
      companyInsights: analysis.companyInsights || [],
      error: analysis.error || null,
    },
    questions: questions || [],
  };
};

/**
 * Master Execution Flow: Exactly 2 Gemini Calls
 * 1. Intent Extraction -> CALL 1: inferTopics(profile)
 * 2. Search Engine: runSearchOrchestrator(conversationId, topicNames)
 * 3. CALL 2: recommendQuestions(conversationId, profile, topicsInferred, searchResults)
 */
export const processWorkflow = async (userMessageParam, conversationIdParam = null, userIdParam = 'guest') => {
  let userMessage = typeof userMessageParam === 'string' ? userMessageParam : userMessageParam?.message || userMessageParam?.userMessage || '';
  let conversationId = typeof userMessageParam === 'object' ? userMessageParam?.conversationId || conversationIdParam : conversationIdParam;
  let userId = typeof userMessageParam === 'object' ? userMessageParam?.userId || userIdParam : userIdParam || 'guest';

  const trimmedMsg = (userMessage || '').trim();
  if (!trimmedMsg) {
    throw new Error('Message content is required.');
  }

  const db = getDb();
  let existingFields = {};
  let existingHistory = [];

  if (db && conversationId) {
    try {
      const docSnap = await db.collection(SESSIONS_COLLECTION).doc(conversationId).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        existingFields = data.extractedFields || data.fields || {};
        existingHistory = data.messages || data.chatHistory || [];
      }
    } catch (e) {
      console.warn('[processWorkflow Session Load Warning]:', e.message);
    }
  }

  const currentChatHistory = [
    ...existingHistory,
    { role: 'user', content: trimmedMsg },
  ];

  // Intent Extraction
  let intentResult = null;
  try {
    intentResult = await extractIntent(currentChatHistory, existingFields);
  } catch (e) {
    console.warn('[processWorkflow extractIntent warning]:', e.message);
  }

  const updatedFields = intentResult?.fields || intentResult || existingFields;
  const activeConversationId = conversationId || `conv-${Date.now()}`;
  const savedDoc = await updateConversation(activeConversationId, currentChatHistory, updatedFields, userId);
  const finalConversationId = activeConversationId;

  // Check cache
  const cached = await getCachedAnalysis(finalConversationId);
  if (cached && cached.analysis) {
    return {
      conversationId: finalConversationId,
      conversation: savedDoc,
      ...buildFrontendResponse(updatedFields, cached.analysis, cached.questions),
    };
  }

  console.log(`[Workflow Orchestrator] Starting 2-Call AI Pipeline for ${finalConversationId}...`);

  // STEP 1: GEMINI CALL 1 — TOPIC INFERENCE ENGINE
  let topicsInferred = { codingTopics: [], technicalTopics: [], learningOrder: [] };
  try {
    topicsInferred = await inferTopics(updatedFields);
  } catch (tErr) {
    console.warn('[Workflow Orchestrator inferTopics warning]:', tErr.message);
  }

  const topicNames = [
    ...topicsInferred.codingTopics.map(t => t.name),
    ...topicsInferred.technicalTopics.map(t => t.name),
  ];

  // STEP 2: SEARCH ENGINE (Data Collector ONLY consuming topic names)
  let searchPayload = { results: [] };
  try {
    searchPayload = await runSearchOrchestrator(finalConversationId, topicNames, userId);
  } catch (sErr) {
    console.warn('[Workflow Orchestrator Search Engine warning]:', sErr.message);
  }

  // STEP 3: GEMINI CALL 2 — AI RECOMMENDATION ENGINE
  let analysisResult = {};
  try {
    analysisResult = await runRecommendQuestions(finalConversationId, updatedFields, topicsInferred, searchPayload.results || []);
  } catch (aErr) {
    console.warn('[Workflow Orchestrator recommendQuestions warning]:', aErr.message);
  }

  return {
    conversationId: finalConversationId,
    conversation: savedDoc,
    ...buildFrontendResponse(updatedFields, analysisResult, searchPayload.results || []),
  };
};

export default {
  getCachedAnalysis,
  buildFrontendResponse,
  processWorkflow,
};
