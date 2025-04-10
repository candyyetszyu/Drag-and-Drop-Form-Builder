import { useState } from 'react';
import { apiUtils } from '../api/apiConfig';

export const useFormSubmission = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit form data to the API
  const submitForm = async (formId, formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Submitting form ${formId} with data:`, formData);

      // Use apiUtils to submit the form
      const response = await apiUtils.post(`/forms/${formId}/submit`, formData);
      setSubmitted(true);
      setSubmissionData(response);
      return response;
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset submission state
  const resetSubmission = () => {
    setSubmitted(false);
    setSubmissionData(null);
    setError(null);
  };

  return {
    submitForm,
    resetSubmission,
    submitted,
    submissionData,
    loading,
    error,
  };
};
