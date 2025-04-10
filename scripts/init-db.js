const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };
  
  const dbName = process.env.DB_NAME || 'marketing_campaign_form';

  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);
    
    // Use the database
    await connection.query(`USE ${dbName}`);
    
    // Read and execute SQL files in order
    const sqlDir = path.join(__dirname, '..', 'sql', 'modules');
    const sqlFiles = fs.readdirSync(sqlDir).sort();
    
    for (const file of sqlFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Executing ${file}...`);
        const sqlScript = fs.readFileSync(path.join(sqlDir, file), 'utf8');
        await connection.query(sqlScript);
        console.log(`✅ Executed ${file}`);
      }
    }
    
    console.log('Database initialization complete!');
    connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
