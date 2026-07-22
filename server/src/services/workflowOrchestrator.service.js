import { getDb } from '../config/db.js';
import {
  extractIntent,
  generateFollowUpQuestion,
  updateConversation,
  validateConversation,
  generateSearchQueries as runGenerateSearchQueries,
  analyzeResults as runAnalyzeResults,
} from './aiAgent.service.js';
import {
  generateInterviewBlueprint,
  validateInterviewBlueprint,
} from './blueprint.service.js';
import { orchestrateSearch } from './searchOrchestrator.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const ANALYSIS_COLLECTION = 'analysisResults';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

export const generateQueries = async (conversationId, fields, userId) => {
  try {
    return await runGenerateSearchQueries(conversationId, fields, userId);
  } catch (err) {
    console.warn('[generateQueries Warning]:', err.message);
    return [
      { topic: 'Arrays & Data Structures', query: `${fields?.company || 'General'} ${fields?.role || 'Software Engineer'} Coding Questions`, priorityRating: 5 },
    ];
  }
};

export const search = async (conversationId, userId) => {
  try {
    return await orchestrateSearch(conversationId, userId);
  } catch (err) {
    console.warn('[search Warning]:', err.message);
    return { conversationId, totalCount: 0, results: [] };
  }
};

export const analyze = async (conversationId) => {
  try {
    return await runAnalyzeResults(conversationId);
  } catch (err) {
    console.warn('[analyze Warning]:', err.message);
    return { summary: {}, topics: [] };
  }
};

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
    },
    questions: questions || [],
  };
};

/**
 * Master Workflow Orchestrator: Pipeline Execution
 * User Prompt -> Intent Extraction -> Interview Blueprint -> Blueprint Validation -> Query Builder -> Search Engine -> AI Ranking -> Frontend
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

  // STEP 1: Intent Extraction
  let intentResult = null;
  try {
    intentResult = await extractIntent(currentChatHistory, existingFields);
  } catch (e) {
    console.warn('[processWorkflow extractIntent warning]:', e.message);
  }

  const updatedFields = intentResult?.fields || intentResult || existingFields;

  // STEP 2: Generate Interview Blueprint
  let blueprint = await generateInterviewBlueprint(updatedFields);

  // STEP 10: Validate Interview Blueprint (If empty, regenerate)
  let isValidBlueprint = validateInterviewBlueprint(blueprint);
  if (!isValidBlueprint) {
    console.warn('[Workflow Orchestrator] Blueprint invalid/empty. Regenerating blueprint...');
    blueprint = await generateInterviewBlueprint(updatedFields);
  }

  // Save blueprint into updatedFields
  updatedFields.blueprint = blueprint;

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

  console.log(`[Workflow Orchestrator] Executing Interview Blueprint Pipeline for conversationId ${finalConversationId}...`);

  // STEP 3: Query Builder using Blueprint
  let queries = [];
  try {
    queries = await generateQueries(finalConversationId, updatedFields, userId);
  } catch (qErr) {
    console.warn('[Workflow Orchestrator generateQueries warning]:', qErr.message);
  }

  // STEP 4: Search Engine
  let searchResults = { results: [] };
  try {
    searchResults = await search(finalConversationId, userId);
  } catch (sErr) {
    console.warn('[Workflow Orchestrator search warning]:', sErr.message);
  }

  // STEP 6: AI Ranking & Topic Categorization
  let analysisResult = {};
  try {
    analysisResult = await analyze(finalConversationId);
  } catch (aErr) {
    console.warn('[Workflow Orchestrator analyze warning]:', aErr.message);
  }

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
