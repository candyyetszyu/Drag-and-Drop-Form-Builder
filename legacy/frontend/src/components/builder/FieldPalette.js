import React from 'react';
import { useDrag } from 'react-dnd';

// Define the field types
const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼' },
  { type: 'table', label: 'Table', icon: '📊' },
  { type: 'file', label: 'File Upload', icon: '📎' },
];

// Draggable field type component
const DraggableFieldType = ({ fieldType, label, icon, onClick, style }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD_TYPE',
    item: { type: fieldType },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="btn btn-primary margin-responsive"
      onClick={() => onClick(fieldType)}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

const FieldPalette = ({ onFieldSelect, themeColors = { primaryColor: '#3b82f6' } }) => (
  <div>
    <h2 style={{ 
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      Field Types
      <span style={{ 
        fontSize: '0.75rem', 
        color: '#6b7280',
        fontStyle: 'italic',
        fontWeight: 'normal',
        marginLeft: '0.5rem'
      }}>
        (Drag or Click)
      </span>
    </h2>
    
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {fieldTypes.map(field => (
          <DraggableFieldType 
            key={field.type}
            fieldType={field.type} 
            label={field.label} 
            icon={field.icon}
            onClick={onFieldSelect}
            style={{ backgroundColor: themeColors.primaryColor }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default FieldPalette;