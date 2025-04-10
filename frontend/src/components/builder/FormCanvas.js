import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
// Update import path for FieldRenderer
import FieldRenderer from '../fields/FieldRenderer';
import DraggableField from './DraggableField';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { apiUtils } from '../../api/apiConfig';

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
  // Add field visibility state
  const [fieldVisibility, setFieldVisibility] = useState({});
  // Add state for form URL
  const [formUrl, setFormUrl] = useState('');
  // Add state for URL notification
  const [showUrlNotification, setShowUrlNotification] = useState(false);
  
  // Get base URL from window location
  const baseUrl = window.location.origin;

  // Initialize field visibility when fields change
  useEffect(() => {
    const initialVisibility = {};
    fields.forEach(field => {
      // Set all fields to visible by default
      initialVisibility[field.id] = true;
    });
    setFieldVisibility(initialVisibility);
  }, [fields]);
  
  // Generate and set form URL when formId changes
  useEffect(() => {
    if (formId) {
      const url = `${baseUrl}/form/${formId}`;
      setFormUrl(url);
      
      // Check if the form exists in the database
      const checkFormInDatabase = async () => {
        try {
          const response = await apiUtils.get(`/forms/${formId}`);
          if (response.success) {
            setShowUrlNotification(true);
            // Hide notification after 10 seconds
            setTimeout(() => {
              setShowUrlNotification(false);
            }, 10000);
          }
        } catch (error) {
          console.error('Error checking form:', error);
        }
      };
      
      checkFormInDatabase();
    }
  }, [formId, baseUrl]);

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
        
        // Reset visibility for fields that depend on this dropdown
        const allConditionTargets = changedField.conditions
          .map(c => c.targetId)
          .filter((id, index, array) => array.indexOf(id) === index); // unique values
        
        // First, reset all affected fields to visible
        if (allConditionTargets.length > 0) {
          setFieldVisibility(prev => {
            const updated = { ...prev };
            allConditionTargets.forEach(targetId => {
              updated[targetId] = true;
            });
            return updated;
          });
        }
        
        // Apply the active conditions
        activeConditions.forEach(condition => {
          const targetField = fields.find(f => f.id === condition.targetId);
          if (!targetField) {
            return;
          }
          
          if (condition.action === 'skip_to') {
            // Scroll to the target field
            const targetElement = document.getElementById(`field-${condition.targetId}`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          } else if (condition.action === 'show') {
            // Show the target field
            setFieldVisibility(prev => ({
              ...prev,
              [condition.targetId]: true
            }));
          } else if (condition.action === 'hide') {
            // Hide the target field
            setFieldVisibility(prev => ({
              ...prev,
              [condition.targetId]: false
            }));
            
            // Clear any data for hidden fields
            if (formData[condition.targetId]) {
              setFormData(prev => {
                const updated = { ...prev };
                delete updated[condition.targetId];
                return updated;
              });
            }
          }
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
    
    // Validate form before submission - only validate visible fields
    const visibleFields = fields.filter(field => fieldVisibility[field.id] !== false);
    const errors = validateForm(visibleFields, formData);
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      console.error("Form validation failed:", errors);
      setValidationErrors(errors);
      return;
    }
    
    // Continue with submission
    if (isPreview && formId) {
      try {
        // Store the form ID with the submission data for tracking
        const submissionData = {
          ...formData,
          _formId: formId, // Add internal tracking field
          _submittedAt: new Date().toISOString()
        };
        
        const response = await submitForm(formId, submissionData);
        console.log("Form submission response:", response);
        
        // Clear form data after successful submission if not already set by the hook
        if (!submitted) {
          setFormData({});
          setValidationErrors({});
        }
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    }
  };
  
  // Function to copy form URL to clipboard
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(formUrl)
      .then(() => {
        alert('Form URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
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
    <div className="form-canvas-container">
      {/* URL Notification */}
      {showUrlNotification && formUrl && (
        <div className="url-notification" style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.375rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Share this form: </strong> 
            <a href={formUrl} target="_blank" rel="noopener noreferrer">{formUrl}</a>
          </div>
          <button 
            onClick={copyUrlToClipboard}
            className="btn btn-small btn-secondary"
            style={{ marginLeft: '0.5rem' }}
          >
            Copy URL
          </button>
        </div>
      )}
      
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
              // Skip rendering if the field should be hidden
              fieldVisibility[field.id] !== false && (
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
      
      {/* Form URL display at the bottom for builder mode */}
      {!isPreview && formId && (
        <div className="form-url-container" style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '0.375rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Form URL: </strong>
            <span>{formUrl}</span>
          </div>
          <button 
            onClick={copyUrlToClipboard}
            className="btn btn-small btn-secondary"
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
