import React, { useState } from 'react';

const DropdownField = ({ 
  question, 
  required, 
  options = [], 
  value = '', 
  onChange,
  isPreview = true,
  conditions = [],
  onConditionChange
}) => {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <div className="margin-responsive">
      <label className="form-label">
        {question}
        {required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={!isPreview}
        className="input"
      >
        <option value="">Select an option</option>
        {options && options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option.value || option}
          </option>
        ))}
      </select>
      
      {!isPreview && onConditionChange && (
        <div className="conditional-logic mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Conditional Logic</h4>
          <p className="text-xs text-gray-500 mb-3">Define what happens when an option is selected</p>
          
          {options && options.length > 0 && (
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex flex-col gap-2 p-2 border border-gray-200 bg-white rounded-md">
                  <div className="text-sm font-medium">
                    When "{option.label || option.value || option}" is selected:
                  </div>
                  <select 
                    className="input text-sm"
                    value={conditions.find(c => c.optionValue === (option.value || option))?.action || ""}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      const existing = newConditions.findIndex(c => 
                        c.optionValue === (option.value || option)
                      );
                      
                      if (existing >= 0) {
                        newConditions[existing] = {
                          ...newConditions[existing],
                          action: e.target.value
                        };
                      } else {
                        newConditions.push({
                          optionValue: option.value || option,
                          action: e.target.value,
                          targetId: ""
                        });
                      }
                      
                      onConditionChange(newConditions);
                    }}
                  >
                    <option value="">No action</option>
                    <option value="skip_to">Skip to question</option>
                    <option value="show">Show question</option>
                    <option value="hide">Hide question</option>
                  </select>
                  
                  {conditions.find(c => c.optionValue === (option.value || option))?.action && (
                    <input 
                      type="text"
                      className="input text-sm"
                      placeholder="Enter question ID"
                      value={conditions.find(c => c.optionValue === (option.value || option))?.targetId || ""}
                      onChange={(e) => {
                        const newConditions = [...conditions];
                        const existing = newConditions.findIndex(c => 
                          c.optionValue === (option.value || option)
                        );
                        
                        if (existing >= 0) {
                          newConditions[existing] = {
                            ...newConditions[existing],
                            targetId: e.target.value
                          };
                        }
                        
                        onConditionChange(newConditions);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownField;