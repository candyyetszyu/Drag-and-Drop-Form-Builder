import React from 'react';
import { useDrag } from 'react-dnd';

// DraggableFieldType component
const DraggableFieldType = ({ fieldType, label, icon, onClick, style = {} }) => {
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
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        ...style
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default DraggableFieldType;