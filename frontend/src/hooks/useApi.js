// Custom hook for making API requests with loading and error states
import { useState, useCallback } from 'react';
import { api } from '../api/apiConfig';

// Remove the unused BASE_URL constant
// const BASE_URL = 'http://localhost:3001';

export const useApi = () => {
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Generic request handler
  const request = useCallback(async (method, url, data = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api[method](url, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get: (url) => request('get', url),
    post: (url, data) => request('post', url, data),
    put: (url, data) => request('put', url, data),
    delete: (url) => request('delete', url),
  };
};