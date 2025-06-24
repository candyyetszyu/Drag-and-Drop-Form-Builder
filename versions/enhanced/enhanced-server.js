const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware for authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database connection setup
let pool;
let dbConnected = false;

// In-memory fallback storage
const memoryStorage = {
  forms: {},
  submissions: {},
  users: {},
  nextFormId: 1,
  nextSubmissionId: 1,
  nextUserId: 1
};

// Add default admin user
memoryStorage.users['1'] = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  created_at: new Date().toISOString()
};

// Add sample form with theme and conditional logic
memoryStorage.forms['1'] = {
  id: '1',
  title: 'Advanced Customer Survey',
  description: 'Complete customer feedback with conditional logic',
  theme: {
    id: 'professional',
    name: 'Professional Blue',
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    backgroundColor: '#f8fafc',
    cardBackground: '#ffffff',
    textColor: '#1e293b'
  },
  fields: [
    {
      id: 'customer_type',
      type: 'dropdown',
      question: 'What type of customer are you?',
      isRequired: true,
      options: [
        { value: 'new', label: 'New Customer' },
        { value: 'existing', label: 'Existing Customer' },
        { value: 'returning', label: 'Returning Customer' }
      ],
      conditions: [
        {
          optionValue: 'new',
          action: 'show',
          targetId: 'how_did_you_hear',
          message: 'Tell us how you heard about us'
        },
        {
          optionValue: 'existing',
          action: 'show',
          targetId: 'satisfaction_rating',
          message: 'Rate your experience'
        },
        {
          optionValue: 'returning',
          action: 'show',
          targetId: 'return_reason',
          message: 'Why did you return?'
        }
      ]
    },
    {
      id: 'how_did_you_hear',
      type: 'dropdown',
      question: 'How did you hear about us?',
      isRequired: false,
      isConditional: true,
      options: [
        { value: 'social', label: 'Social Media' },
        { value: 'search', label: 'Search Engine' },
        { value: 'referral', label: 'Friend Referral' },
        { value: 'advertisement', label: 'Advertisement' }
      ]
    },
    {
      id: 'satisfaction_rating',
      type: 'dropdown',
      question: 'How satisfied are you with our service?',
      isRequired: false,
      isConditional: true,
      options: [
        { value: '5', label: 'Very Satisfied' },
        { value: '4', label: 'Satisfied' },
        { value: '3', label: 'Neutral' },
        { value: '2', label: 'Dissatisfied' },
        { value: '1', label: 'Very Dissatisfied' }
      ]
    },
    {
      id: 'return_reason',
      type: 'text',
      question: 'What brought you back to us?',
      isRequired: false,
      isConditional: true
    },
    {
      id: 'general_feedback',
      type: 'text',
      question: 'Any additional feedback?',
      isRequired: false
    }
  ],
  shareUrl: 'http://localhost:3001/form/1',
  created_at: new Date().toISOString(),
  status: 'active',
  user_id: '1'
};
memoryStorage.nextFormId = 2;

// Available themes
const themes = {
  professional: {
    id: 'professional',
    name: 'Professional Blue',
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    backgroundColor: '#f8fafc',
    cardBackground: '#ffffff',
    textColor: '#1e293b'
  },
  modern: {
    id: 'modern',
    name: 'Modern Green',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    backgroundColor: '#f0fdf4',
    cardBackground: '#ffffff',
    textColor: '#064e3b'
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    backgroundColor: '#faf5ff',
    cardBackground: '#ffffff',
    textColor: '#581c87'
  },
  warm: {
    id: 'warm',
    name: 'Warm Orange',
    primaryColor: '#ea580c',
    secondaryColor: '#c2410c',
    backgroundColor: '#fff7ed',
    cardBackground: '#ffffff',
    textColor: '#9a3412'
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    backgroundColor: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#e2e8f0'
  }
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.session.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Database initialization
async function initializeDatabase() {
  if (process.env.SKIP_DATABASE === 'true') {
    console.log('⚠️ Database skipped - using in-memory storage');
    return false;
  }
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'marketing_campaign_advanced',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const [rows] = await pool.query('SELECT 1 as test');
    if (rows[0].test === 1) {
      console.log('✅ Database connected successfully');
      await createTables();
      dbConnected = true;
      return true;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('📝 Falling back to in-memory storage');
    return false;
  }
}

// Create database tables
async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS forms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      fields JSON NOT NULL,
      theme JSON,
      share_url VARCHAR(500),
      status ENUM('active', 'disabled', 'draft') DEFAULT 'active',
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS form_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_id INT NOT NULL,
      response_data JSON NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS form_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_id INT NOT NULL,
      event_type ENUM('view', 'start', 'submit', 'abandon') NOT NULL,
      event_data JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )`
  ];
  
  for (const sql of tables) {
    await pool.query(sql);
  }
  
  // Insert default admin user if not exists
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin']
    );
    console.log('👤 Default admin user created (username: admin, password: admin123)');
  } catch (error) {
    console.log('👤 Admin user already exists');
  }
  
  console.log('📊 Database tables created successfully');
}

// Helper functions for data operations
async function getUser(identifier, byField = 'username') {
  if (dbConnected) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE ${byField} = ?`, [identifier]);
    return rows[0];
  } else {
    return Object.values(memoryStorage.users).find(user => user[byField] === identifier);
  }
}

