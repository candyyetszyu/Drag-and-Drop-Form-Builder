import React, { useState } from 'react';

const FormValidationModal = ({ isOpen, onClose, formData, onSave }) => {
  const [validationCode, setValidationCode] = useState('1234');
  const [testValue, setTestValue] = useState('');
  const [testResult, setTestResult] = useState(null);
  
  if (!isOpen) return null;
  
  const handleTest = () => {
    if (!testValue) {
      setTestResult({
        passed: false,
        message: 'Please enter a test value'
      });
      return;
    }
    
    const passed = testValue === validationCode;
    setTestResult({
      passed,
      message: passed 
        ? 'Validation passed! You can save the form.' 
        : 'Validation failed. Please check your code.'
    });
  };
  
  const handleSave = () => {
    if (!testResult || !testResult.passed) {
      const confirmed = window.confirm(
        'You have not successfully tested the validation code. Are you sure you want to save anyway?'
      );
      
      if (!confirmed) return;
    }
    
    // Add validation code to form data
    const updatedFormData = {
      ...formData,
      validationCode,
    };
    
    onSave(updatedFormData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Form Validation</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="mb-4 text-gray-700">
              Set a validation code that administrators will need to enter before submitting the form. 
              The default code is "1234".
            </p>
            
            <label className="block text-sm font-medium mb-2">Validation Code</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value)}
              placeholder="Enter validation code"
            />
            <p className="text-xs text-gray-500 mt-1">
              This code will be required to save the form
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Test Validation</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="Enter test code"
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleTest}
              >
                Test
              </button>
            </div>
            
            {testResult && (
              <div className={`mt-2 p-2 rounded ${
                testResult.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormValidationModal;
