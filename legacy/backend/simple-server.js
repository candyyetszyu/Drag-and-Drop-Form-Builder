const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (for simplicity - can be replaced with database)
const storage = {
  forms: {},
  submissions: {},
  nextFormId: 1,
  nextSubmissionId: 1
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    formsCount: Object.keys(storage.forms).length,
    submissionsCount: Object.keys(storage.submissions).length
  });
});

// Get all forms
app.get('/api/forms', (req, res) => {
  try {
    const forms = Object.values(storage.forms).map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      shareUrl: form.shareUrl,
      created_at: form.created_at,
      fieldsCount: form.fields ? form.fields.length : 0,
      submissionsCount: Object.values(storage.submissions).filter(s => s.formId === form.id).length
    }));
    
    res.json({
      success: true,
      forms: forms
    });
  } catch (error) {
    console.error('Error getting forms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get forms'
    });
  }
});

// Get a specific form
app.get('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const form = storage.forms[id];
    
    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }
    
    res.json({
      success: true,
      form: form
    });
  } catch (error) {
    console.error('Error getting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get form'
    });
  }
});

// Create a new form with link generation
app.post('/api/forms', (req, res) => {
  try {
    const { title, description, fields, theme } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Form title is required'
      });
    }
    
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one form field is required'
      });
    }
    
    // Generate form ID and URLs
    const formId = storage.nextFormId.toString();
    storage.nextFormId++;
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/form/${formId}`;
    const editUrl = `${baseUrl}/edit/${formId}`;
    
    // Create the form
    const newForm = {
      id: formId,
      title: title.trim(),
      description: description || '',
      fields: fields,
      theme: theme || 'blue',
      shareUrl: shareUrl,
      editUrl: editUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };
    
    // Store the form
    storage.forms[formId] = newForm;
    
    console.log(`✅ Form created: ID=${formId}, Title="${title}"`);
    console.log(`🔗 Share URL: ${shareUrl}`);
    console.log(`✏️ Edit URL: ${editUrl}`);
    
    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      form: newForm,
      formId: formId,
      shareUrl: shareUrl,
      editUrl: editUrl
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create form'
    });
  }
});

// Update a form
app.put('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fields, theme } = req.body;
    
    if (!storage.forms[id]) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }
    
    // Update form data
    const updatedForm = {
      ...storage.forms[id],
      title: title || storage.forms[id].title,
      description: description !== undefined ? description : storage.forms[id].description,
      fields: fields || storage.forms[id].fields,
      theme: theme || storage.forms[id].theme,
      updated_at: new Date().toISOString()
    };
    
    storage.forms[id] = updatedForm;
    
    console.log(`✅ Form updated: ID=${id}`);
    
    res.json({
      success: true,
      message: 'Form updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update form'
    });
  }
});

// Submit form data
app.post('/api/forms/:id/submit', (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    if (!storage.forms[id]) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }
    
    if (storage.forms[id].status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Form is not accepting submissions'
      });
    }
    
    // Create submission
    const submissionId = storage.nextSubmissionId.toString();
    storage.nextSubmissionId++;
    
    const submission = {
      id: submissionId,
      formId: id,
      data: formData,
      submitted_at: new Date().toISOString(),
      ip_address: req.ip || req.connection.remoteAddress
    };
    
    storage.submissions[submissionId] = submission;
    
    console.log(`📝 Form submission received: Form=${id}, Submission=${submissionId}`);
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submissionId
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form'
    });
  }
});

// Get form submissions
app.get('/api/forms/:id/submissions', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!storage.forms[id]) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }
    
    const submissions = Object.values(storage.submissions)
      .filter(submission => submission.formId === id)
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    res.json({
      success: true,
      submissions: submissions
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get submissions'
    });
  }
});

// Delete a form
app.delete('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!storage.forms[id]) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }
    
    // Delete form and its submissions
    delete storage.forms[id];
    Object.keys(storage.submissions).forEach(submissionId => {
      if (storage.submissions[submissionId].formId === id) {
        delete storage.submissions[submissionId];
      }
    });
    
    console.log(`🗑️ Form deleted: ID=${id}`);
    
    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete form'
    });
  }
});

// Serve form by ID (for public access)
app.get('/form/:id', (req, res) => {
  const { id } = req.params;
  const form = storage.forms[id];
  
  if (!form) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1 class="error">Form Not Found</h1>
        <p>The form you're looking for doesn't exist or has been removed.</p>
      </body>
      </html>
    `);
  }
  
  if (form.status !== 'active') {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Unavailable</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .warning { color: #f39c12; }
        </style>
      </head>
      <body>
        <h1 class="warning">Form Unavailable</h1>
        <p>This form is currently not accepting submissions.</p>
      </body>
      </html>
    `);
  }
  
  // Generate a simple form HTML
  const formHtml = generateFormHtml(form);
  res.send(formHtml);
});

// Generate HTML for form display
function generateFormHtml(form) {
  const fieldsHtml = form.fields.map(field => {
    switch (field.type) {
      case 'text':
        return `
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              ${field.question}
              ${field.isRequired ? '<span style="color: red;">*</span>' : ''}
            </label>
            <input 
              type="text" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        `;
      case 'dropdown':
        const options = field.options ? field.options.map(opt => 
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('') : '';
        return `
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              ${field.question}
              ${field.isRequired ? '<span style="color: red;">*</span>' : ''}
            </label>
            <select 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            >
              <option value="">-- Select an option --</option>
              ${options}
            </select>
          </div>
        `;
      case 'file':
        return `
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              ${field.question}
              ${field.isRequired ? '<span style="color: red;">*</span>' : ''}
            </label>
            <input 
              type="file" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        `;
      default:
        return `
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              ${field.question}
              ${field.isRequired ? '<span style="color: red;">*</span>' : ''}
            </label>
            <input 
              type="text" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        `;
    }
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${form.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .form-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-title {
          color: #333;
          margin-bottom: 10px;
        }
        .form-description {
          color: #666;
          margin-bottom: 30px;
        }
        .submit-btn {
          background-color: #3b82f6;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        .submit-btn:hover {
          background-color: #2563eb;
        }
        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
          display: none;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1 class="form-title">${form.title}</h1>
        ${form.description ? `<p class="form-description">${form.description}</p>` : ''}
        
        <form id="submissionForm">
          ${fieldsHtml}
          <button type="submit" class="submit-btn">Submit</button>
        </form>
        
        <div id="successMessage" class="success-message">
          Thank you! Your form has been submitted successfully.
        </div>
        
        <div id="errorMessage" class="error-message">
          There was an error submitting your form. Please try again.
        </div>
      </div>

      <script>
        document.getElementById('submissionForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = {};
          
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
          
          try {
            const response = await fetch('/api/forms/${form.id}/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });
            
            if (response.ok) {
              document.getElementById('successMessage').style.display = 'block';
              document.getElementById('errorMessage').style.display = 'none';
              this.reset();
            } else {
              throw new Error('Submission failed');
            }
          } catch (error) {
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
          }
        });
      </script>
    </body>
    </html>
  `;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Form Builder API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('To test the server:');
  console.log(`curl http://localhost:${PORT}/api/health`);
});

module.exports = app; 