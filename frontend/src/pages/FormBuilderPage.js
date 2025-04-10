import React from 'react';
import FormBuilder from './FormBuilder';

const FormBuilderPage = () => {
  const handleSaveForm = async (formData) => {
    try {
      // Logic to save form data
      console.log('Form data saved:', formData);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  return (
    <div className="form-builder-page">
      <h1>Form Builder</h1>
      <FormBuilder onSave={handleSaveForm} />
    </div>
  );
};

export default FormBuilderPage;