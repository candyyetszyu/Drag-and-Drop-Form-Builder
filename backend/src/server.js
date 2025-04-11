const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mysql = require('mysql2/promise');
// Add dotenv for environment variable loading
const dotenv = require('dotenv');
// Add DB upgrade import at the top with other imports
const { upgradeDatabase } = require('./dbUpgrade');

// Load environment variables from .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });   // backend/.env file

const fileStorage = process.env.FILE_STORAGE === 'true' 
  ? require('./storage/fileStorage') 
  : null;

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for development
const inMemoryStorage = {
  forms: [
    {
      id: '1',
      title: 'Customer Feedback Survey',
      description: 'Help us improve our products and services',
      fields: [
        {
          id: 'name',
          type: 'text',
          question: 'What is your name?',
          isRequired: true
        },
        {
          id: 'email',
          type: 'text',
          question: 'What is your email address?',
          isRequired: true
        },
        {
          id: 'rating',
          type: 'dropdown',
          question: 'How would you rate our service?',
          isRequired: true,
          options: [
            { value: '5', label: 'Excellent' },
            { value: '4', label: 'Good' },
            { value: '3', label: 'Average' },
            { value: '2', label: 'Below Average' },
            { value: '1', label: 'Poor' }
          ]
        },
        {
          id: 'feedback',
          type: 'text',
          question: 'Do you have any additional feedback?',
          isRequired: false
        }
      ],
      created_at: new Date().toISOString()
    }
  ],
  submissions: []
};

// Import the admin controller
const adminController = require('./controllers/adminController');

// Initialize database connection
let pool;
let dbConnected = false;
let fileStorageEnabled = false;

async function initializeDatabase() {
  // Check if file storage is requested
  if (process.env.FILE_STORAGE === 'true' && fileStorage) {
    console.log('File storage mode requested. Initializing file storage...');
    fileStorageEnabled = await fileStorage.initializeStorage();
    if (fileStorageEnabled) {
      console.log('✅ File storage initialized successfully');
      return true;
    }
  }

  try {
    console.log('Connecting to MySQL database...');
    
    // Log database connection details (without showing full password)
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ? '********' : '<empty>',
      database: process.env.DB_NAME || 'marketing_campaign_form'
    };
    console.log('Using database configuration:');
    console.log(`- Host: ${dbConfig.host}`);
    console.log(`- User: ${dbConfig.user}`);
    console.log(`- Password: ${dbConfig.password}`);
    console.log(`- Database: ${dbConfig.database}`);
    console.log(`- DB_PASSWORD env variable exists: ${process.env.DB_PASSWORD ? 'Yes' : 'No'}`);
    
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'marketing_campaign_form',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test the connection
    const [rows] = await pool.query('SELECT 1 as connection_test');
    if (rows && rows[0].connection_test === 1) {
      console.log('✅ MySQL database connected successfully');
      dbConnected = true;

      console.log('Connected to MySQL database. Testing connection...');
      try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Database connection successful.');
        
        // Upgrade database schema if needed
        await upgradeDatabase(pool);
        
        // Set the database pool for admin controller
        adminController.setDbPool(pool);
      } catch (error) {
        console.error('Error testing database connection:', error);
        dbConnected = false;
        pool = null;
      }

      console.log('Admin controller database pool set successfully');
      // Check if tables exist
      try {
        const [tables] = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = ?
        `, [process.env.DB_NAME || 'marketing_campaign_form']);
        
      } catch (error) {
        console.error('Error checking database tables:', error.message);
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    
    // More detailed error handling
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Access denied error. Check your username and password.');
      console.error(`Current user: ${process.env.DB_USER || 'root'}`);
      console.error('Password provided: ' + (process.env.DB_PASSWORD ? 'Yes' : 'No'));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure MySQL server is running.');
      console.error('Try: brew services start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`❌ Database '${process.env.DB_NAME || 'marketing_campaign_form'}' does not exist.`);
      console.error('Run: npm run init-db');
    }
    
    // If file storage was not already initialized, try it now as a fallback
    if (!fileStorageEnabled && fileStorage) {
      console.log('Attempting to initialize file-based storage as fallback...');
      fileStorageEnabled = await fileStorage.initializeStorage();
      if (fileStorageEnabled) {
        console.log('✅ File-based storage initialized successfully');
        return true;
      }
    }
    
    console.log('API will run in fallback mode with in-memory storage');
    return false;
  }
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: dbConnected ? 'mysql' : (fileStorageEnabled ? 'file-storage' : 'in-memory'),
    timestamp: new Date().toISOString(),
    message: dbConnected
      ? 'Backend server is running with MySQL database'
      : (fileStorageEnabled 
          ? 'Backend server is running with file-based storage'
          : 'Backend server is running with in-memory storage')
  });
});

// API to get all forms
app.get('/api/forms', async (req, res) => {
  try {
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        'SELECT id, title, description, created_at FROM forms ORDER BY created_at DESC'
      );
      return res.json({
        success: true,
        forms: rows
      });
    } else if (fileStorageEnabled) {
      const forms = await fileStorage.getForms();
      return res.json({
        success: true,
        forms: forms.map(form => ({
          id: form.id,
          title: form.title,
          description: form.description,
          created_at: form.created_at
        }))
      });
    } else {
      // Fallback to in-memory storage
      res.json({
        success: true,
        forms: inMemoryStorage.forms.map(form => ({
          id: form.id,
          title: form.title,
          description: form.description,
          created_at: form.created_at
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch forms'
    });
  }
});

// API to get a specific form
app.get('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbConnected && pool) {
      try {
        // First check if submission_count column exists
        const [columns] = await pool.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'forms' 
          AND COLUMN_NAME = 'submission_count'
        `);
        
        let query;
        if (columns.length > 0) {
          // If submission_count exists, include it
          query = 'SELECT id, title, description, fields, created_at, submission_count FROM forms WHERE id = ?';
        } else {
          // Otherwise use a query without submission_count
          query = 'SELECT id, title, description, fields, created_at FROM forms WHERE id = ?';
        }
        
        const [rows] = await pool.query(query, [id]);
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Form not found'
          });
        }
        
        // If submission_count doesn't exist in the database, compute it
        if (!columns.length) {
          // Calculate submission count from submissions table
          try {
            const [countResult] = await pool.query(
              'SELECT COUNT(*) as count FROM form_submissions WHERE form_id = ?',
              [id]
            );
            rows[0].submission_count = countResult[0].count;
          } catch (countError) {
            console.error('Error calculating submission count:', countError);
            rows[0].submission_count = 0;
          }
        }
        
        return res.json({
          success: true,
          form: rows[0]
        });
      } catch (dbError) {
        console.error('Database error fetching form:', dbError);
        // Fall back to other storage options
      }
    } else if (fileStorageEnabled) {
      const form = await fileStorage.getFormById(id);
      
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
      
      return res.json({
        success: true,
        form
      });
    } else {
      const form = inMemoryStorage.forms.find(form => form.id === id);
      
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
      
      res.json({
        success: true,
        form
      });
    }
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch form'
    });
  }
});

