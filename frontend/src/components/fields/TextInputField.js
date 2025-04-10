import React from 'react';

const TextInputField = ({ 
  question, 
  required, 
  value = '', 
  onChange, 
  isPreview = true,
  minLength,
  maxLength
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="margin-responsive">
      <label className="form-label">
        {question}
        {required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={!isPreview}
        className="input"
        minLength={minLength}
        maxLength={maxLength}
      />
    </div>
  );
};

export default TextInputField;
