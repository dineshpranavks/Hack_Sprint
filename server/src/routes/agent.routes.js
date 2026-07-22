import { Router } from 'express';
import {
  handleAgentMessage,
  getAgentSession,
  handleGenerateQueries,
  handleAnalyzeResults,
} from '../controllers/agent.controller.js';

const router = Router();

// POST /api/agent/message
router.post('/message', handleAgentMessage);

// GET /api/agent/session/:conversationId
router.get('/session/:conversationId', getAgentSession);

// POST /api/agent/generate-queries
router.post('/generate-queries', handleGenerateQueries);

// POST /api/agent/analyze
router.post('/analyze', handleAnalyzeResults);

export default router;