// API to create a form
app.post('/api/forms', async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        success: false,
        error: 'Title is required' 
      });
    }
    
    // If connected to database, save form there
    if (dbConnected && pool) {
      try {
        const [result] = await pool.query(
          'INSERT INTO forms (title, description, fields) VALUES (?, ?, ?)',
          [title, description, JSON.stringify(fields)]
        );
        
        const formId = result.insertId;
        const shareUrl = `${req.protocol}://${req.get('host')}/form/${formId}`;
        
        // Update the form with the share URL
        await pool.query(
          'UPDATE forms SET share_url = ? WHERE id = ?',
          [shareUrl, formId]
        );
        
        return res.status(201).json({
          success: true,
          message: 'Form created successfully',
          formId: formId,
          shareUrl: shareUrl
        });
      } catch (dbError) {
        console.error('Database error creating form:', dbError);
        // Fall back to other storage options
      }
    } else if (fileStorageEnabled) {
      try {
        const newForm = await fileStorage.createForm({
          title,
          description, 
          fields
        });
        
        const shareUrl = `${req.protocol}://${req.get('host')}/form/${newForm.id}`;
        newForm.share_url = shareUrl;
        
        await fileStorage.updateForm(newForm.id, newForm);
        
        return res.status(201).json({
          success: true,
          message: 'Form created successfully (file storage)',
          formId: newForm.id,
          shareUrl: shareUrl
        });
      } catch (fileError) {
        console.error('File storage error creating form:', fileError);
        // Fall back to in-memory storage
      }
    } 
    
    // Default to in-memory storage
    const formId = Date.now().toString();
    const newForm = {
      id: formId,
      title,
      description,
      fields,
      created_at: new Date().toISOString()
    };
    
    const shareUrl = `${req.protocol}://${req.get('host')}/form/${formId}`;
    newForm.share_url = shareUrl;
    
    inMemoryStorage.forms.push(newForm);
    res.status(201).json({
      success: true,
      message: 'Form created successfully (in-memory)',
      formId,
      shareUrl
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create form'
    });
  }
});

