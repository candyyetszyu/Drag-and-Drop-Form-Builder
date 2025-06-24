import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFormBuilder } from '../context/FormBuilderContext';
import Button from '../components/Button';

const DashboardPage = () => {
  const { user } = useAuth();
  const { formFields, addField, removeField, moveField } = useFormBuilder();

  const handleAddField = (type) => {
    addField({
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: `Enter ${type}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            {formFields.map((field, index) => (
              <div key={field.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{field.label}</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => moveField(index, index - 1)} disabled={index === 0}>↑</Button>
                    <Button variant="outline" size="sm" onClick={() => moveField(index, index + 1)} disabled={index === formFields.length - 1}>↓</Button>
                    <Button variant="danger" size="sm" onClick={() => removeField(field.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={() => handleAddField('text')}>Add Text Field</Button>
            <Button onClick={() => handleAddField('email')}>Add Email Field</Button>
            <Button onClick={() => handleAddField('number')}>Add Number Field</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 