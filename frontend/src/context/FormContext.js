import { createContext, useContext, useState, useCallback } from 'react';
import { formService } from '../api/formService';
import { useApi } from '../hooks/useApi';

const FormContext = createContext(null);

export const FormProvider = ({ children }) => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const { request, isLoading, error } = useApi(formService.getAll);

  const fetchForms = useCallback(async () => {
    try {
      const data = await request();
      setForms(data);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    }
  }, [request]);

  const getForm = useCallback(async (id) => {
    try {
      const data = await formService.getById(id);
      setSelectedForm(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch form:', err);
      return null;
    }
  }, []);

  const createForm = useCallback(async (data) => {
    try {
      const newForm = await formService.create(data);
      setForms(prev => [...prev, newForm]);
      return newForm;
    } catch (err) {
      console.error('Failed to create form:', err);
      return null;
    }
  }, []);

  const updateForm = useCallback(async (id, data) => {
    try {
      const updatedForm = await formService.update(id, data);
      setForms(prev => prev.map(f => f.id === id ? updatedForm : f));
      if (selectedForm?.id === id) setSelectedForm(updatedForm);
      return updatedForm;
    } catch (err) {
      console.error('Failed to update form:', err);
      return null;
    }
  }, [selectedForm]);

  const deleteForm = useCallback(async (id) => {
    try {
      await formService.delete(id);
      setForms(prev => prev.filter(f => f.id !== id));
      if (selectedForm?.id === id) setSelectedForm(null);
    } catch (err) {
      console.error('Failed to delete form:', err);
    }
  }, [selectedForm]);

  const submitForm = useCallback(async (id, data) => {
    try {
      return await formService.submitForm(id, data);
    } catch (err) {
      console.error('Failed to submit form:', err);
      return null;
    }
  }, []);

  const getSubmissions = useCallback(async (id) => {
    try {
      return await formService.getSubmissions(id);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      return null;
    }
  }, []);

  const value = {
    forms,
    selectedForm,
    isLoading,
    error,
    fetchForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    submitForm,
    getSubmissions
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useForm must be used within a FormProvider');
  return context;
}; 