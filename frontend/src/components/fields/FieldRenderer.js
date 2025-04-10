import React from 'react';
import TextInputField from './TextInputField';
import DropdownField from './DropdownField';
import TableField from './TableField';
import FileUploadField from './FileUploadField';

const FieldRenderer = ({ field, isPreview, onChange }) => {
  // Add console log for debugging
  console.log('Rendering field:', field.type, { isPreview, value: field.value });
  
  switch (field.type) {
    case 'text':
      return (
        <TextInputField
          question={field.question}
          required={field.isRequired}
          value={field.value || ''}
          onChange={(value) => onChange && onChange(value)}
          isPreview={isPreview}
          minLength={field.minLength}
          maxLength={field.maxLength}
        />
      );
    
    case 'dropdown':
      return (
        <DropdownField
          question={field.question}
          required={field.isRequired}
          options={field.options || []}
          value={field.value || ''}
          onChange={(value) => onChange && onChange(value)}
          isPreview={isPreview}
        />
      );
    
    case 'table':
      return (
        <TableField
          question={field.question}
          required={field.isRequired}
          columns={field.columns || []}
          value={field.value || []}
          onChange={(value) => onChange && onChange(value)}
          isPreview={isPreview}
        />
      );
    
    case 'file':
      return (
        <FileUploadField
          question={field.question}
          isRequired={field.isRequired}
          onChange={(file) => onChange && onChange(file)}
          isPreviewMode={isPreview}
        />
      );
    
    default:
      return <div>Unknown field type: {field.type}</div>;
  }
};

export default FieldRenderer;
