import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Add request interceptor to attach Firebase Auth Bearer token
api.interceptors.request.use(
  (config) => {
    // const token = await auth.currentUser?.getIdToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// TODO: Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
