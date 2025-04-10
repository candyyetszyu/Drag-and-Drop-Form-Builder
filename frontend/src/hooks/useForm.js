// Custom hook for managing form state, validation, and interactions
import { useState, useCallback } from 'react';

// Add debugging to help troubleshoot
export const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues); // Form values
  const [errors, setErrors] = useState({}); // Validation errors
  const [touched, setTouched] = useState({}); // Touched fields

  // Handle input value changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      console.log(`Field changed: ${name}`, type === 'checkbox' ? checked : value);
      
      setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validate) {
        setErrors((prev) => ({ ...prev, [name]: validate(name, value, values) })); // Pass values
      }
    },
    [validate, values]
  );

  // Handle input blur events
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validate) {
        setErrors((prev) => ({ ...prev, [name]: validate(name, values[name], values) })); // Pass values
      }
    },
    [validate, values]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set a specific field value
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (validate) {
        setErrors((prev) => ({ ...prev, [name]: validate(name, value, values) })); // Pass values
      }
    },
    [validate]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    setFieldValue,
    setValues,
  };
};