// API to submit a form - enhanced to handle form status
app.post('/api/forms/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    // Log the submission attempt
    console.log(`Attempting to submit form ${id} with data:`, JSON.stringify(formData, null, 2));
    
    let formExists = false;
    let formDisabled = false;
    
    // Check if form exists and is active
    if (dbConnected && pool) {
      const [rows] = await pool.query('SELECT id, status FROM forms WHERE id = ?', [id]);
      formExists = rows.length > 0;
      formDisabled = formExists && rows[0].status === 'disabled';
    } else if (fileStorageEnabled) {
      const form = await fileStorage.getFormById(id);
      formExists = !!form;
      formDisabled = formExists && form.status === 'disabled';
    } else {
      const form = inMemoryStorage.forms.find(form => form.id === id);
      formExists = !!form;
      formDisabled = formExists && form.status === 'disabled';
    }
    
    if (!formExists) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    if (formDisabled) {
      return res.status(403).json({
        success: false,
        message: 'This form is currently disabled and not accepting submissions'
      });
    }
    
    // Continue with form submission for active forms
    if (dbConnected && pool) {
      try {
        const [result] = await pool.query(
          'INSERT INTO form_submissions (form_id, response_data, submitted_at) VALUES (?, ?, NOW())',
          [id, JSON.stringify(formData)]
        );
        
        console.log(`Form submission successful. Submission ID: ${result.insertId}`);
        
        // Add tracking information
        await pool.query(
          'UPDATE forms SET submission_count = submission_count + 1 WHERE id = ?', 
          [id]
        );
        
        return res.status(201).json({
          success: true,
          message: 'Form submitted successfully to database',
          submissionId: result.insertId
        });
      } catch (dbError) {
        console.error('Database error submitting form:', dbError);
        // Fall through to fallback options
      }
    } else if (fileStorageEnabled && fileStorage) {
      const submission = await fileStorage.createSubmission(id, formData);
      return res.status(201).json({
        success: true,
        message: 'Form submitted successfully (file storage)',
        submissionId: submission.id
      });
    } else {
      const submissionId = Date.now().toString();
      const submission = {
        id: submissionId,
        formId: id,
        data: formData,
        submitted_at: new Date().toISOString()
      };
      inMemoryStorage.submissions.push(submission);
      res.status(201).json({
        success: true,
        message: 'Form submitted successfully',
        submissionId
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form'
    });
  }
});

// API to get submissions for a form
app.get('/api/forms/:id/submissions', async (req, res) => {
  const { id } = req.params;
  try {
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        'SELECT id, response_data, submitted_at FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC',
        [id]
      );
      return res.json({
        success: true,
        submissions: rows
      });
    } else if (fileStorageEnabled) {
      const submissions = await fileStorage.getSubmissionsByFormId(id);
      return res.json({
        success: true,
        submissions
      });
    } else {
      const submissions = inMemoryStorage.submissions.filter(sub => sub.formId === id);
      res.json({
        success: true,
        submissions
      });
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch submissions'
    });
  }
});

// Serve static files for the admin dashboard
app.use('/admin/styles', express.static(path.join(__dirname, '../public/styles')));

// Serve the admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

