import { getDb } from '../config/db.js';
import {
  extractIntent,
  generateFollowUpQuestion,
  updateConversation,
  validateConversation,
  generateSearchQueries as runGenerateSearchQueries,
  analyzeResults as runAnalyzeResults,
} from './aiAgent.service.js';
import { orchestrateSearch, removeDuplicateUrls, sortByRelevance } from './searchOrchestrator.service.js';
import { searchGithub } from './github.service.js';
import { searchStackOverflow } from './stackexchange.service.js';
import { searchReddit } from './reddit.service.js';
import { searchCodeforces } from './codeforces.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const ANALYSIS_COLLECTION = 'analysisResults';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

/**
 * Generate queries using aiAgent service with fallback.
 */
export const generateQueries = async (conversationId, fields, userId) => {
  try {
    return await runGenerateSearchQueries(conversationId, fields, userId);
  } catch (err) {
    console.warn('[generateQueries Warning]:', err.message);
    return [
      { topic: 'Dynamic Programming', query: `${fields?.company || 'Tech'} Dynamic Programming Problems`, priorityRating: 5 },
      { topic: 'Graphs', query: `${fields?.company || 'Tech'} Graph BFS DFS Problems`, priorityRating: 5 },
    ];
  }
};

/**
 * Execute Search using searchOrchestrator with fallback.
 */
export const search = async (conversationId, userId) => {
  try {
    return await orchestrateSearch(conversationId, userId);
  } catch (err) {
    console.warn('[search Warning]:', err.message);
    return { conversationId, totalCount: 0, results: [] };
  }
};

/**
 * Analyze search results using aiAgent service with fallback.
 */
export const analyze = async (conversationId) => {
  try {
    return await runAnalyzeResults(conversationId);
  } catch (err) {
    console.warn('[analyze Warning]:', err.message);
    return { summary: {}, topics: [] };
  }
};

/**
 * Check if analysis results already exist in Cloud Firestore for a conversation.
 */
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

/**
 * Format unified response structure expected by client.
 */
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
      categories: analysis.categories || [],
      priorityTopics: analysis.priorityTopics || [],
      learningRoadmap: analysis.learningRoadmap || [],
      recommendations: analysis.recommendations || [],
      companyInsights: analysis.companyInsights || [],
      interviewStrategy: analysis.interviewStrategy || [],
      weakAreas: analysis.weakAreas || [],
      similarTopics: analysis.similarTopics || [],
    },
    questions: questions || [],
  };
};

/**
 * Master Controller Method for POST /api/agent/message.
 * Supports both string userMessage and options object { message, userMessage, conversationId, userId }.
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

  // Step 1: Load existing session if conversationId provided
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

  // Step 2: Extract Intent
  let intentResult = null;
  try {
    intentResult = await extractIntent(currentChatHistory, existingFields);
  } catch (e) {
    console.warn('[processWorkflow extractIntent warning]:', e.message);
  }

  const updatedFields = intentResult?.fields || intentResult || existingFields;
  const { completed, missingFields } = validateConversation(updatedFields);

  // Step 3: Check if conversation is still collecting missing fields
  if (!completed) {
    let nextQuestion = "Could you please specify your target company, role, and experience level?";
    try {
      nextQuestion = await generateFollowUpQuestion(updatedFields, missingFields);
    } catch (fqErr) {
      console.warn('[generateFollowUpQuestion Warning]:', fqErr.message);
    }

    const savedDoc = await updateConversation(conversationId, currentChatHistory, updatedFields, userId);

    return {
      status: 'collecting',
      completed: false,
      conversation: savedDoc,
      nextQuestion,
    };
  }

  // Step 4: Criteria Completed! Update conversation status to completed
  const activeConversationId = conversationId || `conv-${Date.now()}`;
  const savedDoc = await updateConversation(activeConversationId, currentChatHistory, updatedFields, userId);

  const finalConversationId = activeConversationId;

  // Step 5: Check Firestore for existing cached analysis
  const cached = await getCachedAnalysis(finalConversationId);
  if (cached && cached.analysis) {
    console.log(`[Workflow Orchestrator] Returning cached analysis for conversationId ${finalConversationId}`);
    return {
      conversationId: finalConversationId,
      conversation: savedDoc,
      ...buildFrontendResponse(updatedFields, cached.analysis, cached.questions),
    };
  }

  // Step 6: Execute full workflow sequence automatically
  console.log(`[Workflow Orchestrator] Executing end-to-end workflow for conversationId ${finalConversationId}...`);

  // Step 6A: Generate Search Queries
  let queries = [];
  try {
    queries = await generateQueries(finalConversationId, updatedFields, userId);
  } catch (qErr) {
    console.warn('[Workflow Orchestrator generateQueries warning]:', qErr.message);
  }

  // Step 6B: Search All Sources (GitHub, StackOverflow, Reddit, Codeforces)
  let searchResults = { results: [] };
  try {
    searchResults = await search(finalConversationId, userId);
  } catch (sErr) {
    console.warn('[Workflow Orchestrator search warning]:', sErr.message);
  }

  // Step 6C: Analyze Search Results using Gemini
  let analysisResult = {};
  try {
    analysisResult = await analyze(finalConversationId);
  } catch (aErr) {
    console.warn('[Workflow Orchestrator analyze warning]:', aErr.message);
  }

  // Step 7: Build & Return Unified Payload
  return {
    conversationId: finalConversationId,
    conversation: savedDoc,
    ...buildFrontendResponse(updatedFields, analysisResult, searchResults.results || []),
  };
};

export default {
  generateQueries,
  search,
  analyze,
  getCachedAnalysis,
  buildFrontendResponse,
  processWorkflow,
};
