import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Required for Laravel to detect AJAX
  },
  withCredentials: true, // Important for Sanctum cookie-based auth
  xsrfCookieName: 'XSRF-TOKEN', // Cookie name set by Sanctum
  xsrfHeaderName: 'X-XSRF-TOKEN', // Header name Laravel expects
});

// Flag to track if CSRF cookie has been fetched
let csrfInitialized = false;

// Function to initialize CSRF
const initCsrf = async () => {
  if (!csrfInitialized) {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    csrfInitialized = true;
  }
};

// Request interceptor to ensure CSRF token
api.interceptors.request.use(
  async (config) => {
    // Ensure CSRF cookie is set before mutating requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      await initCsrf();
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
    // If CSRF token mismatch, retry once after refreshing token
    if (error.response?.status === 419) {
      csrfInitialized = false;
      await initCsrf();
      return api.request(error.config);
    }
    if (error.response?.status === 401) {
      // Clear auth state from localStorage directly to prevent race condition
      localStorage.removeItem('t-store-auth');
      // Also clear Zustand store state immediately
      useAuthStore.getState().setUser(null);
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
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
