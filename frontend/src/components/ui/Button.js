import React from 'react';
import PropTypes from 'prop-types';
import { memo } from 'react';

const Button = ({ children, type = 'button', disabled = false, fullWidth = false, className = '', ...props }) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string
};

export default memo(Button);