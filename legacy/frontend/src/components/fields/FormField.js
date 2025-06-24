import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import FileUploadField from './shared/FileUploadField';

const FormField = ({ field, onChange, onBlur, value, error, className = '' }) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
  const errorStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500';

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            className={twMerge(baseStyles, error && errorStyles, className)}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            className={twMerge(baseStyles, error && errorStyles, className)}
          />
        );
      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={field.required}
            className={twMerge(baseStyles, error && errorStyles, className)}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            name={field.name}
            checked={value}
            onChange={onChange}
            onBlur={onBlur}
            required={field.required}
            className={twMerge('h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded', error && errorStyles, className)}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  onBlur={onBlur}
                  required={field.required}
                  className={twMerge('h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300', error && errorStyles, className)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <FileUploadField
            question={field.label}
            isRequired={field.required}
            onChange={(file) => onChange({ target: { name: field.name, value: file } })}
            isPreviewMode
            validationError={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

FormField.propTypes = {
  field: PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    }))
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
  error: PropTypes.string,
  className: PropTypes.string
};

export default FormField;