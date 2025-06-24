/**
 * Utilities for handling form status operations
 */

/**
 * Checks if a form is active and can accept submissions
 * @param {Object} form - The form object to check
 * @returns {boolean} - True if the form is active, false otherwise
 */
const isFormActive = (form) => {
  if (!form) return false;
  return form.status !== 'disabled';
};

/**
 * Handles the DB version differences for form status
 * @param {Object} row - The database row representing a form
 * @returns {Object} - The form with standardized status field
 */
const normalizeFormStatus = (row) => {
  if (!row) return null;
  
  // Ensure status has a default value if not present
  if (row.status === undefined || row.status === null) {
    row.status = 'active';
  }
  
  return row;
};

/**
 * Validates a status string is acceptable
 * @param {string} status - The status to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidStatus = (status) => {
  return ['active', 'disabled'].includes(status);
};

module.exports = {
  isFormActive,
  normalizeFormStatus,
  isValidStatus
};
