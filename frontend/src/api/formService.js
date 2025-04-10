import { apiUtils } from './apiConfig';

export const formService = {
  getAll: () => apiUtils.get('/forms'),
  getById: id => apiUtils.get(`/forms/${id}`),
  create: form => apiUtils.post('/forms', form),
  update: (id, form) => apiUtils.put(`/forms/${id}`, form),
  delete: id => apiUtils.delete(`/forms/${id}`),
  getSubmissions: id => apiUtils.get(`/forms/${id}/submissions`),
  submitForm: (id, data) => apiUtils.post(`/forms/${id}/submit`, data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${apiUtils.getBaseUrl()}/forms/upload`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json());
  },
};