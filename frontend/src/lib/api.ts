import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 API Request with token:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    
    // Only suppress 404 errors - 403 needs to be seen for debugging
    if (status !== 404 && status !== 409) {
      console.error('❌ API Error:', error.config?.url, status, error.response?.data);
    }

    if (status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath !== '/login' && currentPath !== '/signup') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
