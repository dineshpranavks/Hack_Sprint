import { Router } from 'express';
import {
  handleGetQuestionDetail,
  handleToggleBookmark,
  handleGetUserBookmarks,
  handleGetUserRecentlyViewed,
} from '../controllers/questionDetail.controller.js';

const router = Router();

// Question Detail (supports both /question-detail and /agent/question-detail)
router.post('/question-detail', handleGetQuestionDetail);
router.post('/agent/question-detail', handleGetQuestionDetail);

// User Bookmarks & Recently Viewed
router.post('/user/bookmark', handleToggleBookmark);
router.get('/user/bookmarks/:userId', handleGetUserBookmarks);
router.get('/user/recently-viewed/:userId', handleGetUserRecentlyViewed);

export default router;
