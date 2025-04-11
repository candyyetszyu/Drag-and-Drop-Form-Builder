import { useState } from 'react';
import { apiUtils } from '../api/apiConfig';

export const useFormSubmission = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Submit form data to the API
  const submitForm = async (formId, formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Submitting form ${formId} with data:`, formData);

      // Extract and handle validation code if present
      const validationCode = formData._validationCode;
      const dataToSubmit = { ...formData };
      
      // Remove internal fields that shouldn't be submitted
      delete dataToSubmit._formId;
      delete dataToSubmit._submittedAt;
      delete dataToSubmit._validationCode;
      
      // Check if we need to validate
      if (validationCode) {
        // This might be handled differently depending on your requirements
        // For example, prompt the user for a code or validate against a stored code
        console.log('Form requires validation code:', validationCode);
      }

      // Check if there are files to upload
      const filesData = {};
      const hasFiles = Object.keys(dataToSubmit).some(key => 
        dataToSubmit[key] instanceof File || 
        (Array.isArray(dataToSubmit[key]) && dataToSubmit[key].some(item => item instanceof File))
      );
      
      // If there are files, handle them first
      if (hasFiles) {
        await uploadFormFiles(formId, dataToSubmit, filesData);
        
        // Replace file objects with file references in the formData
        Object.keys(filesData).forEach(fieldId => {
          dataToSubmit[fieldId] = filesData[fieldId];
        });
      }

      // Use apiUtils to submit the form to the correct endpoint
      const response = await apiUtils.post(`/forms/${formId}/submit`, dataToSubmit);
      
      if (response.success) {
        setSubmitted(true);
        setSubmissionData(response);
        return response;
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle file uploads
  const uploadFormFiles = async (formId, formData, filesData) => {
    const fileFields = Object.keys(formData).filter(key => {
      const value = formData[key];
      return value instanceof File || (Array.isArray(value) && value.some(item => item instanceof File));
    });
    
    if (fileFields.length === 0) return;
    
    const uploadedFileInfos = [];
    let completedUploads = 0;
    
    for (const fieldId of fileFields) {
      const fieldValue = formData[fieldId];
      
      // Handle single file upload
      if (fieldValue instanceof File) {
        const fileInfo = await uploadFile(formId, fieldId, fieldValue);
        uploadedFileInfos.push(fileInfo);
        filesData[fieldId] = fileInfo.fileId;
        completedUploads++;
        setUploadProgress(Math.round((completedUploads / fileFields.length) * 100));
      } 
      // Handle multiple file uploads
      else if (Array.isArray(fieldValue) && fieldValue.some(item => item instanceof File)) {
        const fileIds = [];
        for (const file of fieldValue.filter(item => item instanceof File)) {
          const fileInfo = await uploadFile(formId, fieldId, file);
          uploadedFileInfos.push(fileInfo);
          fileIds.push(fileInfo.fileId);
          completedUploads++;
          setUploadProgress(Math.round((completedUploads / fileFields.length) * 100));
        }
        filesData[fieldId] = fileIds;
      }
    }
    
    setUploadedFiles(uploadedFileInfos);
    return uploadedFileInfos;
  };

  // Upload a single file
  const uploadFile = async (formId, fieldId, file) => {
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('formId', formId);
    formDataObj.append('fieldId', fieldId);
    
    const response = await fetch(`${apiUtils.getBaseUrl()}/upload`, {
      method: 'POST',
      body: formDataObj,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'File upload failed');
    }
    
    return await response.json();
  };

  // Get all files for a form
  const getFormFiles = async (formId) => {
    try {
      setLoading(true);
      const files = await apiUtils.get(`/files/${formId}`);
      return files;
    } catch (err) {
      console.error('Error fetching form files:', err);
      setError('Failed to fetch form files');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Reset submission state
  const resetSubmission = () => {
    setSubmitted(false);
    setSubmissionData(null);
    setError(null);
    setUploadProgress(0);
    setUploadedFiles([]);
  };

  return {
    submitForm,
    getFormFiles,
    resetSubmission,
    submitted,
    submissionData,
    loading,
    error,
    uploadProgress,
    uploadedFiles
  };
};
