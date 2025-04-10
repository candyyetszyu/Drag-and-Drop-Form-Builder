import React, { useState } from 'react';
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
`;

const Th = styled.th`
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: #f5f5f5;
`;

const Td = styled.td`
  padding: 0.5rem;
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

const TableInputField = ({ 
  questionText, 
  isRequired, 
  columnDefinitions = [], 
  tableData = [], 
  onTableChange,
  isPreviewMode = false,
  validationError
}) => {
  const [rows, setRows] = useState(tableData || []);

  const handleAddRow = () => {
    const newRow = columnDefinitions.reduce((acc, col) => {
      acc[col.id] = '';
      return acc;
    }, {});
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    if (onTableChange) {
      onTableChange(updatedRows);
    }
  };

  const handleCellChange = (rowIndex, columnId, newValue) => {
    const updatedRows = rows.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnId]: newValue };
      }
      return row;
    });
    setRows(updatedRows);
    if (onTableChange) {
      onTableChange(updatedRows);
    }
  };

  return (
    <FieldContainer>
      <Question>
        {questionText}
        {isRequired && <span style={{ color: 'red' }}> *</span>}
      </Question>
      <Table>
        <thead>
          <tr>
            {columnDefinitions.map((column) => (
              <Th key={column.id}>{column.name}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columnDefinitions.map((column) => (
                <Td key={column.id}>
                  {column.type === 'text' ? (
                    <input
                      type="text"
                      value={row[column.id] || ''}
                      onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                      disabled={!isPreviewMode}
                    />
                  ) : (
                    <select
                      value={row[column.id] || ''}
                      onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                      disabled={!isPreviewMode}
                    >
                      <option value="">Select an option</option>
                      {column.options?.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  )}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      {isPreviewMode && (
        <AddRowButton onClick={handleAddRow} disabled={columnDefinitions.length === 0}>
          Add Row
        </AddRowButton>
      )}
      {validationError && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{validationError}</div>}
    </FieldContainer>
  );
};

export default TableInputField;