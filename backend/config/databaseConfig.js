const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const databasePool = mysql.createPool(poolConfig);

// Handle pool errors
databasePool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Query executor with error handling
const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await databasePool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error('Database operation failed');
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await databasePool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

module.exports = { 
  databasePool, 
  executeQuery,
  closePool
};