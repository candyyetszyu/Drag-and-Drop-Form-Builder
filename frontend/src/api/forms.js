import api from './base';

export const formApi = {
  getForm: (id) => api.get(`/forms/${id}`),
  saveForm: (formData) => api.post('/forms', formData),
  updateForm: (id, formData) => api.put(`/forms/${id}`, formData),
  deleteForm: (id) => api.delete(`/forms/${id}`),
  submitResponse: (formId, responseData) => api.post(`/forms/${formId}/responses`, responseData),
  getResponses: (formId) => api.get(`/forms/${formId}/responses`),
}; 