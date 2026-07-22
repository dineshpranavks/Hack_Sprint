import { Router } from 'express';
import {
  handleGetQuestionDetails,
  handleToggleBookmark,
  handleGetUserBookmarks,
  handleGetUserRecentlyViewed,
} from '../controllers/questionDetail.controller.js';

const router = Router();

// POST /api/question/details & POST /api/agent/question-detail
router.post('/question/details', handleGetQuestionDetails);
router.post('/agent/question-detail', handleGetQuestionDetails);
router.post('/question-detail', handleGetQuestionDetails);

// User Bookmarks & Recently Viewed
router.post('/user/bookmark', handleToggleBookmark);
router.get('/user/bookmarks/:userId', handleGetUserBookmarks);
router.get('/user/recently-viewed/:userId', handleGetUserRecentlyViewed);

export default router;
