import { apiUtils } from './apiConfig';

export const campaignService = {
  getAll: () => apiUtils.get('/campaigns'),
  getById: id => apiUtils.get(`/campaigns/${id}`),
  create: campaign => apiUtils.post('/campaigns', campaign),
  update: (id, campaign) => apiUtils.put(`/campaigns/${id}`, campaign),
  delete: id => apiUtils.delete(`/campaigns/${id}`),
  getAnalytics: id => apiUtils.get(`/campaigns/${id}/analytics`),
  getSubmissions: id => apiUtils.get(`/campaigns/${id}/submissions`)
};