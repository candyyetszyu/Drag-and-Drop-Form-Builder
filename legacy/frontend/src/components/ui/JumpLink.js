import React from 'react';
import PropTypes from 'prop-types';

const JumpLink = ({ targetId, targetRef, label, className = '', onClick, ...props }) => {
  const handleClick = () => {
    // Try to use the ref first if provided
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    } 
    // Otherwise try to find the element by ID
    else if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Call any additional onClick handler
    if (onClick) onClick();
  };

  return (
    <span
      className={`jump-link ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      {...props}
    >
      {label}
    </span>
  );
};

JumpLink.propTypes = {
  targetId: PropTypes.string,
  targetRef: PropTypes.object, // React ref object
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default JumpLink;