// API endpoint to update a form's status
app.patch('/api/forms/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "disabled"'
      });
    }
    
    let updated = false;
    
    if (dbConnected && pool) {
      try {
        // First check if status column exists
        const [columns] = await pool.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'forms' 
          AND COLUMN_NAME = 'status'
        `);
        
        if (columns.length > 0) {
          // If status column exists, update it
          const [result] = await pool.query(
            'UPDATE forms SET status = ? WHERE id = ?',
            [status, id]
          );
          updated = result.affectedRows > 0;
        } else {
          // If status column doesn't exist, need to add it first
          await pool.query(`
            ALTER TABLE forms 
            ADD COLUMN status ENUM('active', 'disabled') DEFAULT 'active'
          `);
          
          // Then update the status
          const [result] = await pool.query(
            'UPDATE forms SET status = ? WHERE id = ?',
            [status, id]
          );
          updated = result.affectedRows > 0;
        }
      } catch (dbError) {
        console.error('Database error updating form status:', dbError);
        // Fall through to other storage options
      }
    } else if (fileStorageEnabled) {
      try {
        const form = await fileStorage.getFormById(id);
        if (form) {
          form.status = status;
          await fileStorage.updateForm(id, form);
          updated = true;
        }
      } catch (fileError) {
        console.error('File storage error updating form status:', fileError);
      }
    } else {
      // Update in-memory storage
      const formIndex = inMemoryStorage.forms.findIndex(f => f.id === id);
      if (formIndex !== -1) {
        inMemoryStorage.forms[formIndex].status = status;
        updated = true;
      }
    }
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.json({
      success: true,
      message: `Form status updated to ${status}`,
      status
    });
  } catch (error) {
    console.error('Error updating form status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update form status'
    });
  }
});

// API endpoint for admin to get all forms
app.get('/api/admin/forms', async (req, res) => {
  try {
    const forms = await adminController.getAllForms();
    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching forms for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch forms'
    });
  }
});

// API endpoint for admin to get all submissions
app.get('/api/admin/submissions', async (req, res) => {
  try {
    const submissions = await adminController.getAllSubmissions();
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch submissions'
    });
  }
});

// API endpoint for admin to get a specific form
app.get('/api/admin/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await adminController.getFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.json({ success: true, form });
  } catch (error) {
    console.error('Error fetching form for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch form'
    });
  }
});

// API endpoint for admin to get a specific submission
app.get('/api/admin/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await adminController.getSubmissionById(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error fetching submission for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch submission'
    });
  }
});

// API endpoint for admin to delete a form
app.delete('/api/admin/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await adminController.deleteForm(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete form'
    });
  }
});

// API endpoint for admin to delete a submission
app.delete('/api/admin/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await adminController.deleteSubmission(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete submission'
    });
  }
});

// Serve frontend static files if available
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
  console.log('Serving frontend build from:', buildPath);
} else {
  // Create a simple HTML page for direct API testing
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Marketing Campaign API</title>
          <style>
            body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
            h1 { color: #2563eb; }
            .endpoint { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
            .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; font-weight: bold; }
            .get { background: #dbeafe; color: #1e40af; }
            .post { background: #dcfce7; color: #166534; }
            .put { background: #fef3c7; color: #92400e; }
            .delete { background: #fee2e2; color: #b91c1c; }
            pre { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            a { color: #2563eb; }
            .section-title { margin-top: 2rem; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <h1>Marketing Campaign API</h1>
          <p>Backend server is running. All API endpoints available:</p>
          <h2 class="section-title">Form Management</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/health</strong>
            <p>Check if the API is running</p>
            <a href="/api/health" target="_blank">Test this endpoint</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/forms</strong>
            <p>Get all forms</p>
            <a href="/api/forms" target="_blank">Test this endpoint</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/forms/:id</strong>
            <p>Get a specific form by ID</p>
            <a href="/api/forms/1" target="_blank">Test with sample form</a>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/forms</strong>
            <p>Create a new form</p>
            <pre>
// Example request body:
{         
  "title": "New Customer Survey",
  "description": "Tell us about your experience",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "question": "Your name",
      "isRequired": true
    }
  ]
}
            </pre>
          </div>
          
          <div class="endpoint">
            <span class="method put">PUT</span>
            <strong>/api/forms/:id</strong>
            <p>Update an existing form</p>
            <pre>
// Example request body:
{
  "title": "Updated Customer Survey",
  "description": "We've improved our survey",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "question": "Your full name",
      "isRequired": true
    }
  ]
}
            </pre>
          </div>
          
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <strong>/api/forms/:id</strong>
            <p>Delete a form</p>
          </div>
          <h2 class="section-title">Form Submissions</h2>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/forms/:id/submit</strong>
            <p>Submit responses to a form</p>
            <pre>
// Example request body:
{         
  "name": "John Doe",
  "email": "john@example.com",
  "rating": "5",
  "feedback": "Great service!"
}
            </pre>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/forms/:id/submissions</strong>
            <p>Get all submissions for a specific form</p>
            <a href="/api/forms/1/submissions" target="_blank">Test with sample form</a>
          </div>

          <h2 class="section-title">File Upload</h2>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/upload</strong>
            <p>Upload a file</p>
            <pre>
// Use multipart/form-data with these fields:
- file: The file to upload
- formId: ID of the form the file belongs to
- fieldId: ID of the field the file belongs to (optional)
            </pre>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/files/:formId</strong>
            <p>Get all files for a specific form</p>
            <a href="/api/files/1" target="_blank">Test with sample form</a>
          </div>

          <h2 class="section-title">Admin</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/admin/forms</strong>
            <p>Get all forms (admin view)</p>
            <a href="/api/admin/forms" target="_blank">Test this endpoint</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/admin/forms/:id</strong>
            <p>Get a specific form (admin view)</p>
            <a href="/api/admin/forms/1" target="_blank">Test with sample form</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/admin/submissions</strong>
            <p>Get all submissions (admin view)</p>
            <a href="/api/admin/submissions" target="_blank">Test this endpoint</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/admin/submissions/:id</strong>
            <p>Get a specific submission (admin view)</p>
            <a href="/api/admin/submissions/1" target="_blank">Test with sample submission</a>
          </div>
          
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <strong>/api/admin/forms/:id</strong>
            <p>Delete a form (admin)</p>
          </div>
          
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <strong>/api/admin/submissions/:id</strong>
            <p>Delete a submission (admin)</p>
          </div>
          <p>To run the frontend separately:</p>
          <pre>cd frontend && npm start</pre>
          <p>Admin Dashboard: <a href="/admin" target="_blank">/admin</a></p>
        </body>
      </html>
    `);   
  });
  console.log('Frontend build not found. Serving API documentation page.');
}

