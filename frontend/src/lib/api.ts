import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Required for Laravel to detect AJAX
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // NEVER wipe auth state for the Google verify endpoint.
      // A 401 from that endpoint means "expired one-time token",
      // NOT "your session has expired". The LoginPage handles this error itself.
      const requestUrl = error.config?.url || '';
      const isGoogleVerify = requestUrl.includes('/auth/google/verify');
      const isOnLoginPage = window.location.pathname.includes('/login');

      if (!isGoogleVerify && !isOnLoginPage) {
        // Only redirect to login if user was previously authenticated (session expired)
        const hadToken = localStorage.getItem('auth_token');
        const hadAuth = localStorage.getItem('t-store-auth');
        
        // Clear auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('t-store-auth');
        useAuthStore.getState().setUser(null);
        
        // Only redirect if user was previously logged in (session expired)
        // Do NOT redirect guests who were never logged in
        if (hadToken || (hadAuth && JSON.parse(hadAuth)?.state?.isAuthenticated)) {
          if (!window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      }
    }
    if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access denied');
    }
    return Promise.reject(error);
  }
);

export default api;
