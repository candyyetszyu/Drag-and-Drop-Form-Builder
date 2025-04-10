import React, { useState } from 'react';

const FieldConfigPanel = ({ field, onFieldUpdate, availableFields = [] }) => {
  if (!field) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    onFieldUpdate({
      ...field,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Functions to handle column operations
  const handleAddColumn = () => {
    const newColumns = [...(field.columns || [])];
    newColumns.push({ name: `Column ${newColumns.length + 1}`, type: 'text' });
    
    onFieldUpdate({
      ...field,
      columns: newColumns,
    });
  };

  const handleUpdateColumn = (index, updates) => {
    const updatedColumns = [...field.columns];
    updatedColumns[index] = { ...updatedColumns[index], ...updates };
    
    onFieldUpdate({
      ...field,
      columns: updatedColumns,
    });
  };

  const handleRemoveColumn = (index) => {
    onFieldUpdate({
      ...field,
      columns: field.columns.filter((_, i) => i !== index),
    });
  };

  // Handle adding test row for the table
  const handleAddTestRow = () => {
    if (!field.columns || field.columns.length === 0) return;
    
    // Create an empty row based on current columns
    const newRow = field.columns.reduce((acc, col) => {
      acc[col.name] = '';
      return acc;
    }, {});
    
    // Add the row to the value array directly (instead of testData)
    const updatedValue = [...(field.value || []), newRow];
    
    onFieldUpdate({
      ...field,
      value: updatedValue,
    });
  };

  // Handle removing a test row
  const handleRemoveTestRow = (index) => {
    onFieldUpdate({
      ...field,
      value: (field.value || []).filter((_, i) => i !== index),
    });
  };

  // Update test row cell value
  const handleTestCellChange = (rowIndex, colName, value) => {
    const updatedValue = [...(field.value || [])];
    updatedValue[rowIndex] = { 
      ...updatedValue[rowIndex],
      [colName]: value 
    };
    
    onFieldUpdate({
      ...field,
      value: updatedValue,
    });
  };

  // Handle dropdown options for a column
  const handleAddOption = () => {
    const newOptions = [...(field.options || [])];
    newOptions.push({ value: `Option ${newOptions.length + 1}`, label: `Option ${newOptions.length + 1}` });
    
    onFieldUpdate({
      ...field,
      options: newOptions,
    });
  };

  const handleUpdateOption = (index, value) => {
    const updatedOptions = [...field.options];
    updatedOptions[index] = { 
      ...updatedOptions[index], 
      value: value,
      label: value 
    };
    
    onFieldUpdate({
      ...field,
      options: updatedOptions,
    });
  };

  const handleRemoveOption = (index) => {
    onFieldUpdate({
      ...field,
      options: field.options.filter((_, i) => i !== index),
    });
  };

  // Handle conditions for dropdown field
  const handleConditionChange = (conditions) => {
    onFieldUpdate({
      ...field,
      conditions,
    });
  };

  return (
    <div className="field-config-panel">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem' 
      }}>
        {/* Highlight the field type and question */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.375rem',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#0369a1', 
            fontWeight: 'bold', 
            marginBottom: '0.25rem' 
          }}>
            {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>
            {field.question || 'Untitled Question'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Field ID: {field.id}
          </div>
        </div>
        
        {/* Question text input */}
        <div className="config-field">
          <label className="form-label">Question Text</label>
          <input
            type="text"
            name="question"
            value={field.question || ''}
            onChange={handleChange}
            className="input"
            placeholder="Enter question text"
          />
        </div>
        
        {/* Required checkbox */}
        <div className="config-field">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}>
            <input
              type="checkbox"
              id="isRequired"
              name="isRequired"
              checked={field.isRequired || false}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            <label 
              htmlFor="isRequired" 
              className="form-label" 
              style={{ margin: 0, cursor: 'pointer' }}
            >
              Required Field
            </label>
          </div>
        </div>
        
        {/* Text field specific settings */}
        {field.type === 'text' && (
          <>
            <div className="config-field">
              <label className="form-label">Minimum Length</label>
              <input
                type="number"
                name="minLength"
                value={field.minLength || ''}
                onChange={handleChange}
                className="input"
                placeholder="0"
              />
            </div>
            <div className="config-field">
              <label className="form-label">Maximum Length</label>
              <input
                type="number"
                name="maxLength"
                value={field.maxLength || ''}
                onChange={handleChange}
                className="input"
                placeholder="100"
              />
            </div>
          </>
        )}
        
        {/* Dropdown field specific settings */}
        {field.type === 'dropdown' && (
          <>
            <div className="config-field">
              <label className="form-label">Options</label>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                marginTop: '0.5rem' 
              }}>
                {field.options?.map((option, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '0.5rem' 
                  }}>
                    <input
                      type="text"
                      value={option.value || ''}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      className="input"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ 
                        backgroundColor: '#f87171', 
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        minWidth: '40px'
                      }}
                      onClick={() => handleRemoveOption(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '0.5rem' }}
                  onClick={handleAddOption}
                >
                  Add Option
                </button>
              </div>
            </div>
            
            {/* Conditional Logic Section */}
            <div className="config-field">
              <label className="form-label">Conditional Logic</label>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '0.75rem', 
                borderRadius: '0.25rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Define what happens when specific options are selected
                </div>
                
                {field.options?.map((option, index) => (
                  <div key={index} style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.25rem'
                  }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
                      When "{option.label || option.value || option}" is selected:
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select
                        className="input"
                        value={(field.conditions?.find(c => c.optionValue === (option.value || option))?.action) || ''}
                        onChange={(e) => {
                          const newConditions = [...(field.conditions || [])];
                          const existingIndex = newConditions.findIndex(c => 
                            c.optionValue === (option.value || option)
                          );
                          
                          if (existingIndex >= 0) {
                            newConditions[existingIndex] = {
                              ...newConditions[existingIndex],
                              action: e.target.value
                            };
                          } else {
                            newConditions.push({
                              optionValue: option.value || option,
                              action: e.target.value,
                              targetId: ''
                            });
                          }
                          
                          handleConditionChange(newConditions);
                        }}
                      >
                        <option value="">No action</option>
                        <option value="skip_to">Skip to question</option>
                        <option value="show">Show question</option>
                        <option value="hide">Hide question</option>
                      </select>
                    </div>
                    
                    {(field.conditions?.find(c => c.optionValue === (option.value || option))?.action) && (
                      <div>
                        <select
                          className="input"
                          value={(field.conditions?.find(c => c.optionValue === (option.value || option))?.targetId) || ''}
                          onChange={(e) => {
                            const newConditions = [...(field.conditions || [])];
                            const existingIndex = newConditions.findIndex(c => 
                              c.optionValue === (option.value || option)
                            );
                            
                            if (existingIndex >= 0) {
                              newConditions[existingIndex] = {
                                ...newConditions[existingIndex],
                                targetId: e.target.value
                              };
                            }
                            
                            handleConditionChange(newConditions);
                          }}
                        >
                          <option value="">Select target question</option>
                          {availableFields.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.question || `Question (${f.id})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Table field specific settings */}
        {field.type === 'table' && (
          <div className="config-field">
            <label className="form-label">Table Configuration</label>
            
            {/* Column configuration */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Columns</label>
              {field.columns?.map((column, index) => (
                <div key={index} className="card" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '500' }}>Column {index + 1}</div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ 
                        backgroundColor: '#f87171', 
                        color: 'white',
                        padding: '0.125rem 0.375rem',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => handleRemoveColumn(index)}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Column Name</label>
                    <input
                      type="text"
                      value={column.name || ''}
                      onChange={(e) => handleUpdateColumn(index, { name: e.target.value })}
                      className="input"
                      style={{ height: '2rem' }}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Column Type</label>
                    <select
                      value={column.type || 'text'}
                      onChange={(e) => handleUpdateColumn(index, { type: e.target.value })}
                      className="input"
                      style={{ height: '2rem' }}
                    >
                      <option value="text">Text</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddColumn}
              >
                Add Column
              </button>
            </div>
            
            {/* Sample data section (now updates actual value) */}
            {field.columns?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Sample Rows
                  <span style={{ fontWeight: 'normal', fontStyle: 'italic', marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    (Will appear in the form)
                  </span>
                </label>
                
                {/* Display sample rows */}
                {field.value && field.value.length > 0 ? (
                  <div style={{ marginBottom: '1rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {field.columns.map((col, idx) => (
                            <th key={idx} style={{ 
                              padding: '0.375rem', 
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              textAlign: 'left',
                              fontSize: '0.75rem'
                            }}>
                              {col.name}
                            </th>
                          ))}
                          <th style={{ width: '40px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {field.value.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {field.columns.map((col, colIdx) => (
                              <td key={colIdx} style={{ padding: '0.25rem', border: '1px solid #e5e7eb' }}>
                                <input
                                  type="text"
                                  value={row[col.name] || ''}
                                  onChange={(e) => handleTestCellChange(rowIdx, col.name, e.target.value)}
                                  className="input"
                                  style={{ 
                                    height: '1.75rem', 
                                    padding: '0.25rem',
                                    fontSize: '0.75rem',
                                    border: 'none',
                                    boxShadow: 'none'
                                  }}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '0.25rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveTestRow(rowIdx)}
                                style={{ 
                                  backgroundColor: '#f87171',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  width: '18px',
                                  height: '18px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.625rem',
                                  padding: 0,
                                  cursor: 'pointer'
                                }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.25rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    No sample rows added yet
                  </div>
                )}
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddTestRow}
                  style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                >
                  Add Sample Row
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldConfigPanel;
