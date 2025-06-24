import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const DraggableField = ({ field, index, onSelect, onDelete, onMove, children }) => {
  const ref = useRef(null);
  
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_FIELD',
    item: { id: field.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Set up drop target for reordering
  const [{ handlerId }, drop] = useDrop({
    accept: 'FORM_FIELD',
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop refs
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`
        padding-responsive 
        margin-responsive 
        field-container 
        border 
        border-dashed 
        cursor-pointer
      `}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
      }}
      onClick={() => onSelect(field)}
      data-handler-id={handlerId}
    >
      <div className="drag-handle" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        <div style={{ fontWeight: 'bold', color: '#6b7280' }}>
          <span style={{ marginRight: '0.5rem', cursor: 'move' }}>⟰</span>
          {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ backgroundColor: '#f87171', color: 'white', padding: '0.25rem 0.5rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
        >
          ✕
        </button>
      </div>
      
      {children}
    </div>
  );
};

export default DraggableField;
