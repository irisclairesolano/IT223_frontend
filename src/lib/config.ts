import axios from 'axios';

// Base URL without trailing slash
export const API_BASE_URL = 'https://it223-backend-production.up.railway.app/api';

// Debug log the base URL
console.log('API Base URL configured as:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Books endpoints
  books: `${API_BASE_URL}/books`,
  
  // User endpoints
  users: `${API_BASE_URL}/users`,
  login: `${API_BASE_URL}/login`,
  currentUser: `${API_BASE_URL}/user`,
  
  // Transaction endpoints
  transactions: `${API_BASE_URL}/transactions`,
  transaction: (id: number) => `${API_BASE_URL}/transactions/${id}`,
  borrow: `${API_BASE_URL}/borrow`,
  return: (id: number) => `${API_BASE_URL}/return/${id}`,
} as const;

// Debug log all endpoints
console.log('Configured API Endpoints:', API_ENDPOINTS);

// Configure axios defaults
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    // Log the full URL being requested
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    console.log('Request data:', config.data);
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
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
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
        statusText: error.response?.statusText,
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