# Database Setup Guide

This guide will help you set up the MySQL database for the Marketing Campaign Form Builder.

## Prerequisites

1. MySQL Server installed and running
2. Node.js and npm installed

## Option 1: Automatic Setup (Recommended)

Run the database initialization script:

```bash
npm run init-db
```

This script will:
1. Create the database if it doesn't exist
2. Set up all necessary tables
3. Load sample data

## Option 2: Manual Setup

If you prefer to set up the database manually:

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE marketing_campaign_form;
   USE marketing_campaign_form;
   ```

3. Run the SQL initialization script:
   ```bash
   mysql -u root -p marketing_campaign_form < sql/initialize.sql
   ```

## Verifying the Setup

To verify that the database was correctly set up:

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Select the database:
   ```sql
   USE marketing_campaign_form;
   ```

3. Check tables:
   ```sql
   SHOW TABLES;
   ```

4. Check sample data:
   ```sql
   SELECT * FROM forms;
   SELECT * FROM form_submissions;
   ```

## Troubleshooting

### MySQL Connection Issues

If you see an error like `Error: connect ECONNREFUSED 127.0.0.1:3306`:

1. Make sure MySQL is running:
   ```bash
   # For macOS
   brew services list
   # Start if not running
   brew services start mysql
   ```

2. Check MySQL credentials in `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=marketing_campaign_form
   ```

### MySQL Authentication Issues

If you see an error like `Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'`:

1. Check your MySQL credentials
2. Try resetting the MySQL root password

### MySQL Schema Issues

If tables aren't created properly:

1. Check the MySQL error log
2. Try running the SQL script manually:
   ```bash
   mysql -u root -p < sql/initialize.sql
   ```

## Running without MySQL (Development Mode)

If you can't set up MySQL, you can run the application in in-memory mode:

```bash
IN_MEMORY_DB=true npm start
```

This mode doesn't require a database but will not persist data between server restarts.
