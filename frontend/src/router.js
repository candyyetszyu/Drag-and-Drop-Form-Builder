import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormBuilderPage from './components/builder/FormBuilderPage';

// Create a test form with sample fields
const sampleFields = [
  {
    id: 'text1',
    type: 'text',
    question: 'What is your name?',
    isRequired: true,
    minLength: 2,
    maxLength: 50
  },
  {
    id: 'dropdown1',
    type: 'dropdown',
    question: 'What is your favorite color?',
    isRequired: false,
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' }
    ]
  },
  {
    id: 'table1',
    type: 'table',
    question: 'Enter your work experience',
    isRequired: false,
    columns: [
      { name: 'Company', type: 'text' },
      { name: 'Position', type: 'text' },
      { name: 'Years', type: 'text' }
    ]
  },
  {
    id: 'file1',
    type: 'file',
    question: 'Upload your resume',
    isRequired: false
  }
];

// Create a test component to display form fields
const TestFormPage = () => {
  const [fields, setFields] = React.useState(sampleFields);

  return (
    <div className="container padding-responsive">
      <h1>Test Form</h1>
      <div className="card">
        {fields.map(field => (
          <div key={field.id} className="margin-responsive">
            <div className="form-label">{field.question}</div>
            {field.type === 'text' && (
              <input
                type="text" 
                className="input" 
                placeholder={`Enter ${field.question}`}
              />
            )}
            {field.type === 'dropdown' && (
              <select className="input">
                <option value="">Select an option</option>
                {field.options.map((opt, i) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {field.type === 'table' && (
              <div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {field.columns.map((col, i) => (
                        <th key={i} className="border p-2">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {field.columns.map((col, i) => (
                        <td key={i} className="border p-2">
                          <input type="text" className="input" />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                <button className="btn btn-secondary mt-2">Add Row</button>
              </div>
            )}
            {field.type === 'file' && (
              <input type="file" className="input" />
            )}
          </div>
        ))}
        <div className="text-center">
          <button className="btn btn-primary">Submit</button>
        </div>
      </div>
    </div>
  );
};

// Create the router with routes
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <HomePage />
    },
    {
      path: "/builder",
      element: <FormBuilderPage />
    },
    {
      path: "/test",
      element: <TestFormPage />
    },
    // Fallback route for any undefined paths
    {
      path: "*",
      element: <HomePage />
    }
  ],
  {
    // Enable future flags to prevent deprecation warnings
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export default router;
