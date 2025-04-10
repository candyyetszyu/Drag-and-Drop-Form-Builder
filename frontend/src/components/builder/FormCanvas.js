import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
// Update import path for FieldRenderer
import FieldRenderer from '../fields/FieldRenderer';
import DraggableField from './DraggableField';
import { useFormSubmission } from '../../hooks/useFormSubmission';

const FormCanvas = ({ 
  fields, 
  isPreview, 
  onFieldSelect, 
  onFieldUpdate, 
  onFieldDelete,
  onDrop,
  onReorder,
  formId,
  themeColors = { 
    primaryColor: '#3b82f6', 
    cardBackground: '#ffffff'
  }
}) => {
  const [formData, setFormData] = useState({});
  const { submitForm, submitted, loading, error } = useFormSubmission();
  const canvasRef = useRef(null);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Helper function to validate the form
  const validateForm = (fields, data) => {
    const errors = {};
    
    fields.forEach(field => {
      if (field.validation) {
        // Required field validation
        if (field.validation.required && !data[field.id]) {
          errors[field.id] = "This field is required";
          return;
        }
        
        if (data[field.id]) {
          const value = data[field.id];
          
          // Pattern validation
          if (field.validation.pattern) {
            let pattern;
            switch (field.validation.pattern) {
              case 'email':
                pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                break;
              case 'phone':
                pattern = /^\d{10}$/;
                break;
              case 'number':
                pattern = /^\d+$/;
                break;
              case 'custom':
                if (field.validation.customRule) {
                  try {
                    pattern = new RegExp(field.validation.customRule);
                  } catch (error) {
                    console.error("Invalid regex pattern:", field.validation.customRule);
                  }
                }
                break;
              default:
                break;
            }
            
            if (pattern && !pattern.test(value)) {
              errors[field.id] = field.validation.errorMessage || "Invalid format";
            }
          }
        }
      }
    });
    
    return errors;
  };

  // Set up drop target for the form canvas
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'FIELD_TYPE',
    drop: (item, monitor) => {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropY = monitor.getClientOffset().y - canvasRect.top;
      
      // Calculate insertion index based on mouse position
      let insertIndex = fields.length; // Default to end
      
      const fieldElements = canvasRef.current.querySelectorAll('.field-container');
      for (let i = 0; i < fieldElements.length; i++) {
        const rect = fieldElements[i].getBoundingClientRect();
        const fieldMiddle = rect.top + rect.height / 2;
        
        if (dropY < fieldMiddle) {
          insertIndex = i;
          break;
        }
      }
      
      onDrop(item.type, insertIndex);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const handleFieldChange = (fieldId, value) => {
    console.log(`Field ${fieldId} changed to:`, value);
    
    // Update local state
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Check if this field has conditions that affect other fields
    if (isPreview) {
      const changedField = fields.find(f => f.id === fieldId);
      if (changedField && changedField.type === 'dropdown' && changedField.conditions) {
        // Find conditions that match the selected value
        const activeConditions = changedField.conditions.filter(c => 
          c.optionValue === value && c.action && c.targetId
        );
        
        // Apply the conditions
        activeConditions.forEach(condition => {
          const targetField = fields.find(f => f.id === condition.targetId);
          if (!targetField) return;
          
          if (condition.action === 'skip_to') {
            // Scroll to the target field
            const targetElement = document.getElementById(`field-${condition.targetId}`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          }
          
          // Additional logic for show/hide could be implemented here
          // This would require modifying the component state to track visibility
        });
      }
    }
    
    // Update parent state if needed
    if (onFieldUpdate) {
      const fieldToUpdate = fields.find(f => f.id === fieldId);
      if (fieldToUpdate) {
        onFieldUpdate({
          ...fieldToUpdate,
          value: value
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    // Check if validation is required
    if (isPreview && formData.validationCode) {
      // Show validation code prompt
      const code = prompt("Enter validation code to submit this form:");
      if (code !== formData.validationCode) {
        alert("Invalid validation code");
        return;
      }
    }
    
    // Validate form before submission
    const errors = validateForm(fields, formData);
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      console.error("Form validation failed:", errors);
      setValidationErrors(errors);
      return;
    }
    
    // Continue with submission
    if (isPreview && formId) {
      try {
        await submitForm(formId, formData);
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    }
  };

  // Add drop indicator style
  const dropIndicatorStyle = isOver && canDrop ? {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '2px dashed #3b82f6',
    borderRadius: '0.5rem',
  } : {};

  // Display submission confirmation
  if (submitted) {
    return (
      <div className="card">
        <div className="text-center padding-responsive">
          <h2>Form Submitted Successfully!</h2>
          <p>Thank you for your submission.</p>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card" 
      ref={(node) => {
        drop(node);
        canvasRef.current = node;
      }}
      style={{
        ...dropIndicatorStyle,
        minHeight: '200px',
        transition: 'background-color 0.2s, border 0.2s',
        backgroundColor: themeColors.cardBackground,
      }}
    >
      {fields.length === 0 ? (
        <div className="text-center padding-responsive">
          <p>Drag fields here from the panel to build your form.</p>
        </div>
      ) : (
        <form className="space-responsive" onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            isPreview ? (
              <div
                key={field.id}
                id={`field-${field.id}`}
                className="padding-responsive margin-responsive field-container"
              >
                <FieldRenderer
                  field={field}
                  isPreview={isPreview}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
                {validationErrors[field.id] && (
                  <div className="text-red-500 text-sm mt-1">
                    {validationErrors[field.id]}
                  </div>
                )}
              </div>
            ) : (
              <DraggableField
                key={field.id}
                field={field}
                index={index}
                onSelect={onFieldSelect}
                onDelete={onFieldDelete}
                onMove={onReorder}
              >
                <FieldRenderer
                  field={field}
                  isPreview={isPreview}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              </DraggableField>
            )
          ))}
          
          {isPreview && (
            <div className="text-center padding-responsive">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ backgroundColor: themeColors.primaryColor }}
              >
                {loading ? 'Submitting...' : 'Submit Form'}
              </button>
              {error && <div className="form-error">{error}</div>}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default FormCanvas;
