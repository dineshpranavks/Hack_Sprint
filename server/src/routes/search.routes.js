import { Router } from 'express';
import { handleRunSearch } from '../controllers/search.controller.js';

const router = Router();

// POST /api/search/run
router.post('/run', handleRunSearch);

export default router;
