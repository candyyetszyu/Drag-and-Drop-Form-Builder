import { useDrag, useDrop } from 'react-dnd';
import { useFormBuilder } from '../context/FormBuilderContext';

export const useDragDrop = (type, id, index) => {
  const { dispatch } = useFormBuilder();

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: type,
    drop: (item) => {
      if (item.index !== index) {
        dispatch({
          type: 'MOVE_FIELD',
          payload: {
            fromIndex: item.index,
            toIndex: index,
          },
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return {
    drag,
    drop,
    isDragging,
    isOver,
  };
}; 