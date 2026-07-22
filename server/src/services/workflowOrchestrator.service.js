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
 * Generate queries using aiAgent service.
 */
export const generateQueries = async (conversationId, fields, userId) => {
  return await runGenerateSearchQueries(conversationId, fields, userId);
};

/**
 * Perform parallel multi-source search across GitHub, StackOverflow, Reddit, and Codeforces.
 */
export const searchAllSources = async (queries = [], profile = {}) => {
  const [githubRes, stackRes, redditRes, codeforcesRes] = await Promise.all([
    searchGithub(queries, profile).catch((err) => {
      console.warn('[Workflow GitHub Search Warning]:', err.message);
      return [];
    }),
    searchStackOverflow(queries, profile).catch((err) => {
      console.warn('[Workflow StackOverflow Search Warning]:', err.message);
      return [];
    }),
    searchReddit(queries, profile).catch((err) => {
      console.warn('[Workflow Reddit Search Warning]:', err.message);
      return [];
    }),
    searchCodeforces(queries, profile).catch((err) => {
      console.warn('[Workflow Codeforces Search Warning]:', err.message);
      return [];
    }),
  ]);

  return mergeResults(githubRes, stackRes, redditRes, codeforcesRes);
};

/**
 * Merge, deduplicate, and rank search results.
 */
export const mergeResults = (githubRes = [], stackRes = [], redditRes = [], codeforcesRes = [], profile = {}) => {
  const combined = [...githubRes, ...stackRes, ...redditRes, ...codeforcesRes];
  const deduplicated = removeDuplicateUrls(combined);
  return sortByRelevance(deduplicated, profile).slice(0, 50);
};

/**
 * Execute Gemini intelligence analysis.
 */
export const analyzeResults = async (conversationId) => {
  return await runAnalyzeResults(conversationId);
};

/**
 * Check Firestore cache for existing analysis results.
 */
export const getCachedAnalysis = async (conversationId) => {
  const db = getDb();
  if (!db || !conversationId) return null;

  try {
    const analysisSnap = await db.collection(ANALYSIS_COLLECTION).doc(conversationId).get();
    if (!analysisSnap.exists) return null;

    const analysisData = analysisSnap.data();

    // Load matching search results
    let questions = [];
    const searchSnap = await db.collection(SEARCH_RESULTS_COLLECTION).doc(conversationId).get();
    if (searchSnap.exists) {
      questions = searchSnap.data()?.results || [];
    }

    return {
      analysis: analysisData,
      questions,
    };
  } catch (err) {
    console.warn('[getCachedAnalysis Warning]:', err.message);
    return null;
  }
};

/**
 * Build unified response payload for the frontend.
 */
export const buildFrontendResponse = (fields = {}, analysis = {}, questions = []) => {
  return {
    status: 'completed',
    completed: true,
    profile: {
      company: fields.company || null,
      role: fields.role || null,
      experience: fields.experience || null,
      skills: fields.skills || [],
      technologies: fields.technologies || [],
      interviewTypes: fields.interviewTypes || [],
    },
    analysis: {
      summary: analysis.summary || {},
      categories: analysis.categories || [],
      learningRoadmap: analysis.learningRoadmap || [],
      priorityTopics: analysis.priorityTopics || [],
      recommendations: analysis.recommendations || [],
      companyInsights: analysis.companyInsights || [],
      weakAreas: analysis.weakAreas || [],
      interviewStrategy: analysis.interviewStrategy || [],
      similarTopics: analysis.similarTopics || [],
    },
    questions,
  };
};

/**
 * Master Controller Method:
 * Executes full workflow: Conversation -> Query Generation -> Parallel Search -> AI Analysis -> Dashboard Payload
 */
export const processWorkflow = async ({ message, conversationId = null, userId = null }) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('User message is required.');
  }

  const trimmedMsg = message.trim();
  let existingFields = {};
  let existingHistory = [];

  // Step 1: Reload existing session from Firestore if conversationId is provided
  const db = getDb();
  if (conversationId && db) {
    try {
      const docSnap = await db.collection(SESSIONS_COLLECTION).doc(conversationId).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        existingFields = data.fields || {};
        existingHistory = data.chatHistory || [];
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
  const intentResult = await extractIntent(currentChatHistory, existingFields);

  if (!intentResult) {
    const fallbackQuestion = "I'm having trouble understanding your request. Could you rephrase it?";
    const savedDoc = await updateConversation({
      conversationId,
      userId,
      userMessage: trimmedMsg,
      assistantResponse: fallbackQuestion,
      updatedFields: existingFields,
      isCompleted: false,
    });

    return {
      status: 'collecting',
      completed: false,
      conversation: savedDoc,
      nextQuestion: fallbackQuestion,
    };
  }

  const { fields: updatedFields, missingFields } = intentResult;
  const { completed } = validateConversation(updatedFields);

  // Step 3: Check if conversation is still collecting missing fields
  if (!completed) {
    const nextQuestion = await generateFollowUpQuestion(currentChatHistory, missingFields, updatedFields);

    const savedDoc = await updateConversation({
      conversationId,
      userId,
      userMessage: trimmedMsg,
      assistantResponse: nextQuestion,
      updatedFields,
      isCompleted: false,
    });

    return {
      status: 'collecting',
      completed: false,
      conversation: savedDoc,
      nextQuestion,
    };
  }

  // Step 4: Criteria Completed! Update conversation status to completed
  const activeConversationId = conversationId || `conv-${Date.now()}`;
  const savedDoc = await updateConversation({
    conversationId: activeConversationId,
    userId,
    userMessage: trimmedMsg,
    assistantResponse: '',
    updatedFields,
    isCompleted: true,
  });

  const finalConversationId = savedDoc.id || activeConversationId;

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
  const queries = await generateQueries(finalConversationId, updatedFields, userId);

  // Step 6B: Search All Sources (GitHub, StackOverflow, Reddit, Codeforces)
  let searchResults = await orchestrateSearch(finalConversationId);

  // Step 6C: AI Intelligence Engine Analysis
  const analysis = await analyzeResults(finalConversationId);

  // Step 6D: Return unified response
  return {
    conversationId: finalConversationId,
    conversation: savedDoc,
    ...buildFrontendResponse(updatedFields, analysis || {}, searchResults || []),
  };
};

export default {
  processWorkflow,
  generateQueries,
  searchAllSources,
  mergeResults,
  analyzeResults,
  buildFrontendResponse,
};
