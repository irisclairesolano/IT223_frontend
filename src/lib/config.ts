import axios from 'axios';

export const API_BASE_URL = 'https://it223-backend-production.up.railway.app/api';

export const API_ENDPOINTS = {
  books: '/api/books',
  users: '/api/users',
  login: '/api/login',
  currentUser: '/api/user',
  transactions: '/api/transactions',
  borrow: '/api/borrow',
  return: '/api/return',
} as const;



// Configure axios defaults
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
    } else {
      console.error('Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        }
      });
    }
    return Promise.reject(error);
  }
); 