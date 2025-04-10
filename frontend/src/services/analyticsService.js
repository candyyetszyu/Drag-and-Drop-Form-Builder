import apiClient from '../api/apiConfig';

export const analyticsService = {
  getCampaignAnalytics: (id) => apiClient.get(`/analytics/campaigns/${id}`),
  getFormAnalytics: (id) => apiClient.get(`/analytics/forms/${id}`),
  getOverview: () => apiClient.get('/analytics/overview'),
  getTrends: (period) => apiClient.get(`/analytics/trends?period=${period}`),
  getConversionRates: () => apiClient.get('/analytics/conversion-rates'),
  getAudienceInsights: () => apiClient.get('/analytics/audience-insights'),
  exportData: (type, format) => apiClient.get(`/analytics/export/${type}?format=${format}`)
}; 