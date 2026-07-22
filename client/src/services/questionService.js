import api from './api';

export const questionService = {
  getQuestions: async (params) => {
    // TODO: Implement API call to fetch questions with pagination & filters
    return api.get('/questions', { params });
  },
  getQuestionById: async (id) => {
    // TODO: Implement API call to fetch single question detail
    return api.get(`/questions/${id}`);
  },
  generateAIQuestion: async (payload) => {
    // TODO: Implement API call to trigger AI question generation
    return api.post('/ai/generate-question', payload);
  },
};