// Route to serve the form viewer for direct form access
app.get('/form/:id', (req, res) => {
  const formId = req.params.id;
  
  // Check if form exists and is active
  const checkForm = async () => {
    try {
      let formExists = false;
      let formDisabled = false;
      
      if (dbConnected && pool) {
        const [rows] = await pool.query('SELECT id, status FROM forms WHERE id = ?', [formId]);
        formExists = rows.length > 0;
        formDisabled = formExists && rows[0].status === 'disabled';
      } else if (fileStorageEnabled) {
        const form = await fileStorage.getFormById(formId);
        formExists = !!form;
        formDisabled = formExists && form.status === 'disabled';
      } else {
        const form = inMemoryStorage.forms.find(form => form.id === formId);
        formExists = !!form;
        formDisabled = formExists && form.status === 'disabled';
      }
      
      if (!formExists) {
        return res.status(404).send(`
          <html>
            <head>
              <title>Form Not Found</title>
              <style>
                body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; }
                h1 { color: #ef4444; }
                .btn { display: inline-block; padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.25rem; margin-top: 1rem; }
              </style>
            </head>
            <body>
              <h1>Form Not Found</h1>
              <p>The form you're looking for doesn't exist or has been deleted.</p>
              <a href="/" class="btn">Back to Home</a>
            </body>
          </html>
        `);
      }
      
      if (formDisabled) {
        return res.status(403).send(`
          <html>
            <head>
              <title>Form Disabled</title>
              <style>
                body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; }
                h1 { color: #f59e0b; }
                .btn { display: inline-block; padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.25rem; margin-top: 1rem; }
              </style>
            </head>
            <body>
              <h1>Form Disabled</h1>
              <p>This form is currently not accepting submissions. Please contact the form administrator for more information.</p>
              <a href="/" class="btn">Back to Home</a>
            </body>
          </html>
        `);
      }
      
      // Serve the form viewer HTML with the form ID embedded for client-side fetching
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Form Viewer</title>
          <link rel="stylesheet" href="/styles/base.css">
          <style>
            body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .container { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { margin-top: 0; color: #2563eb; }
            .form-field { margin-bottom: 1.5rem; }
            label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
            input, textarea, select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
            button { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; cursor: pointer; }
            .error { color: #ef4444; margin-top: 0.25rem; font-size: 0.875rem; }
            .success { background: #d1fae5; color: #065f46; padding: 1rem; border-radius: 0.375rem; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="form-container" data-form-id="${formId}">
              <h1>Loading form...</h1>
              <p>Please wait while we load the form...</p>
            </div>
          </div>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const formContainer = document.getElementById('form-container');
              const formId = formContainer.getAttribute('data-form-id');
              
              // Fetch the form data
              fetch('/api/forms/' + formId)
                .then(response => response.json())
                .then(data => {
                  if (data.success && data.form) {
                    renderForm(data.form);
                  } else {
                    formContainer.innerHTML = '<h1>Error</h1><p>Could not load form. Please try again later.</p>';
                  }
                })
                .catch(error => {
                  console.error('Error loading form:', error);
                  formContainer.innerHTML = '<h1>Error</h1><p>Could not load form. Please try again later.</p>';
                });
              
              // Render the form 
              function renderForm(form) {
                let formHTML = \`
                  <h1>\${form.title || 'Untitled Form'}</h1>
                  \${form.description ? '<p>' + form.description + '</p>' : ''}
                  <form id="dynamic-form" onsubmit="handleSubmit(event)">
                \`;
                
                // Render each field
                if (form.fields && Array.isArray(form.fields)) {
                  form.fields.forEach(field => {
                    formHTML += \`<div class="form-field">\`;
                    
                    // Label with required indicator
                    formHTML += \`<label for="\${field.id}">\${field.question || field.label}\${field.isRequired ? ' *' : ''}</label>\`;
                    
                    // Render different field types
                    switch(field.type) {
                      case 'text':
                        formHTML += \`<input type="text" id="\${field.id}" name="\${field.id}" \${field.isRequired ? 'required' : ''}>\`;
                        break;
                      case 'dropdown':
                        formHTML += \`<select id="\${field.id}" name="\${field.id}" \${field.isRequired ? 'required' : ''}>\`;
                        formHTML += \`<option value="">-- Select an option --</option>\`;
                        if (field.options && Array.isArray(field.options)) {
                          field.options.forEach(option => {
                            formHTML += \`<option value="\${option.value}">\${option.label}</option>\`;
                          });
                        }
                        formHTML += \`</select>\`;
                        break;
                      case 'table':
                        // Simple text implementation for tables
                        formHTML += \`<textarea id="\${field.id}" name="\${field.id}" rows="4" \${field.isRequired ? 'required' : ''}></textarea>\`;
                        formHTML += \`<p><small>Please enter data in a structured format.</small></p>\`;
                        break;
                      case 'file':
                        formHTML += \`<input type="file" id="\${field.id}" name="\${field.id}" \${field.isRequired ? 'required' : ''}>\`;
                        break;
                      default:
                        formHTML += \`<input type="text" id="\${field.id}" name="\${field.id}" \${field.isRequired ? 'required' : ''}>\`;
                    }
                    
                    formHTML += \`<div class="error" id="\${field.id}-error"></div>\`;
                    formHTML += \`</div>\`;
                  });
                }
                
                // If the form has a validation code, add a field for it
                if (form.validationCode) {
                  formHTML += \`
                    <div class="form-field validation-code-section">
                      <label for="validationCode">Validation Code *</label>
                      <input type="password" id="validationCode" name="_validationCode" required>
                      <div class="helper-text">This form requires a validation code to submit.</div>
                    </div>
                  \`;
                }
                
                formHTML += \`
                  <button type="submit">Submit Form</button>
                  </form>
                  <div id="form-result" style="display: none; margin-top: 1.5rem;"></div>
                \`;
                
                formContainer.innerHTML = formHTML;
              }
              
              // Make the handleSubmit function global so the form can access it
              window.handleSubmit = function(event) {
                event.preventDefault();
                
                const form = event.target;
                const formData = new FormData(form);
                const jsonData = {};
                
                // Convert FormData to JSON
                formData.forEach((value, key) => {
                  jsonData[key] = value;
                });
                
                // Check validation code if present
                const validationCode = jsonData._validationCode;
                const formValidationCode = form.dataset.validationCode;
                
                if (formValidationCode && validationCode !== formValidationCode) {
                  const resultDiv = document.getElementById('form-result');
                  resultDiv.className = 'error';
                  resultDiv.innerHTML = \`<p>Error: Invalid validation code</p>\`;
                  resultDiv.style.display = 'block';
                  return;
                }
                
                // Submit the form
                fetch('/api/forms/' + formId + '/submit', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(jsonData)
                })
                .then(response => response.json())
                .then(data => {
                  const resultDiv = document.getElementById('form-result');
                  if (data.success) {
                    form.style.display = 'none';
                    resultDiv.className = 'success';
                    resultDiv.innerHTML = \`
                      <h2>Thank You!</h2>
                      <p>Your response has been submitted successfully.</p>
                      <button onclick="location.reload()">Submit Another Response</button>
                    \`;
                  } else {
                    resultDiv.className = 'error';
                    resultDiv.innerHTML = \`<p>Error: \${data.message || 'Could not submit form'}</p>\`;
                  }
                  resultDiv.style.display = 'block';
                })
                .catch(error => {
                  console.error('Error submitting form:', error);
                  const resultDiv = document.getElementById('form-result');
                  resultDiv.className = 'error';
                  resultDiv.innerHTML = '<p>Error: Could not submit form. Please try again.</p>';
                  resultDiv.style.display = 'block';
                });
              };
            });
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error checking form existence:', error);
      res.status(500).send('Server error. Please try again later.');
    }
  };
  
  checkForm();
});

// Function to find an available port
const findAvailablePort = async (startPort, maxTries = 10) => {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i;
    try {
      // Try to create a server on the port
      const server = require('http').createServer();
      await new Promise((resolve, reject) => {
        server.on('error', (err) => {
        </body>
        </html>eate a server on the port
      `);uire('http').createServer();
    } catch (error) { new Promise((resolve, reject) => {
      console.error('Error checking form existence:', error);ver.on('error', (err) => {
      res.status(500).send('Server error. Please try again later.');  if (err.code === 'EADDRINUSE') {
    }
  };);
  
  checkForm(); reject(err);
}); }
  });
// Function to find an available port
const findAvailablePort = async (startPort, maxTries = 10) => {en(port, () => {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i;     resolve(true);
    try {     });
      // Try to create a server on the port    });
      const server = require('http').createServer();
      await new Promise((resolve, reject) => {    return port; // Port is available
        server.on('error', (err) => {    } catch (err) {
          if (err.code === 'EADDRINUSE') {`, err.message);
            server.close();
            resolve(false);
          } else {
            reject(err);ot find an available port after ${maxTries} attempts`);
          }
        });
         detection
        server.listen(port, () => {
          server.close();
          resolve(true);
        });
      });
      
      return port; // Port is availablethe port is available
    } catch (err) {uire('http').createServer();
      console.error(`Error checking port ${port}:`, err.message); new Promise((resolve, reject) => {
    }ver.on('error', (err) => {
  }  if (err.code === 'EADDRINUSE') {
  
  throw new Error(`Could not find an available port after ${maxTries} attempts`););
};
 reject(err);
// Start the server with automatic port detection }
const startServer = async () => {
  try {
    // Try to use the default port
    let serverPort = PORT;
    
    try {
      // Check if the port is available
      const server = require('http').createServer();{
      await new Promise((resolve, reject) => {f (err.code === 'EADDRINUSE') {
        server.on('error', (err) => {   console.log(`⚠️ Port ${PORT} is already in use`);
          if (err.code === 'EADDRINUSE') {    console.log('Looking for an available port...');
            server.close();(PORT + 1);
            resolve(false);le port: ${serverPort}`);
          } else {
            reject(err);
          }
        });
        
        server.listen(PORT, () => {
          server.close();
          resolve(true);Port}`);
        });atabase status: ${dbConnected ? 'Connected' : fileStorageEnabled ? 'File storage enabled' : 'Not connected (using in-memory storage)'}`);
      }); });
    } catch (err) {} catch (error) {
      if (err.code === 'EADDRINUSE') {    console.error('Error starting server:', error.message);
        console.log(`⚠️ Port ${PORT} is already in use`); kill the process using port 3001, use one of these commands:');
        console.log('Looking for an available port...');| grep LISTEN | awk \'{print $2}\' | xargs kill -9');
        serverPort = await findAvailablePort(PORT + 1);'  OR use a different port: PORT=3002 npm start');
        console.log(`Found available port: ${serverPort}`); process.exit(1);























});  startServer();initializeDatabase().then(() => {// Start the server};  }    process.exit(1);    console.log('  OR use a different port: PORT=3002 npm start');    console.log('  lsof -i :3001 | grep LISTEN | awk \'{print $2}\' | xargs kill -9');    console.log('To kill the process using port 3001, use one of these commands:');    console.error('Error starting server:', error.message);  } catch (error) {    });      console.log(`Database status: ${dbConnected ? 'Connected' : fileStorageEnabled ? 'File storage enabled' : 'Not connected (using in-memory storage)'}`);      console.log(`\n✅ Server running on http://localhost:${serverPort}`);    app.listen(serverPort, () => {    // Start the server on the selected port        }      }        throw err;      } else {  }
};

// Start the server
initializeDatabase().then(() => {
  startServer();
});