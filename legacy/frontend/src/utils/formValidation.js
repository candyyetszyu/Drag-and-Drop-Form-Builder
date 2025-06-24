/**
 * Utility functions for form validation
 */

/**
 * Validates a form configuration before saving
 * @param {Object} formConfig - The form configuration to validate
 * @returns {Object} Object with validation errors
 */
export const validateFormConfig = (formConfig) => {
  const { title, description, fields } = formConfig;
  const errors = {};
  
  // Validate form title
  if (!title) {
    errors.title = "Form title is required";
  }
  
  // Validate that form has fields
  if (!fields || fields.length === 0) {
    errors.fields = "Form must have at least one field";
    return errors;
  }
  
  // Validate each field
  fields.forEach((field, index) => {
    // Check field question
    if (!field.question) {
      errors[`field_${field.id}`] = `Field ${index + 1} must have a question`;
    }
    
    // Validate field based on type
    switch (field.type) {
      case 'dropdown':
        if (!field.options || field.options.length === 0) {
          errors[`field_${field.id}_options`] = 
            `Dropdown field ${index + 1} must have at least one option`;
        }
        
        // Validate conditional logic
        if (field.conditions && field.conditions.length > 0) {
          field.conditions.forEach((condition, condIndex) => {
            if (condition.action && !condition.targetId) {
              errors[`field_${field.id}_condition_${condIndex}`] = 
                `Condition ${condIndex + 1} for field ${index + 1} needs a target question`;
            }
          });
        }
        break;
        
      case 'table':
        if (!field.columns || field.columns.length === 0) {
          errors[`field_${field.id}_columns`] = 
            `Table field ${index + 1} must have at least one column`;
        }
        break;
    }
  });
  
  return errors;
};

/**
 * Verifies that all validation rules are properly configured
 * @param {Array} fields - Array of field configurations
 * @returns {Object} Object with validation errors
 */
export const verifyValidationRules = (fields) => {
  const errors = {};
  
  fields.forEach((field, index) => {
    if (field.validation) {
      try {
        // Check pattern validation
        if (field.validation.pattern === 'custom') {
          if (!field.validation.customRule) {
            errors[`field_${field.id}_validation`] = 
              `Custom validation for field ${index + 1} requires a regex pattern`;
          } else {
            // Try to compile the regex
            try {
              new RegExp(field.validation.customRule);
            } catch (e) {
              errors[`field_${field.id}_validation_regex`] = 
                `Invalid regex pattern for field ${index + 1}: ${e.message}`;
            }
          }
        }
        
        // Verify error message exists
        if (!field.validation.errorMessage) {
          errors[`field_${field.id}_validation_message`] = 
            `Field ${index + 1} should have an error message for validation`;
        }
      } catch (e) {
        errors[`field_${field.id}_validation_error`] = 
          `Error in validation configuration for field ${index + 1}: ${e.message}`;
      }
    }
  });
  
  return errors;
};
