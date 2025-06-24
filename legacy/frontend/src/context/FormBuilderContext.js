import React, { createContext, useContext, useState } from 'react';

const FormBuilderContext = createContext();

export const FormBuilderProvider = ({ children }) => {
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  const addField = (field) => {
    setFormFields(prev => [...prev, { ...field, id: Date.now() }]);
  };

  const updateField = (id, updates) => {
    setFormFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id) => {
    setFormFields(prev => prev.filter(field => field.id !== id));
  };

  const moveField = (fromIndex, toIndex) => {
    setFormFields(prev => {
      const fields = [...prev];
      const [movedField] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, movedField);
      return fields;
    });
  };

  const value = {
    formFields,
    selectedField,
    setSelectedField,
    addField,
    updateField,
    removeField,
    moveField
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (!context) throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  return context;
}; 