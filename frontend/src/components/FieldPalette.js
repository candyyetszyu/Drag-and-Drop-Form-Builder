import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const FieldPalette = ({ fields, onFieldSelect, className = '' }) => {
  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email Input', icon: '📧' },
    { type: 'number', label: 'Number Input', icon: '🔢' },
    { type: 'select', label: 'Dropdown', icon: '▼' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Button', icon: '🔘' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'date', label: 'Date Picker', icon: '📅' }
  ];

  return (
    <div className={twMerge('grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow', className)}>
      {fieldTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onFieldSelect(type)}
          className="flex items-center p-3 space-x-2 text-left transition-colors border rounded-lg hover:bg-gray-50"
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

FieldPalette.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  })),
  onFieldSelect: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default FieldPalette; 