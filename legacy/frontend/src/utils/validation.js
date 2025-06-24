/**
 * Field validation utility functions
 */

// Common validation patterns
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  NUMBER: /^\d+$/,
  ZIPCODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
};

/**
 * Validates a value against a pattern
 * @param {string} value - The value to validate
 * @param {string|RegExp} pattern - The pattern to validate against
 * @returns {boolean} Whether the value is valid
 */
export const validatePattern = (value, pattern) => {
  if (!value || !pattern) return true;
  
  // Handle predefined patterns
  if (typeof pattern === 'string') {
    switch (pattern) {
      case 'email':
        return ValidationPatterns.EMAIL.test(value);
      case 'phone':
        return ValidationPatterns.PHONE.test(value);
      case 'number':
        return ValidationPatterns.NUMBER.test(value);
      case 'zipcode':
        return ValidationPatterns.ZIPCODE.test(value);
      case 'date':
        return ValidationPatterns.DATE.test(value);
      default:
        // Try to parse as regex
        try {
          const regex = new RegExp(pattern);
          return regex.test(value);
        } catch (error) {
          console.error('Invalid regex pattern:', pattern);
          return false;
        }
    }
  }
  
  // Handle RegExp objects
  if (pattern instanceof RegExp) {
    return pattern.test(value);
  }
  
  return true;
};

/**
 * Validates a field based on its validation rules
 * @param {Object} field - The field configuration
 * @param {string} value - The value to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateField = (field, value) => {
  if (!field.validation) return null;
  
  // Required validation
  if (field.validation.required && (!value || value === '')) {
    return field.validation.errorMessage || 'This field is required';
  }
  
  if (value) {
    // Pattern validation
    if (field.validation.pattern) {
      const patternToUse = field.validation.pattern === 'custom' 
        ? field.validation.customRule 
        : field.validation.pattern;
        
      if (!validatePattern(value, patternToUse)) {
        return field.validation.errorMessage || 'Invalid format';
      }
    }
  }
  
  return null;
};

/**
 * Validates an entire form
 * @param {Array} fields - Array of field configurations
 * @param {Object} values - Form values object
 * @returns {Object} Object with field IDs as keys and error messages as values
 */
export const validateForm = (fields, values) => {
  const errors = {};
  
  fields.forEach(field => {
    const value = values[field.id];
    const error = validateField(field, value);
    if (error) {
      errors[field.id] = error;
    }
  });
  
  return errors;
};

/**
 * Creates a custom validation function
 * @param {string} rule - The validation rule (can be a function body as string)
 * @returns {Function} A validation function
 */
export const createCustomValidator = (rule) => {
  try {
    // Create a function from the rule string
    return new Function('value', rule);
  } catch (error) {
    console.error('Error creating custom validator:', error);
    return () => true; // Default to always valid
  }
};
