import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
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
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access denied');
    }
    return Promise.reject(error);
  }
);

export default api;
