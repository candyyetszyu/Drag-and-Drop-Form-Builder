import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FieldContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const Question = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.75rem; // Smaller font for the whole table
`;

const Th = styled.th`
  padding: 0.25rem; // Smaller padding
  border: 1px solid #ddd;
  background: #f5f5f5;
  text-align: left;
  font-size: 0.75rem;
`;

const Td = styled.td`
  padding: 0.125rem; // Extra small padding
  border: 1px solid #ddd;
`;

const AddRowButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const TableField = ({
  question,
  required,
  columns = [],
  value = [],
  onChange,
  isPreview = false
}) => {
  const [rows, setRows] = useState(value && value.length ? value : []);

  // Sync with parent component when value changes
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(rows)) {
      setRows(value.length ? value : []);
    }
  }, [value]);

  // Create an empty row based on current columns
  const createEmptyRow = () => {
    return columns.reduce((acc, col) => {
      const key = col.id || col.name;
      acc[key] = '';
      return acc;
    }, {});
  };

  // Handle adding a new row
  const handleAddRow = () => {
    console.log("Adding row, current rows:", rows);
    console.log("Columns:", columns);
    
    if (!columns.length) {
      console.log("No columns defined, cannot add row");
      return;
    }
    
    const newRow = createEmptyRow();
    console.log("Created new empty row:", newRow);
    
    const newRows = [...rows, newRow];
    console.log("New rows array:", newRows);
    
    setRows(newRows);
    
    if (onChange) {
      console.log("Calling onChange with new rows");
      onChange(newRows);
    }
  };

  // Handle cell value changes
  const handleCellChange = (rowIndex, columnKey, newValue) => {
    console.log(`Changing cell at row ${rowIndex}, column ${columnKey} to:`, newValue);
    
    const newRows = rows.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnKey]: newValue };
      }
      return row;
    });
    
    setRows(newRows);
    
    if (onChange) {
      onChange(newRows);
    }
  };

  // Handle removing a row
  const handleRemoveRow = (rowIndex) => {
    console.log(`Removing row at index ${rowIndex}`);
    
    const newRows = rows.filter((_, index) => index !== rowIndex);
    setRows(newRows);
    
    if (onChange) {
      onChange(newRows);
    }
  };

  // Initialize with at least one row if we have columns but no rows
  useEffect(() => {
    if (columns.length > 0 && rows.length === 0 && isPreview) {
      console.log("Initializing with one empty row");
      handleAddRow();
    }
  }, [columns, isPreview]);

  return (
    <FieldContainer>
      <Question>
        {question}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Question>
      <Table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <Th key={index}>
                {column.name}
              </Th>
            ))}
            {isPreview && (
              <Th>
                Actions
              </Th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => {
                const columnKey = column.id || column.name;
                return (
                  <Td key={colIndex}>
                    {column.type === 'dropdown' ? (
                      <select
                        value={row[columnKey] || ''}
                        onChange={(e) => handleCellChange(rowIndex, columnKey, e.target.value)}
                        disabled={!isPreview}
                        style={{ 
                          padding: '0.125rem 0.25rem', // Even smaller padding
                          height: '1.5rem', // Reduced height
                          fontSize: '0.7rem', // Smaller font
                          lineHeight: '1', // Tighter line height
                          minWidth: '100%',
                          border: '1px solid #e5e7eb',
                          boxShadow: 'none'
                        }}
                      >
                        <option value="">Select</option>
                        {column.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option.value || option}>
                            {option.label || option.value || option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row[columnKey] || ''}
                        onChange={(e) => handleCellChange(rowIndex, columnKey, e.target.value)}
                        disabled={!isPreview}
                        style={{ 
                          padding: '0.125rem 0.25rem', // Even smaller padding
                          height: '1.5rem', // Reduced height
                          fontSize: '0.7rem', // Smaller font
                          lineHeight: '1', // Tighter line height
                          minWidth: '100%',
                          border: '1px solid #e5e7eb',
                          boxShadow: 'none'
                        }}
                      />
                    )}
                  </Td>
                );
              })}
              {isPreview && (
                <Td>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(rowIndex)}
                    style={{ 
                      padding: '0.25rem',
                      backgroundColor: '#f87171',
                      color: 'white',
                      borderRadius: '0.25rem',
                      width: '24px',
                      height: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {isPreview && (
        <AddRowButton onClick={handleAddRow} disabled={columns.length === 0}>
          Add Row
        </AddRowButton>
      )}
    </FieldContainer>
  );
};

export default TableField;