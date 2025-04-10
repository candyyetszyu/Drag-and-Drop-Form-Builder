import { useState, useCallback } from 'react';

export const useFormState = (initialValues = {}, validate) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormValues((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
      setTouchedFields((prev) => ({ ...prev, [name]: true }));
      
      if (validate) {
        const error = validate(name, value, formValues);
        setFormErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [formValues, validate]
  );

  const setFieldValue = useCallback(
    (name, value) => {
      setFormValues((prev) => ({ ...prev, [name]: value }));
      
      if (validate) {
        const error = validate(name, value, formValues);
        setFormErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [formValues, validate]
  );

  return {
    formValues,
    formErrors,
    touchedFields,
    handleInputChange,
    setFieldValue,
    setFormValues,
  };
};

export default useFormState;
