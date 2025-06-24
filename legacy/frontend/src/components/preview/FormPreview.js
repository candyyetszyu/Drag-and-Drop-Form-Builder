import React, { useState } from 'react';
import FieldRenderer from '../fields/FieldRenderer';
import { useTheme } from '../../context/ThemeContext';

const FormPreview = ({ formData, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [validationCode, setValidationCode] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  
  const { theme } = useTheme();
  
  // Generate CSS variables from the theme
  const themeStyle = {
    '--primary-color': theme.colors.primary,
    '--secondary-color': theme.colors.secondary,
    '--accent-color': theme.colors.accent,
    '--background-color': theme.colors.background,
    '--surface-color': theme.colors.surface,
    '--text-color': theme.colors.text,
    '--text-secondary-color': theme.colors.textSecondary,
    '--border-radius': theme.borderRadius,
    '--box-shadow': theme.boxShadow
  };
  
  const handleFieldChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    const newErrors = {};
    formData.fields.forEach(field => {
      if (field.isRequired && (!formValues[field.id] || formValues[field.id] === '')) {
        newErrors[field.id] = 'This field is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Show validation code input if form has validation
    if (formData.validationCode && !showValidation) {
      setShowValidation(true);
      return;
    }
    
    // Validate the code if validation is enabled
    if (formData.validationCode && showValidation) {
      if (validationCode !== formData.validationCode) {
        alert('Invalid validation code');
        return;
      }
    }
    
    // Submit the form
    if (onSubmit) {
      onSubmit(formValues);
    } else {
      alert('Form submitted successfully!');
      onClose();
    }
  };
  
  return (
    <div className="form-preview" style={themeStyle}>
      <div className="preview-header" style={{ backgroundColor: theme.colors.primary, color: '#fff' }}>
        <h2>Form Preview</h2>
        <button 
          className="btn btn-secondary" 
          onClick={onClose}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: 'none'
          }}
        >
          <i className="icon-x"></i> Close Preview
        </button>
      </div>

      <div className="preview-content" style={{ backgroundColor: theme.colors.background }}>
        <h3 style={{ color: theme.colors.text }}>{formData.title}</h3>
        {formData.description && <p style={{ color: theme.colors.textSecondary }}>{formData.description}</p>}

        <form onSubmit={handleSubmit}>
          {formData.fields?.map((field) => (
            <div key={field.id} className="form-field">
              <FieldRenderer
                field={field}
                isPreview={true}
                onChange={(value) => handleFieldChange(field.id, value)}
              />
              {errors[field.id] && (
                <div className="text-red-500 text-sm mt-1">
                  {errors[field.id]}
                </div>
              )}
            </div>
          ))}
          
          {showValidation && (
            <div className="validation-code-section my-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Admin Validation</h4>
              <p className="text-sm text-gray-600 mb-2">
                This form requires admin validation to submit. Enter the validation code.
              </p>
              <input 
                type="password"
                className="input"
                placeholder="Validation Code"
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value)}
              />
            </div>
          )}
          
          <div className="text-center mt-6">
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: '#fff',
                borderRadius: theme.borderRadius,
                boxShadow: theme.boxShadow
              }}
            >
              {showValidation ? 'Validate & Submit' : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPreview;