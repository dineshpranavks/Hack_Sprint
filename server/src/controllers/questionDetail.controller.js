import { getQuestionDetail } from '../services/questionDetail.service.js';
import {
  toggleBookmark,
  getUserBookmarks,
  trackRecentlyViewed,
  getUserRecentlyViewed,
} from '../services/userActivity.service.js';

/**
 * Controller for POST /api/agent/question-detail
 */
export const handleGetQuestionDetail = async (req, res, next) => {
  try {
    const { questionId, title, company, role, difficulty, category, topics, url, userId = 'guest' } = req.body;

    if (!questionId && !title) {
      return res.status(400).json({ error: 'Question ID or Title is required.' });
    }

    const questionData = {
      id: questionId || title.toLowerCase().replace(/\s+/g, '-'),
      title: title || questionId,
      company: company || 'Tech Company',
      role: role || 'Software Development Engineer',
      difficulty: difficulty || 'Medium',
      category: category || 'General',
      topics: topics || ['Algorithms'],
      url: url || null,
    };

    const detail = await getQuestionDetail(questionData);

    // Track in recently viewed
    await trackRecentlyViewed(userId, questionData.id, questionData);

    return res.status(200).json({
      status: 'success',
      questionId: questionData.id,
      detail,
    });
  } catch (error) {
    console.error('[handleGetQuestionDetail Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve question details.' });
  }
};

/**
 * Controller for POST /api/user/bookmark
 */
export const handleToggleBookmark = async (req, res, next) => {
  try {
    const { userId = 'guest', questionId, questionData } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required.' });
    }

    const result = await toggleBookmark(userId, questionId, questionData || {});
    return res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    console.error('[handleToggleBookmark Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to update bookmark.' });
  }
};

/**
 * Controller for GET /api/user/bookmarks/:userId
 */
export const handleGetUserBookmarks = async (req, res, next) => {
  try {
    const { userId = 'guest' } = req.params;
    const bookmarks = await getUserBookmarks(userId);
    return res.status(200).json({ status: 'success', userId, bookmarks });
  } catch (error) {
    console.error('[handleGetUserBookmarks Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch bookmarks.' });
  }
};

/**
 * Controller for GET /api/user/recently-viewed/:userId
 */
export const handleGetUserRecentlyViewed = async (req, res, next) => {
  try {
    const { userId = 'guest' } = req.params;
    const items = await getUserRecentlyViewed(userId);
    return res.status(200).json({ status: 'success', userId, items });
  } catch (error) {
    console.error('[handleGetUserRecentlyViewed Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch recently viewed questions.' });
  }
};

export default {
  handleGetQuestionDetail,
  handleToggleBookmark,
  handleGetUserBookmarks,
  handleGetUserRecentlyViewed,
};
