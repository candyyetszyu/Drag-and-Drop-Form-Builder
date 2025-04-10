import { api } from '../api/apiConfig';

// API function to submit form response
const submitFormResponse = async (formId, formData) => {
  try {
    const response = await api.post(`/forms/${formId}/submit`, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting form response:', error);
    throw error;
  }
};

export const formsApi = {
  getForms: async () => {
    try {
      const response = await api.get('/forms');
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },
  getFormById: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching form with ID ${formId}:`, error);
      throw error;
    }
  },
  createForm: async (formData) => {
    try {
      const response = await api.post('/forms', formData);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },
  updateForm: async (formId, formData) => {
    try {
      const response = await api.put(`/forms/${formId}`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error updating form with ID ${formId}:`, error);
      throw error;
    }
  },
  deleteForm: async (formId) => {
    try {
      const response = await api.delete(`/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting form with ID ${formId}:`, error);
      throw error;
    }
  }
};