async function createUser(userData) {
  if (dbConnected) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [userData.username, userData.email, hashedPassword, userData.role || 'user']
    );
    return result.insertId;
  } else {
    const userId = memoryStorage.nextUserId.toString();
    memoryStorage.nextUserId++;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    memoryStorage.users[userId] = {
      id: userId,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      created_at: new Date().toISOString()
    };
    return userId;
  }
}

async function createForm(formData) {
  const formId = dbConnected ? null : memoryStorage.nextFormId.toString();
  const shareUrl = `${formData.baseUrl}/form/${formId || '{{ID}}'}`;
  
  if (dbConnected) {
    const [result] = await pool.query(
      'INSERT INTO forms (title, description, fields, theme, share_url, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        formData.title,
        formData.description,
        JSON.stringify(formData.fields),
        JSON.stringify(formData.theme),
        shareUrl.replace('{{ID}}', ''),
        formData.user_id
      ]
    );
    
    const actualShareUrl = shareUrl.replace('{{ID}}', result.insertId);
    await pool.query('UPDATE forms SET share_url = ? WHERE id = ?', [actualShareUrl, result.insertId]);
    
    return { id: result.insertId, shareUrl: actualShareUrl };
  } else {
    memoryStorage.nextFormId++;
    const actualShareUrl = shareUrl.replace('{{ID}}', formId);
    
    memoryStorage.forms[formId] = {
      id: formId,
      title: formData.title,
      description: formData.description,
      fields: formData.fields,
      theme: formData.theme,
      shareUrl: actualShareUrl,
      created_at: new Date().toISOString(),
      status: 'active',
      user_id: formData.user_id
    };
    
    return { id: formId, shareUrl: actualShareUrl };
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Enhanced server running with full features',
    features: {
      database: dbConnected ? 'MySQL' : 'In-Memory',
      authentication: 'JWT + Sessions',
      themes: Object.keys(themes).length,
      conditionalLogic: true,
      linkGeneration: true
    },
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }
    
    // Check if user exists
    const existingUser = await getUser(username) || await getUser(email, 'email');
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const userId = await createUser({ username, email, password, role });
    const token = jwt.sign({ id: userId, username, role: role || 'user' }, JWT_SECRET, { expiresIn: '24h' });
    
    req.session.token = token;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email, role: role || 'user' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await getUser(username) || await getUser(username, 'email');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    req.session.token = token;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

// Theme routes
app.get('/api/themes', (req, res) => {
  res.json({
    success: true,
    themes: Object.values(themes)
  });
});

app.get('/api/themes/:id', (req, res) => {
  const theme = themes[req.params.id];
  if (!theme) {
    return res.status(404).json({ error: 'Theme not found' });
  }
  
  res.json({
    success: true,
    theme
  });
});

