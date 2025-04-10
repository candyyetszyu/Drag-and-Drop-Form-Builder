import React, { useState } from 'react';

const FileUploadField = ({ 
  question, 
  isRequired, 
  onChange, 
  isPreviewMode = false,
  validationError
}) => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (!isPreviewMode) return;
    
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onChange) {
        onChange(file);
      }
    }
  };

  return (
    <div className="margin-responsive">
      <label className="form-label">
        {question}
        {isRequired && <span style={{ color: 'red' }}> *</span>}
      </label>
      
      <div className="flex flex-col">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={!isPreviewMode}
          className="input"
          style={{ opacity: isPreviewMode ? 1 : 0.6 }}
        />
        
        {fileName && (
          <div className="mt-2 text-sm">
            Selected file: {fileName}
          </div>
        )}
        
        {validationError && (
          <div className="text-red-500 text-sm mt-1">{validationError}</div>
        )}
      </div>
    </div>
  );
};

export default FileUploadField;
