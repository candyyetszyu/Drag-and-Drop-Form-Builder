import { apiUtils } from '../api/apiConfig';

const TOKEN_KEY = 'token';

const tokenService = {
  set: token => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
  exists: () => !!localStorage.getItem(TOKEN_KEY)
};

export const authService = {
  login: async (credentials) => {
    const data = await apiUtils.post('/auth/login', credentials);
    tokenService.set(data.token);
    return data;
  },
  register: async (userData) => {
    const data = await apiUtils.post('/auth/register', userData);
    tokenService.set(data.token);
    return data;
  },
  logout: () => tokenService.remove(),
  getCurrentUser: async () => {
    if (!tokenService.exists()) return null;
    const data = await apiUtils.get('/auth/me');
    return data;
  },
  isAuthenticated: () => tokenService.exists()
};