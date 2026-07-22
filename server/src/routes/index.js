import { Router } from 'express';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'HackSprint API Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Mount sub-routers (e.g. router.use('/auth', authRouter), router.use('/questions', questionRouter), router.use('/ai', aiRouter))

export default router;
