const mysql = require('mysql2/promise');
const readline = require('readline');

// Create command line interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get user input
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createDatabaseUser() {
  let connection;
  
  try {
    console.log('This script will create a new MySQL user for the application.\n');
    
    // Get root connection info
    const rootUser = await question('Enter MySQL root username (default: root): ') || 'root';
    const rootPassword = await question('Enter MySQL root password (leave blank if none): ');
    const host = await question('Enter MySQL host (default: localhost): ') || 'localhost';
    
    // Connect as root or admin
    connection = await mysql.createConnection({
      host: host,
      user: rootUser,
      password: rootPassword
    });
    
    console.log('\nConnected to MySQL successfully!');
    
    // Get new user details
    const newUsername = await question('\nEnter new username (default: app_user): ') || 'app_user';
    const newPassword = await question('Enter password for new user: ');
    
    if (!newPassword) {
      throw new Error('Password cannot be empty');
    }
    
    // Create the database if it doesn't exist
    const dbName = await question('Enter database name (default: marketing_campaign_form): ') || 'marketing_campaign_form';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Check if user exists and drop if requested
    const [users] = await connection.query(`SELECT user FROM mysql.user WHERE user = '${newUsername}' AND host = 'localhost'`);
    if (users.length > 0) {
      const dropUser = await question(`User '${newUsername}'@'localhost' already exists. Drop and recreate? (y/n): `);
      if (dropUser.toLowerCase() === 'y') {
        await connection.query(`DROP USER '${newUsername}'@'localhost'`);
      } else {
        console.log('Skipping user creation.');
        return;
      }
    }
    
    // Create user
    await connection.query(`CREATE USER '${newUsername}'@'localhost' IDENTIFIED BY '${newPassword}'`);
    
    // Grant privileges - only to the specific database for security
    await connection.query(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${newUsername}'@'localhost'`);
    
    // Apply changes
    await connection.query('FLUSH PRIVILEGES');
    
    console.log(`\nUser '${newUsername}'@'localhost' created successfully!`);
    console.log(`Granted all privileges on ${dbName} database.`);
    
    // Update the .env files
    console.log('\nUpdate your .env files with these credentials:');
    console.log('DB_HOST=localhost');
    console.log(`DB_USER=${newUsername}`);
    console.log(`DB_PASSWORD=${newPassword}`);
    console.log(`DB_NAME=${dbName}`);
    
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

createDatabaseUser();
