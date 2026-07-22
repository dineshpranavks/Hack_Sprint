import { getDb } from '../config/db.js';
import { processWorkflow, getCachedAnalysis } from '../services/workflowOrchestrator.service.js';
import {
  generateSearchQueries,
  analyzeResults,
} from '../services/aiAgent.service.js';

const COLLECTION_NAME = 'conversationSessions';

/**
 * Controller for POST /api/agent/message
 * Executes Master Workflow Orchestrator:
 * Message -> Intent -> (Incomplete ? Ask Question : Generate Queries -> Parallel Search -> Gemini Analysis -> Dashboard Payload)
 */
export const handleAgentMessage = async (req, res, next) => {
  try {
    const { message, conversationId = null, userId = null } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: { message: 'User message is required.' } });
    }

    const workflowResult = await processWorkflow({
      message: message.trim(),
      conversationId,
      userId,
    });

    return res.status(200).json(workflowResult);
  } catch (error) {
    console.error('[handleAgentMessage Controller Error]:', error);
    return res.status(500).json({
      error: {
        message: error.message || "I'm having trouble processing your request. Could you try again?",
      },
    });
  }
};

/**
 * Controller for GET /api/agent/session/:conversationId
 */
export const getAgentSession = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({ error: { message: 'Conversation ID is required.' } });
    }

    const db = getDb();
    if (!db) {
      return res.status(404).json({ error: { message: 'Database unavailable.' } });
    }

    const docSnap = await db.collection(COLLECTION_NAME).doc(conversationId).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: { message: 'Conversation session not found.' } });
    }

    const data = docSnap.data();
    const isCompleted = data.status === 'completed' || !!data.completed;

    let cachedData = null;
    if (isCompleted) {
      cachedData = await getCachedAnalysis(conversationId);
    }

    return res.status(200).json({
      status: data.status || 'active',
      completed: isCompleted,
      conversation: {
        id: docSnap.id,
        chatHistory: data.messages || data.chatHistory || [],
        fields: data.extractedFields || data.fields || {},
        ...data,
      },
      analysis: cachedData?.analysis || null,
      questions: cachedData?.questions || [],
    });
  } catch (error) {
    console.error('[getAgentSession Controller Error]:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve conversation session.' } });
  }
};

/**
 * Controller for POST /api/agent/generate-queries
 */
export const handleGenerateQueries = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required.' });
    }

    const db = getDb();
    let fields = {};
    let userId = null;

    if (db) {
      const docSnap = await db.collection(COLLECTION_NAME).doc(conversationId).get();
      if (docSnap.exists) {
        fields = docSnap.data().fields || {};
        userId = docSnap.data().userId || null;
      }
    }

    const queries = await generateSearchQueries(conversationId, fields, userId);
    return res.status(200).json({ status: 'success', conversationId, queries });
  } catch (error) {
    console.error('[handleGenerateQueries Error]:', error);
    return res.status(500).json({ error: 'Failed to generate queries.' });
  }
};

/**
 * Controller for POST /api/agent/analyze
 */
export const handleAnalyzeResults = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required.' });
    }

    const analysisPayload = await analyzeResults(conversationId);
    return res.status(200).json({ status: 'success', conversationId, ...analysisPayload });
  } catch (error) {
    console.error('[handleAnalyzeResults Error]:', error);
    return res.status(500).json({ error: 'Failed to analyze search results.' });
  }
};

export default {
  handleAgentMessage,
  getAgentSession,
  handleGenerateQueries,
  handleAnalyzeResults,
};
