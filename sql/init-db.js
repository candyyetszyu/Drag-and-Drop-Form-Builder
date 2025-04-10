const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Get database credentials from environment variables
const getDbCredentials = () => {
  console.log('Loading database credentials from .env file...');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };
  
  // Log the credentials without showing the full password
  console.log(`Database connection details:`);
  console.log(`- Host: ${dbConfig.host}`);
  console.log(`- User: ${dbConfig.user}`);
  console.log(`- Password: ${dbConfig.password ? '[HIDDEN]' : 'Not set'}`);
  
  return dbConfig;
};

// Database name
const dbName = process.env.DB_NAME || 'marketing_campaign_form';

async function initializeDatabase() {
  let connection;
  
  try {
    // Get database credentials
    const dbConfig = getDbCredentials();
    
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');
    
    // Create database if it doesn't exist
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Use the database
    console.log(`Using database ${dbName}...`);
    await connection.query(`USE ${dbName}`);
    
    // Execute the SQL directly
    console.log('Creating database tables...');
    await connection.query(`
      -- Set character set and collation
      SET NAMES utf8mb4;
      SET CHARACTER SET utf8mb4;

      -- Create tables
      CREATE TABLE IF NOT EXISTS forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        fields JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_id INT NOT NULL,
        response_data JSON,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      );
    `);
    
    // Check if we need to add sample data
    const [formCount] = await connection.query('SELECT COUNT(*) as count FROM forms');
    if (formCount[0].count === 0) {
      console.log('Adding sample data...');
      
      // Sample form with different field types
      const sampleForm = {
        title: 'Customer Feedback Survey',
        description: 'Help us improve our products and services',
        fields: JSON.stringify([
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
        ])
      };
      
      // Insert sample form
      await connection.query(
        'INSERT INTO forms (title, description, fields) VALUES (?, ?, ?)',
        [sampleForm.title, sampleForm.description, sampleForm.fields]
      );
      
      console.log('Sample data added successfully!');
    } else {
      console.log('Database already contains data, skipping sample data insertion.');
    }
    
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error message:', error.message);
    
    // Provide more helpful error messages based on the error type
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nAccess denied. Please check your MySQL username and password in the .env file.');
      console.error('Your current .env configuration (located at ' + path.join(__dirname, '../.env') + '):');
      console.error('- DB_USER=' + (process.env.DB_USER || 'root'));
      console.error('- DB_PASSWORD=' + (process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'));
      
      console.error('\nTry using the password from your .env file: ' + process.env.DB_PASSWORD);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nCould not connect to MySQL server. Make sure MySQL is running.');
      console.error('On macOS, you can start MySQL with: brew services start mysql');
    }
    
    throw error;
  } finally {
    if (connection) {
      console.log('Closing database connection...');
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
