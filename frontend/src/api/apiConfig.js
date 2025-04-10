import axios from 'axios';

// Define the API base URL
const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: BASE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // Set a timeout for API requests
});

// Add request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Utility functions for common API operations
const apiUtils = {
  get: (url) => api.get(url).then((response) => response.data),
  post: (url, data) => api.post(url, data).then((response) => response.data),
  put: (url, data) => api.put(url, data).then((response) => response.data),
  delete: (url) => api.delete(url).then((response) => response.data),
};

export { api, apiUtils, BASE_API_URL };