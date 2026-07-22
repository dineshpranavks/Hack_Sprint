import api from './api';

export const authService = {
  login: async (credentials) => {
    // TODO: Implement login API call
    return api.post('/auth/login', credentials);
  },
  logout: async () => {
    // TODO: Implement logout API call / Firebase signout
    return api.post('/auth/logout');
  },
  getCurrentUser: async () => {
    // TODO: Fetch user profile information
    return api.get('/users/profile');
  },
};
