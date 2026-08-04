import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

// Axios interceptor to append authorization header dynamically
export const setupApiInterceptors = (getToken) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        // Retrieve JWT token from active Clerk session
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to append Auth token to request headers", error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;