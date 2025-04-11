import React, { useState, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { useFormState } from '../../hooks/useFormState';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './FieldConfigPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormValidationModal from './FormValidationModal';
import { validateFormConfig } from '../../utils/formValidation';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../../context/ThemeContext';

const FormBuilderPage = () => {
  const configSectionRef = useRef(null);
  
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const { loading, error, post } = useApi();
  const { formValues, handleInputChange } = useFormState({
    title: 'Untitled Form',
    description: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);

  const { currentTheme, setTheme, themeColors } = useTheme();

  const handleAddField = (fieldType) => {
    console.log("Adding field of type:", fieldType);
    
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      question: `New ${fieldType} question`,
      isRequired: false,
    };
    
    if (fieldType === 'dropdown') {
      newField.options = [
        { value: 'Option 1', label: 'Option 1' },
        { value: 'Option 2', label: 'Option 2' }
      ];
    } else if (fieldType === 'table') {
      newField.columns = [
        { name: 'Column 1', type: 'text' },
        { name: 'Column 2', type: 'text' }
      ];
    } else if (fieldType === 'text') {
      newField.minLength = 0;
      newField.maxLength = 100;
    }
    
    setFields(prevFields => [...prevFields, newField]);
    setSelectedField(newField);
    
    console.log("Field added:", newField);
  };

  const handleFieldSelection = (field) => {
    console.log("Selected field:", field);
    setSelectedField(field);
    
    if (configSectionRef.current) {
      configSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFieldUpdate = (updatedField) => {
    console.log("Updating field:", updatedField);
    
    if (Array.isArray(updatedField)) {
      setFields(updatedField);
    } else {
      setFields(prevFields => 
        prevFields.map(field => 
          field.id === updatedField.id ? updatedField : field
        )
      );
      
      if (selectedField && selectedField.id === updatedField.id) {
        setSelectedField(updatedField);
      }
    }
  };

  const handleFieldDelete = (fieldId) => {
    console.log("Deleting field:", fieldId);
    
    setFields(prevFields => prevFields.filter(field => field.id !== fieldId));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSaveForm = () => {
    if (!formValues.title) {
      alert("Please enter a form title before saving");
      return;
    }
    
    if (fields.length === 0) {
      alert("Please add at least one field to your form");
      return;
    }
    
    setShowValidationModal(true);
  };

  const handleFinalSave = async (formDataWithValidation) => {
    try {
      console.log("Saving form:", formDataWithValidation);
      
      // Extract the fields and other form data from the validated form
      const dataToSave = {
        title: formValues.title,
        description: formValues.description || '',
        fields: fields.map(field => {
          // Clone the field to avoid modifying the original
          const fieldToSave = { ...field };
          // Remove any runtime-only properties that shouldn't be saved
          delete fieldToSave.value;
          return fieldToSave;
        }),
        // Include the validation code if it exists
        ...(formDataWithValidation.validationCode && { 
          validationCode: formDataWithValidation.validationCode 
        })
      };
      
      const result = await post('/forms', dataToSave);
      setShowValidationModal(false);
      
      if (result.success) {
        // If we have a new form ID, use it
        if (result.formId) {
          console.log("Form saved with ID:", result.formId);
          
          // Display success message with share URL if available
          let message = 'Form saved successfully!';
          if (result.shareUrl) {
            message += `\n\nShare URL: ${result.shareUrl}`;
            
            // Copy URL to clipboard if supported
            if (navigator.clipboard) {
              navigator.clipboard.writeText(result.shareUrl)
                .then(() => console.log('URL copied to clipboard'))
                .catch(err => console.error('Failed to copy URL: ', err));
            }
          }
          
          alert(message);
        } else {
          alert('Form saved successfully!');
        }
      } else {
        alert(`Error: ${result.error || 'Unknown error occurred'}`);
      }
      
      return result;
    } catch (err) {
      console.error('Error saving form:', err);
      alert('Failed to save the form. Please try again.');
    }
  };

  const togglePreview = () => {
    console.log("Toggling preview mode. Current state:", isPreview);
    setIsPreview(!isPreview);
  };

  const handleFieldDrop = (fieldType, index) => {
    console.log(`Dropped ${fieldType} at index ${index}`);
    
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      question: `New ${fieldType} question`,
      isRequired: false,
    };
    
    if (fieldType === 'dropdown') {
      newField.options = [
        { value: 'Option 1', label: 'Option 1' },
        { value: 'Option 2', label: 'Option 2' }
      ];
    } else if (fieldType === 'table') {
      newField.columns = [
        { name: 'Column 1', type: 'text' },
        { name: 'Column 2', type: 'text' }
      ];
    } else if (fieldType === 'text') {
      newField.minLength = 0;
      newField.maxLength = 100;
    }
    
    const newFields = [...fields];
    if (index !== undefined && index >= 0) {
      newFields.splice(index, 0, newField);
    } else {
      newFields.push(newField);
    }
    
    setFields(newFields);
    setSelectedField(newField);
  };

  const handleReorderField = (dragIndex, hoverIndex) => {
    const draggedField = fields[dragIndex];
    
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    
    setFields(newFields);
  };

  const scrollToConfig = () => {
    if (configSectionRef.current) {
      configSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container" style={{
        backgroundColor: themeColors.backgroundColor,
        color: themeColors.textColor
      }}>
        <FormValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          formData={{
            ...formValues,
            fields,
          }}
          onSave={handleFinalSave}
        />
        
        <header className="padding-responsive">
          <h1>{isPreview ? 'Form Preview' : 'Form Builder'}</h1>
          
          {!isPreview && selectedField && (
            <div 
              onClick={scrollToConfig} 
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: '#2563eb',
                marginTop: '0.5rem',
                display: 'inline-block'
              }}
            >
              Jump to Field Configuration →
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              className="input"
              placeholder="Form Title"
              style={{ flex: 1 }}
            />
            <button 
              className="btn btn-secondary"
              onClick={togglePreview}
              style={{ backgroundColor: themeColors.secondaryColor }}
            >
              {isPreview ? 'Edit Form' : 'Preview Form'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveForm}
              disabled={loading}
              style={{ backgroundColor: themeColors.primaryColor }}
            >
              {loading ? 'Saving...' : 'Save Form'}
            </button>
          </div>
          {formErrors.title && <div className="text-red-500 text-sm">{formErrors.title}</div>}
          {formErrors.fields && <div className="text-red-500 text-sm">{formErrors.fields}</div>}
          {error && <div className="form-error">{error}</div>}
        </header>
        
        <main style={{ display: 'flex', gap: '1rem', minHeight: '500px' }}>
          {!isPreview && (
            <aside className="padding-responsive" style={{ width: '250px' }}>
              <FieldPalette 
                onFieldSelect={handleAddField} 
                onDragDrop={handleFieldDrop}
                themeColors={themeColors}
              />
              
              <div className="mt-6">
                <ThemeSelector 
                  onThemeSelect={setTheme} 
                  currentTheme={currentTheme} 
                />
              </div>
            </aside>
          )}
          
          <section className="padding-responsive" style={{ 
            flex: 1,
            backgroundColor: themeColors.backgroundColor
          }}>
            <FormCanvas
              fields={fields}
              isPreview={isPreview}
              onFieldSelect={handleFieldSelection}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onDrop={handleFieldDrop}
              onReorder={handleReorderField}
              formId="preview"
              themeColors={themeColors}
            />
          </section>
          
          {!isPreview && selectedField && (
            <aside 
              className="padding-responsive" 
              style={{ 
                width: '300px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              ref={configSectionRef}
              id="field-configuration"
            >
              <h2 style={{ 
                paddingBottom: '0.5rem',
                marginBottom: '0.5rem',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.125rem',
                color: '#111827'
              }}>
                Field Configuration
              </h2>
              <FieldConfigPanel 
                field={selectedField} 
                onFieldUpdate={handleFieldUpdate}
                availableFields={fields.filter(f => f.id !== selectedField.id)}
              />
            </aside>
          )}
        </main>
      </div>
    </DndProvider>
  );
};

export default FormBuilderPage;