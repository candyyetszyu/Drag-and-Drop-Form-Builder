const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('\n=== Database Connection Test ===\n');
  
  // Log environment variable paths
  console.log('Looking for environment variables:');
  const envPath = path.join(__dirname, '../.env');
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  
  console.log(`- Project root .env: ${fs.existsSync(envPath) ? 'Found ✅' : 'Not found ❌'}`);
  console.log(`- Backend .env: ${fs.existsSync(backendEnvPath) ? 'Found ✅' : 'Not found ❌'}`);
  
  // Get database credentials
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marketing_campaign_form'
  };
  
  console.log('\nUsing database configuration:');
  console.log(`- Host: ${dbConfig.host}`);
  console.log(`- User: ${dbConfig.user}`);
  console.log(`- Password: ${dbConfig.password ? '********' : '<empty>'}`);
  console.log(`- Database: ${dbConfig.database}`);
  
  try {
    // Try connecting to MySQL without database
    console.log('\nTesting connection to MySQL server...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Successfully connected to MySQL server!');
    
    // Check if database exists
    console.log(`\nChecking if database '${dbConfig.database}' exists...`);
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, 
      [dbConfig.database]
    );
    
    if (rows.length === 0) {
      console.log(`❌ Database '${dbConfig.database}' doesn't exist.`);
      console.log('Creating database...');
      
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      console.log(`✅ Database '${dbConfig.database}' created!`);
    } else {
      console.log(`✅ Database '${dbConfig.database}' exists!`);
    }
    
    // Connect to the specific database
    console.log(`\nConnecting to '${dbConfig.database}' database...`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Check for tables
    console.log('Checking for required tables...');
    const [tables] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [dbConfig.database]
    );
    
    const tableNames = tables.map(t => t.table_name || t.TABLE_NAME);
    console.log('Tables found:', tableNames.length ? tableNames.join(', ') : 'none');
    
    const requiredTables = ['forms', 'form_submissions'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('You should run: npm run init-db');
    } else {
      console.log('✅ All required tables exist!');
      
      // Check if tables have data
      console.log('\nChecking if tables have data...');
      const [formCount] = await connection.query('SELECT COUNT(*) as count FROM forms');
      console.log(`- Forms table: ${formCount[0].count} records`);
      
      const [submissionCount] = await connection.query('SELECT COUNT(*) as count FROM form_submissions');
      console.log(`- Submissions table: ${submissionCount[0].count} records`);
    }
    
    await connection.end();
    console.log('\n=== Database connection test completed successfully! ===');
    console.log('Your database is properly configured and ready to use.');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nAuthentication failed. This likely means:');
      console.log('1. Your username or password is incorrect');
      console.log('2. The user does not have permission to access the database');
      
      console.log('\nTry setting these values in your .env file:');
      console.log('DB_USER=root');
      console.log(`DB_PASSWORD=${dbConfig.password ? 'your-current-password' : '<your-mysql-password>'}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\nCould not connect to MySQL server. This likely means:');
      console.log('1. MySQL is not running');
      console.log('2. MySQL is running on a different host/port');
      
      console.log('\nTry starting MySQL:');
      console.log('brew services start mysql');
    }
    
    console.log('\nFor detailed MySQL troubleshooting, try connecting directly:');
    console.log(`mysql -u ${dbConfig.user} -p${dbConfig.password ? '' : ' # (empty password)'}`);
  }
}

testConnection().catch(console.error);
