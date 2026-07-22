import { orchestrateSearch } from '../services/searchOrchestrator.service.js';

/**
 * Controller for POST /api/search/run
 */
export const handleRunSearch = async (req, res, next) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: { message: 'Conversation ID is required.' } });
    }

    const results = await orchestrateSearch(conversationId);

    return res.status(200).json({
      status: 'success',
      conversationId,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('[handleRunSearch Controller Error]:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Failed to execute search orchestration.',
      },
    });
  }
};

export default {
  handleRunSearch,
};
