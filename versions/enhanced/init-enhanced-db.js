#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketing_campaign_advanced'
};

const ADMIN_USER = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });
    
    // Create database if it doesn't exist
    console.log(`📊 Creating database: ${DB_CONFIG.database}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await connection.execute(`USE \`${DB_CONFIG.database}\``);
    
    console.log('🏗️ Creating tables...');
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB
    `);
    
    // Forms table with enhanced features
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        fields JSON NOT NULL,
        theme JSON,
        share_url VARCHAR(500),
        status ENUM('active', 'disabled', 'draft', 'archived') DEFAULT 'active',
        settings JSON,
        conditional_logic JSON,
        validation_rules JSON,
        user_id INT,
        view_count INT DEFAULT 0,
        submission_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        FULLTEXT(title, description)
      ) ENGINE=InnoDB
    `);
    
    // Form submissions with enhanced tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_id INT NOT NULL,
        response_data JSON NOT NULL,
        metadata JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        session_id VARCHAR(255),
        completion_time INT,
        is_complete BOOLEAN DEFAULT TRUE,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
        INDEX idx_form_id (form_id),
        INDEX idx_submitted_at (submitted_at),
        INDEX idx_ip_address (ip_address)
      ) ENGINE=InnoDB
    `);
    
    // Form analytics for tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS form_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_id INT NOT NULL,
        event_type ENUM('view', 'start', 'field_interaction', 'submit', 'abandon', 'error') NOT NULL,
        event_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
        INDEX idx_form_id (form_id),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB
    `);
    
    // File uploads table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_id INT NOT NULL,
        submission_id INT,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100),
        file_size INT,
        upload_status ENUM('uploaded', 'processing', 'error') DEFAULT 'uploaded',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
        FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
        INDEX idx_form_id (form_id),
        INDEX idx_submission_id (submission_id)
      ) ENGINE=InnoDB
    `);
    
    // Themes table for custom themes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS themes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        theme_data JSON NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_is_public (is_public)
      ) ENGINE=InnoDB
    `);
    
    // User sessions for enhanced security
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id INT,
        session_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB
    `);
    
    console.log('✅ Tables created successfully');
    
    // Insert default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
    
    try {
      await connection.execute(
        'INSERT INTO users (username, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
        [ADMIN_USER.username, ADMIN_USER.email, hashedPassword, ADMIN_USER.role, 'Admin', 'User']
      );
      console.log('✅ Default admin user created');
      console.log(`   Username: ${ADMIN_USER.username}`);
      console.log(`   Password: ${ADMIN_USER.password}`);
      console.log(`   Email: ${ADMIN_USER.email}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('👤 Admin user already exists');
      } else {
        throw error;
      }
    }
    
    // Insert default themes
    console.log('🎨 Creating default themes...');
    const defaultThemes = [
      {
        name: 'Professional Blue',
        theme_data: {
          id: 'professional',
          primaryColor: '#2563eb',
          secondaryColor: '#1d4ed8',
          backgroundColor: '#f8fafc',
          cardBackground: '#ffffff',
          textColor: '#1e293b'
        }
      },
      {
        name: 'Modern Green',
        theme_data: {
          id: 'modern',
          primaryColor: '#059669',
          secondaryColor: '#047857',
          backgroundColor: '#f0fdf4',
          cardBackground: '#ffffff',
          textColor: '#064e3b'
        }
      },
      {
        name: 'Elegant Purple',
        theme_data: {
          id: 'elegant',
          primaryColor: '#7c3aed',
          secondaryColor: '#5b21b6',
          backgroundColor: '#faf5ff',
          cardBackground: '#ffffff',
          textColor: '#581c87'
        }
      },
      {
        name: 'Warm Orange',
        theme_data: {
          id: 'warm',
          primaryColor: '#ea580c',
          secondaryColor: '#c2410c',
          backgroundColor: '#fff7ed',
          cardBackground: '#ffffff',
          textColor: '#9a3412'
        }
      },
      {
        name: 'Dark Mode',
        theme_data: {
          id: 'dark',
          primaryColor: '#3b82f6',
          secondaryColor: '#2563eb',
          backgroundColor: '#0f172a',
          cardBackground: '#1e293b',
          textColor: '#e2e8f0'
        }
      }
    ];
    
    for (const theme of defaultThemes) {
      try {
        await connection.execute(
          'INSERT INTO themes (name, theme_data, is_public) VALUES (?, ?, TRUE)',
          [theme.name, JSON.stringify(theme.theme_data)]
        );
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`   Theme "${theme.name}" already exists`);
        } else {
          console.log(`   Warning: Could not create theme "${theme.name}": ${error.message}`);
        }
      }
    }
    
    // Insert sample form with conditional logic
    console.log('📋 Creating sample form...');
    const sampleForm = {
      title: 'Advanced Customer Survey',
      description: 'Complete customer feedback with conditional logic and themes',
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
      theme: {
        id: 'professional',
        name: 'Professional Blue',
        primaryColor: '#2563eb',
        secondaryColor: '#1d4ed8',
        backgroundColor: '#f8fafc',
        cardBackground: '#ffffff',
        textColor: '#1e293b'
      }
    };
    
    const shareUrl = 'http://localhost:3001/form/1';
    
    try {
      const [adminUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['admin']);
      const userId = adminUser[0]?.id;
      
      await connection.execute(
        'INSERT INTO forms (title, description, fields, theme, share_url, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          sampleForm.title,
          sampleForm.description,
          JSON.stringify(sampleForm.fields),
          JSON.stringify(sampleForm.theme),
          shareUrl,
          userId,
          'active'
        ]
      );
      console.log('✅ Sample form created');
      console.log(`   URL: ${shareUrl}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('📋 Sample form already exists');
      } else {
        console.log(`   Warning: Could not create sample form: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📊 Database: ' + DB_CONFIG.database);
    console.log('🔧 Tables created: 7');
    console.log('🎨 Themes available: 5');
    console.log('👤 Admin user: admin / admin123');
    console.log('📋 Sample form: http://localhost:3001/form/1');
    console.log('');
    console.log('🚀 You can now start the enhanced server with: npm start');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check your database credentials in .env');
    console.error('   3. Ensure the MySQL user has CREATE DATABASE permissions');
    console.error('   4. Try: mysql -u root -p');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase }; 