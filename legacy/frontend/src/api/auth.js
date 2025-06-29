import api from './base';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: () => api.get('/auth/me'),
};

export default authService;