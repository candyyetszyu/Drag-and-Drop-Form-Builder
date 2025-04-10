const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mysql = require('mysql2/promise');
// Add dotenv for environment variable loading
const dotenv = require('dotenv');

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
      
      // Set the database pool in the admin controller
      adminController.setDbPool(pool);
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
      const [rows] = await pool.query(
        'SELECT id, title, description, fields, created_at FROM forms WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
      
      return res.json({
        success: true,
        form: rows[0]
      });
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
        
        return res.status(201).json({
          success: true,
          message: 'Form created successfully',
          formId: result.insertId
        });
      } catch (dbError) {
        console.error('Database error creating form:', dbError);
        // Continue with file storage fallback
      }
    }
    
    if (fileStorageEnabled) {
      const newForm = await fileStorage.createForm({
        title, 
        description, 
        fields
      });
      
      return res.status(201).json({
        success: true,
        message: 'Form created successfully (file storage)',
        formId: newForm.id
      });
    }
    
    // Fallback to in-memory storage
    const formId = Date.now().toString();
    const newForm = {
      id: formId,
      title,
      description,
      fields,
      created_at: new Date().toISOString()
    };
    
    inMemoryStorage.forms.push(newForm);
    
    res.status(201).json({
      success: true,
      message: 'Form created successfully (in-memory)',
      formId
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create form'
    });
  }
});

// API to submit a form
app.post('/api/forms/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    // Check if form exists
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        'SELECT id FROM forms WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
      
      try {
        const [result] = await pool.query(
          'INSERT INTO form_submissions (form_id, response_data, submitted_at) VALUES (?, ?, NOW())',
          [id, JSON.stringify(formData)]
        );
        
        return res.status(201).json({
          success: true,
          message: 'Form submitted successfully',
          submissionId: result.insertId
        });
      } catch (dbError) {
        console.error('Database error saving submission:', dbError);
        // Continue with file storage fallback
      }
    }
    
    if (fileStorageEnabled) {
      const form = await fileStorage.getFormById(id);
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
      
      const submission = await fileStorage.createSubmission(id, formData);
      
      return res.status(201).json({
        success: true,
        message: 'Form submitted successfully (file storage)',
        submissionId: submission.id
      });
    }
    
    const form = inMemoryStorage.forms.find(form => form.id === id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
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
app.use('/admin/styles', express.static(path.join(__dirname, '../backend/public/styles')));

// Serve the admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../backend/public/admin/dashboard.html'));
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
            pre { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            a { color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>Marketing Campaign API</h1>
          <p>Backend server is running. API endpoints available:</p>
          
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
          
          <p>To run the frontend separately:</p>
          <pre>cd frontend && npm start</pre>
        </body>
      </html>
    `);
  });
  
  console.log('Frontend build not found. Serving API documentation page.');
}

// Function to find an available port
const findAvailablePort = async (startPort, maxTries = 10) => {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i;
    try {
      // Try to create a server on the port
      const server = require('http').createServer();
      await new Promise((resolve, reject) => {
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            server.close();
            resolve(false);
          } else {
            reject(err);
          }
        });
        
        server.listen(port, () => {
          server.close();
          resolve(true);
        });
      });
      
      return port; // Port is available
    } catch (err) {
      console.error(`Error checking port ${port}:`, err.message);
    }
  }
  
  throw new Error(`Could not find an available port after ${maxTries} attempts`);
};

// Start the server with automatic port detection
const startServer = async () => {
  try {
    // Try to use the default port
    let serverPort = PORT;
    
    try {
      // Check if the port is available
      const server = require('http').createServer();
      await new Promise((resolve, reject) => {
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            server.close();
            resolve(false);
          } else {
            reject(err);
          }
        });
        
        server.listen(PORT, () => {
          server.close();
          resolve(true);
        });
      });
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${PORT} is already in use`);
        console.log('Looking for an available port...');
        serverPort = await findAvailablePort(PORT + 1);
        console.log(`Found available port: ${serverPort}`);
      } else {
        throw err;
      }
    }
    
    // Start the server on the selected port
    app.listen(serverPort, () => {
      console.log(`\n✅ Server running on http://localhost:${serverPort}`);
      console.log(`Database status: ${dbConnected ? 'Connected' : fileStorageEnabled ? 'File storage enabled' : 'Not connected (using in-memory storage)'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    console.log('To kill the process using port 3001, use one of these commands:');
    console.log('  lsof -i :3001 | grep LISTEN | awk \'{print $2}\' | xargs kill -9');
    console.log('  OR use a different port: PORT=3002 npm start');
    process.exit(1);
  }
};

// Start the server
initializeDatabase().then(() => {
  startServer();
});