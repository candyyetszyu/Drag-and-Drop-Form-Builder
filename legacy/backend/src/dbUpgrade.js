const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function upgradeDatabase(pool) {
  console.log('Checking if database schema needs upgrades...');
  
  try {
    // Check if the forms table has the submission_count column
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'forms' 
      AND COLUMN_NAME = 'submission_count'
    `);
    
    if (columns.length === 0) {
      console.log('Adding submission_count column to forms table...');
      await pool.query(`
        ALTER TABLE forms 
        ADD COLUMN submission_count INT DEFAULT 0
      `);
      
      // Update existing forms with their submission counts
      console.log('Updating submission counts for existing forms...');
      await pool.query(`
        UPDATE forms f
        SET submission_count = (
          SELECT COUNT(*) 
          FROM form_submissions 
          WHERE form_id = f.id
        )
      `);
    }
    
    // Check if the forms table has the status column
    const [statusColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'forms' 
      AND COLUMN_NAME = 'status'
    `);
    
    if (statusColumns.length === 0) {
      console.log('Adding status column to forms table...');
      await pool.query(`
        ALTER TABLE forms 
        ADD COLUMN status ENUM('active', 'disabled') DEFAULT 'active'
      `);
    }
    
    // Check if the forms table has the share_url column
    const [shareUrlColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'forms' 
      AND COLUMN_NAME = 'share_url'
    `);
    
    if (shareUrlColumns.length === 0) {
      console.log('Adding share_url column to forms table...');
      await pool.query(`
        ALTER TABLE forms 
        ADD COLUMN share_url VARCHAR(255) NULL
      `);
      
      // Generate share URLs for existing forms
      const [forms] = await pool.query('SELECT id FROM forms');
      
      if (forms.length > 0) {
        console.log('Generating share URLs for existing forms...');
        const baseUrl = process.env.APP_URL || 'http://localhost:3001';
        
        for (const form of forms) {
          const shareUrl = `${baseUrl}/form/${form.id}`;
          await pool.query(
            'UPDATE forms SET share_url = ? WHERE id = ?',
            [shareUrl, form.id]
          );
        }
      }
    }
    
    console.log('Database schema is up to date.');
    return true;
  } catch (error) {
    console.error('Error upgrading database schema:', error);
    return false;
  }
}

module.exports = { upgradeDatabase };
