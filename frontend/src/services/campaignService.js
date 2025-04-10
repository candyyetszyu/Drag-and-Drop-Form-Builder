import apiClient from '../api/apiConfig';

export const campaignService = {
  getAll: () => apiClient.get('/campaigns'),
  getById: (id) => apiClient.get(`/campaigns/${id}`),
  create: (data) => apiClient.post('/campaigns', data),
  update: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  delete: (id) => apiClient.delete(`/campaigns/${id}`),
  getAnalytics: (id) => apiClient.get(`/campaigns/${id}/analytics`),
  getSubmissions: (id) => apiClient.get(`/campaigns/${id}/submissions`),
  updateStatus: (id, status) => apiClient.patch(`/campaigns/${id}/status`, { status })
}; 