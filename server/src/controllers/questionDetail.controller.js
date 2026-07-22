import { getQuestionDetail } from '../services/questionDetail.service.js';
import {
  toggleBookmark,
  getUserBookmarks,
  trackRecentlyViewed,
  getUserRecentlyViewed,
} from '../services/userActivity.service.js';

/**
 * Controller for POST /api/question/details
 */
export const handleGetQuestionDetails = async (req, res, next) => {
  try {
    const { questionId, source, title, description, difficulty, topics, company, url, userId = 'guest' } = req.body;

    const targetId = questionId || (title ? title.toLowerCase().replace(/\s+/g, '-') : null);
    if (!targetId) {
      return res.status(400).json({ error: 'Question ID or Title is required.' });
    }

    const questionData = {
      questionId: targetId,
      source: source || 'all',
      title: title || targetId,
      description: description || '',
      difficulty: difficulty || 'Medium',
      topics: topics || ['Algorithms'],
      company: company || 'Tech Company',
      url: url || null,
    };

    const details = await getQuestionDetail(questionData);

    // Track recently viewed
    await trackRecentlyViewed(userId, targetId, questionData);

    return res.status(200).json(details);
  } catch (error) {
    console.error('[handleGetQuestionDetails Controller Error]:', error);
    return res.status(500).json({ error: 'Unable to generate detailed explanation.' });
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
  handleGetQuestionDetails,
  handleToggleBookmark,
  handleGetUserBookmarks,
  handleGetUserRecentlyViewed,
};
