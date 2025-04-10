import { api } from './apiConfig';

export const formService = {
  getAll: () => api.get('/forms').then(({ data }) => data),
  getById: id => api.get(`/forms/${id}`).then(({ data }) => data),
  create: form => api.post('/forms', form).then(({ data }) => data),
  update: (id, form) => api.put(`/forms/${id}`, form).then(({ data }) => data),
  delete: id => api.delete(`/forms/${id}`).then(({ data }) => data),
  getSubmissions: id => api.get(`/forms/${id}/submissions`).then(({ data }) => data),
  submitForm: (id, data) => api.post(`/forms/${id}/submit`, data).then(({ data }) => data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/forms/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};