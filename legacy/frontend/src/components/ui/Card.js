import PropTypes from 'prop-types';
import { memo } from 'react';

const Card = memo(({ 
  children, 
  title,
  className = '',
  ...props 
}) => (
  <div 
    className={`bg-white rounded-lg shadow p-4 ${className}`}
    {...props}
  >
    {title && (
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
    )}
    {children}
  </div>
));

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default Card; 