// Form routes with authentication and enhanced features
app.get('/api/forms', async (req, res) => {
  try {
    let forms;
    
    if (dbConnected) {
      const [rows] = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
      forms = rows;
    } else {
      forms = Object.values(memoryStorage.forms);
    }
    
    res.json({
      success: true,
      forms: forms.map(form => ({
        id: form.id,
        title: form.title,
        description: form.description,
        shareUrl: form.share_url || form.shareUrl,
        theme: form.theme,
        status: form.status,
        created_at: form.created_at,
        fieldsCount: Array.isArray(form.fields) ? form.fields.length : JSON.parse(form.fields || '[]').length
      }))
    });
  } catch (error) {
    console.error('Error getting forms:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    let form;
    
    if (dbConnected) {
      const [rows] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
      form = rows[0];
      if (form && form.fields) {
        form.fields = JSON.parse(form.fields);
        form.theme = JSON.parse(form.theme || '{}');
      }
    } else {
      form = memoryStorage.forms[req.params.id];
    }
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json({
      success: true,
      form
    });
  } catch (error) {
    console.error('Error getting form:', error);
    res.status(500).json({ error: 'Failed to get form' });
  }
});

app.post('/api/forms', requireAuth, async (req, res) => {
  try {
    const { title, description, fields, theme } = req.body;
    
    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: 'Title and fields are required' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const selectedTheme = theme || themes.professional;
    
    const result = await createForm({
      title: title.trim(),
      description: description || '',
      fields,
      theme: selectedTheme,
      baseUrl,
      user_id: req.user.id
    });
    
    console.log(`✅ Form created: "${title}" (ID: ${result.id})`);
    console.log(`🔗 Share URL: ${result.shareUrl}`);
    console.log(`🎨 Theme: ${selectedTheme.name || 'Default'}`);
    
    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      formId: result.id,
      shareUrl: result.shareUrl,
      form: {
        id: result.id,
        title,
        description,
        fields,
        theme: selectedTheme,
        shareUrl: result.shareUrl,
        created_at: new Date().toISOString(),
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Form submission with conditional logic support
app.post('/api/forms/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    let form;
    if (dbConnected) {
      const [rows] = await pool.query('SELECT * FROM forms WHERE id = ? AND status = "active"', [id]);
      if (rows[0]) {
        form = rows[0];
        form.fields = JSON.parse(form.fields);
      }
    } else {
      form = memoryStorage.forms[id];
    }
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }
    
    // Validate conditional logic
    const errors = validateConditionalLogic(form.fields, formData);
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        validationErrors: errors 
      });
    }
    
    let submissionId;
    if (dbConnected) {
      const [result] = await pool.query(
        'INSERT INTO form_submissions (form_id, response_data, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [id, JSON.stringify(formData), req.ip, req.get('User-Agent')]
      );
      submissionId = result.insertId;
    } else {
      submissionId = memoryStorage.nextSubmissionId.toString();
      memoryStorage.nextSubmissionId++;
      
      memoryStorage.submissions[submissionId] = {
        id: submissionId,
        formId: id,
        data: formData,
        ip_address: req.ip,
        submitted_at: new Date().toISOString()
      };
    }
    
    console.log(`📝 Form submitted: ${id} (Submission: ${submissionId})`);
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Conditional logic validation
function validateConditionalLogic(fields, submissionData) {
  const errors = [];
  
  for (const field of fields) {
    // Check required fields
    if (field.isRequired && !submissionData[field.id]) {
      errors.push(`${field.question} is required`);
      continue;
    }
    
    // Check conditional field visibility
    if (field.isConditional) {
      const shouldBeVisible = checkFieldVisibility(fields, submissionData, field.id);
      if (shouldBeVisible && field.isRequired && !submissionData[field.id]) {
        errors.push(`${field.question} is required based on your previous answer`);
      }
    }
  }
  
  return errors;
}

function checkFieldVisibility(fields, submissionData, targetFieldId) {
  for (const field of fields) {
    if (field.conditions) {
      for (const condition of field.conditions) {
        if (condition.targetId === targetFieldId) {
          const selectedValue = submissionData[field.id];
          if (selectedValue === condition.optionValue) {
            return condition.action === 'show';
          }
        }
      }
    }
  }
  return false; // Default to hidden for conditional fields
}

// Get form submissions
app.get('/api/forms/:id/submissions', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let submissions;
    
    if (dbConnected) {
      const [rows] = await pool.query(
        'SELECT * FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC',
        [id]
      );
      submissions = rows.map(row => ({
        ...row,
        response_data: JSON.parse(row.response_data)
      }));
    } else {
      submissions = Object.values(memoryStorage.submissions)
        .filter(s => s.formId === id)
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    }
    
    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Admin routes
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    let users;
    
    if (dbConnected) {
      const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
      users = rows;
    } else {
      users = Object.values(memoryStorage.users).map(({ password, ...user }) => user);
    }
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Serve form with enhanced rendering (themes + conditional logic)
app.get('/form/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let form;
    
    if (dbConnected) {
      const [rows] = await pool.query('SELECT * FROM forms WHERE id = ? AND status = "active"', [id]);
      if (rows[0]) {
        form = rows[0];
        form.fields = JSON.parse(form.fields);
        form.theme = JSON.parse(form.theme || '{}');
      }
    } else {
      form = memoryStorage.forms[id];
    }
    
    if (!form) {
      return res.status(404).send(generateErrorPage('Form Not Found', 'The form you\'re looking for doesn\'t exist or has been disabled.'));
    }
    
    const formHtml = generateEnhancedFormHtml(form);
    res.send(formHtml);
  } catch (error) {
    console.error('Error serving form:', error);
    res.status(500).send(generateErrorPage('Server Error', 'An error occurred while loading the form.'));
  }
});

// Enhanced form HTML generation with themes and conditional logic
function generateEnhancedFormHtml(form) {
  const theme = form.theme || themes.professional;
  
  const fieldsHtml = form.fields.map(field => {
    const conditionalAttr = field.isConditional ? 'data-conditional="true" style="display: none;"' : '';
    
    switch (field.type) {
      case 'text':
        return `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label class="field-label">
              ${field.question}
              ${field.isRequired ? '<span class="required">*</span>' : ''}
            </label>
            <input 
              type="text" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              class="form-input"
              placeholder="Enter your answer..."
            />
          </div>
        `;
        
      case 'dropdown':
        const options = field.options ? field.options.map(opt => 
          `<option value="${opt.value}" data-conditions='${JSON.stringify(field.conditions || [])}'>${opt.label}</option>`
        ).join('') : '';
        
        return `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label class="field-label">
              ${field.question}
              ${field.isRequired ? '<span class="required">*</span>' : ''}
            </label>
            <select 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              class="form-select"
              onchange="handleConditionalLogic(this, '${field.id}')"
              data-conditions='${JSON.stringify(field.conditions || [])}'
            >
              <option value="">-- Select an option --</option>
              ${options}
            </select>
          </div>
        `;
        
      case 'file':
        return `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label class="field-label">
              ${field.question}
              ${field.isRequired ? '<span class="required">*</span>' : ''}
            </label>
            <input 
              type="file" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              class="form-file-input"
            />
          </div>
        `;
        
      default:
        return `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label class="field-label">
              ${field.question}
              ${field.isRequired ? '<span class="required">*</span>' : ''}
            </label>
            <input 
              type="text" 
              name="${field.id}" 
              ${field.isRequired ? 'required' : ''} 
              class="form-input"
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${theme.backgroundColor};
          color: ${theme.textColor};
          line-height: 1.6;
          min-height: 100vh;
          padding: 20px;
        }
        
        .form-container {
          max-width: 700px;
          margin: 0 auto;
          background: ${theme.cardBackground};
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .form-title {
          color: ${theme.primaryColor};
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .form-description {
          color: ${theme.textColor};
          opacity: 0.8;
          text-align: center;
          margin-bottom: 40px;
          font-size: 1.1rem;
        }
        
        .form-field {
          margin-bottom: 25px;
          transition: all 0.3s ease;
        }
        
        .field-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: ${theme.textColor};
          font-size: 1rem;
        }
        
        .required {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .form-input, .form-select, .form-file-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: ${theme.cardBackground};
          color: ${theme.textColor};
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: ${theme.primaryColor};
          box-shadow: 0 0 0 3px ${theme.primaryColor}25;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          width: 100%;
          margin-top: 30px;
          transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px ${theme.primaryColor}40;
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .success-message {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          display: none;
          text-align: center;
          font-weight: 600;
        }
        
        .error-message {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          display: none;
          text-align: center;
          font-weight: 600;
        }
        
        .conditional-info {
          background: ${theme.primaryColor}15;
          color: ${theme.primaryColor};
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 0.9rem;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .conditional-info.show {
          opacity: 1;
        }
        
        .form-field.highlight {
          transform: scale(1.02);
          border: 2px solid ${theme.primaryColor};
          border-radius: 8px;
          padding: 15px;
          background: ${theme.primaryColor}08;
        }
        
        @media (max-width: 768px) {
          .form-container {
            padding: 20px;
            margin: 10px;
          }
          
          .form-title {
            font-size: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1 class="form-title">${form.title}</h1>
        ${form.description ? `<p class="form-description">${form.description}</p>` : ''}
        
        <form id="enhancedForm">
          ${fieldsHtml}
          
          <div class="conditional-info" id="conditionalInfo">
            Answer the questions above to see additional fields
          </div>
          
          <button type="submit" class="submit-btn" id="submitBtn">
            Submit Form
          </button>
        </form>
        
        <div id="successMessage" class="success-message">
          <strong>Thank you!</strong> Your form has been submitted successfully.
        </div>
        
        <div id="errorMessage" class="error-message">
          <strong>Error:</strong> <span id="errorText">There was an error submitting your form.</span>
        </div>
      </div>

      <script>
        // Conditional logic handler
        function handleConditionalLogic(selectElement, fieldId) {
          const selectedValue = selectElement.value;
          const conditions = JSON.parse(selectElement.dataset.conditions || '[]');
          
          // Hide all conditional fields first
          document.querySelectorAll('[data-conditional="true"]').forEach(field => {
            field.style.display = 'none';
            field.classList.remove('highlight');
          });
          
          // Show relevant fields based on conditions
          conditions.forEach(condition => {
            if (condition.optionValue === selectedValue) {
              const targetField = document.querySelector(\`[data-field-id="\${condition.targetId}"]\`);
              if (targetField) {
                if (condition.action === 'show') {
                  targetField.style.display = 'block';
                  setTimeout(() => {
                    targetField.classList.add('highlight');
                    targetField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                  
                  // Show conditional info
                  const info = document.getElementById('conditionalInfo');
                  if (condition.message) {
                    info.textContent = condition.message;
                    info.classList.add('show');
                    setTimeout(() => info.classList.remove('show'), 3000);
                  }
                }
              }
            }
          });
        }
        
        // Form submission handler
        document.getElementById('enhancedForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const submitBtn = document.getElementById('submitBtn');
          const successMsg = document.getElementById('successMessage');
          const errorMsg = document.getElementById('errorMessage');
          const errorText = document.getElementById('errorText');
          
          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
          
          // Collect form data
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
            
            const result = await response.json();
            
            if (response.ok && result.success) {
              successMsg.style.display = 'block';
              errorMsg.style.display = 'none';
              this.reset();
              
              // Hide all conditional fields
              document.querySelectorAll('[data-conditional="true"]').forEach(field => {
                field.style.display = 'none';
                field.classList.remove('highlight');
              });
              
              // Scroll to success message
              successMsg.scrollIntoView({ behavior: 'smooth' });
            } else {
              throw new Error(result.error || 'Submission failed');
            }
          } catch (error) {
            console.error('Submission error:', error);
            errorText.textContent = error.message || 'There was an error submitting your form. Please try again.';
            errorMsg.style.display = 'block';
            successMsg.style.display = 'none';
            errorMsg.scrollIntoView({ behavior: 'smooth' });
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Form';
          }
        });
        
        // Initialize conditional logic on page load
        document.addEventListener('DOMContentLoaded', function() {
          console.log('Enhanced form with conditional logic loaded');
          console.log('Theme: ${theme.name || 'Custom'}');
          console.log('Primary Color: ${theme.primaryColor}');
        });
      </script>
    </body>
    </html>
  `;
}

function generateErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error { color: #e74c3c; margin-bottom: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="error">${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Enhanced Marketing Campaign Form Builder`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Form Builder: http://localhost:${PORT}/form-builder.html`);
    console.log(`📋 Sample Form: http://localhost:${PORT}/form/1`);
    console.log('');
    console.log('🎨 Features Available:');
    console.log(`   ✅ Database: ${dbConnected ? 'MySQL' : 'In-Memory'}`);
    console.log('   ✅ Authentication: JWT + Sessions');
    console.log(`   ✅ Themes: ${Object.keys(themes).length} available`);
    console.log('   ✅ Conditional Logic: Advanced form flows');
    console.log('   ✅ Link Generation: Automatic shareable URLs');
    console.log('');
    console.log('👤 Default Admin Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  });
}

startServer();

module.exports = app; 