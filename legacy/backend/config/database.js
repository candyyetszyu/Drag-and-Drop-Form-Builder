const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const databasePool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Reusable query executor
const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await databasePool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Database query failed');
  }
};

module.exports = { databasePool, executeQuery };