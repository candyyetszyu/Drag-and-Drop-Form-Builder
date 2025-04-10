import { api } from './apiConfig';

export const campaignService = {
  getAll: () => api.get('/campaigns').then(({ data }) => data),
  getById: id => api.get(`/campaigns/${id}`).then(({ data }) => data),
  create: campaign => api.post('/campaigns', campaign).then(({ data }) => data),
  update: (id, campaign) => api.put(`/campaigns/${id}`, campaign).then(({ data }) => data),
  delete: id => api.delete(`/campaigns/${id}`).then(({ data }) => data),
  getAnalytics: id => api.get(`/campaigns/${id}/analytics`).then(({ data }) => data),
  getSubmissions: id => api.get(`/campaigns/${id}/submissions`).then(({ data }) => data)
}; 