import { Router } from 'express';
import agentRoutes from './agent.routes.js';
import searchRoutes from './search.routes.js';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'HackSprint API Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount Sub-routers
router.use('/agent', agentRoutes);
router.use('/search', searchRoutes);

export default router;
