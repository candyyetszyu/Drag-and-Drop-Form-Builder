const mysql = require('mysql2/promise');

// In-memory storage fallback
const inMemoryStorage = {
  forms: [],
  submissions: []
};

// Reference to the database pool
let pool = null;

// Set the database pool reference
const setDbPool = (dbPool) => {
  pool = dbPool;
};

// Check if database is connected
const isDbConnected = () => {
  return !!pool;
};

// Get all forms
const getAllForms = async () => {
  if (isDbConnected()) {
    try {
      // Check if submission_count and status columns exist
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'forms' 
        AND COLUMN_NAME IN ('submission_count', 'status', 'share_url')
      `);
      
      const hasSubmissionCount = columns.some(col => col.COLUMN_NAME === 'submission_count');
      const hasStatus = columns.some(col => col.COLUMN_NAME === 'status');
      const hasShareUrl = columns.some(col => col.COLUMN_NAME === 'share_url');
      
      // Build the query based on existing columns
      let query = 'SELECT id, title, description, created_at';
      if (hasSubmissionCount) query += ', submission_count';
      if (hasStatus) query += ', status';
      if (hasShareUrl) query += ', share_url';
      query += ' FROM forms ORDER BY created_at DESC';
      
      const [rows] = await pool.query(query);
      
      // If missing any columns, add default values
      for (const row of rows) {
        if (!hasSubmissionCount) {
          // Calculate submission count if needed
          try {
            const [countResult] = await pool.query(
              'SELECT COUNT(*) as count FROM form_submissions WHERE form_id = ?',
              [row.id]
            );
            row.submission_count = countResult[0].count;
          } catch (countError) {
            console.error('Error calculating submission count:', countError);
            row.submission_count = 0;
          }
        }
        
        if (!hasStatus) {
          row.status = 'active'; // Default status
        }
        
        if (!hasShareUrl) {
          row.share_url = `${process.env.APP_URL || 'http://localhost:3001'}/form/${row.id}`;
        }
      }
      
      return rows;
    } catch (error) {
      console.error('Error fetching forms from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Return from in-memory storage
  return inMemoryStorage.forms.map(form => ({
    id: form.id,
    title: form.title,
    description: form.description,
    created_at: form.created_at,
    status: form.status || 'active',
    submission_count: form.submission_count || 0,
    share_url: form.share_url || `${process.env.APP_URL || 'http://localhost:3001'}/form/${form.id}`
  }));
};

// Get a specific form
const getFormById = async (id) => {
  if (isDbConnected()) {
    try {
      // Check if submission_count, status, and share_url columns exist
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'forms' 
        AND COLUMN_NAME IN ('submission_count', 'status', 'share_url')
      `);
      
      const hasSubmissionCount = columns.some(col => col.COLUMN_NAME === 'submission_count');
      const hasStatus = columns.some(col => col.COLUMN_NAME === 'status');
      const hasShareUrl = columns.some(col => col.COLUMN_NAME === 'share_url');
      
      // Build the query based on existing columns
      let query = 'SELECT id, title, description, fields, created_at';
      if (hasSubmissionCount) query += ', submission_count';
      if (hasStatus) query += ', status';
      if (hasShareUrl) query += ', share_url';
      query += ' FROM forms WHERE id = ?';
      
      const [rows] = await pool.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const form = rows[0];
      
      // Parse JSON fields if needed
      if (typeof form.fields === 'string') {
        try {
          form.fields = JSON.parse(form.fields);
        } catch (e) {
          console.error('Error parsing form fields JSON:', e);
          form.fields = []; // Default to empty array if parsing fails
        }
      }
      
      // Add missing properties with default values
      if (!hasSubmissionCount) {
        try {
          const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM form_submissions WHERE form_id = ?',
            [id]
          );
          form.submission_count = countResult[0].count;
        } catch (countError) {
          console.error('Error calculating submission count:', countError);
          form.submission_count = 0;
        }
      }
      
      if (!hasStatus) {
        form.status = 'active';
      }
      
      if (!hasShareUrl) {
        // Generate a default share URL
        form.share_url = `${process.env.APP_URL || 'http://localhost:3001'}/form/${id}`;
      }
      
      return form;
    } catch (error) {
      console.error('Error fetching form from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Return from in-memory storage
  const form = inMemoryStorage.forms.find(form => form.id === id);
  if (form) {
    // Add status if it doesn't exist
    if (!form.status) {
      form.status = 'active'; 
    }
    
    // Add submission_count if it doesn't exist
    if (!form.submission_count) {
      form.submission_count = inMemoryStorage.submissions.filter(s => s.formId === id).length;
    }
  }
  return form;
};

// Get all submissions
const getAllSubmissions = async () => {
  if (isDbConnected()) {
    try {
      const [rows] = await pool.query(`
        SELECT s.id, s.form_id, f.title as form_title, s.response_data, s.submitted_at 
        FROM form_submissions s
        LEFT JOIN forms f ON s.form_id = f.id
        ORDER BY s.submitted_at DESC
      `);
      
      // Parse JSON response data
      return rows.map(row => {
        if (typeof row.response_data === 'string') {
          try {
            row.response_data = JSON.parse(row.response_data);
          } catch (e) {
            console.error('Error parsing JSON response data:', e);
          }
        }
        return row;
      });
    } catch (error) {
      console.error('Error fetching submissions from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Return from in-memory storage
  return inMemoryStorage.submissions.map(submission => {
    const form = inMemoryStorage.forms.find(f => f.id === submission.formId);
    return {
      id: submission.id,
      form_id: submission.formId,
      form_title: form ? form.title : 'Unknown Form',
      response_data: submission.data,
      submitted_at: submission.submitted_at
    };
  });
};

// Get a specific submission
const getSubmissionById = async (id) => {
  if (isDbConnected()) {
    try {
      const [rows] = await pool.query(`
        SELECT s.id, s.form_id, f.title as form_title, s.response_data, s.submitted_at 
        FROM form_submissions s
        LEFT JOIN forms f ON s.form_id = f.id
        WHERE s.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const submission = rows[0];
      
      // Parse JSON response data if needed
      if (typeof submission.response_data === 'string') {
        submission.response_data = JSON.parse(submission.response_data);
      }
      
      return submission;
    } catch (error) {
      console.error('Error fetching submission from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Return from in-memory storage
  const submission = inMemoryStorage.submissions.find(s => s.id === id);
  if (!submission) return null;
  
  const form = inMemoryStorage.forms.find(f => f.id === submission.formId);
  return {
    id: submission.id,
    form_id: submission.formId,
    form_title: form ? form.title : 'Unknown Form',
    response_data: submission.data,
    submitted_at: submission.submitted_at
  };
};

// Delete a form
const deleteForm = async (id) => {
  if (isDbConnected()) {
    try {
      const [result] = await pool.query('DELETE FROM forms WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting form from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Delete from in-memory storage
  const formIndex = inMemoryStorage.forms.findIndex(form => form.id === id);
  if (formIndex === -1) return false;
  
  inMemoryStorage.forms.splice(formIndex, 1);
  
  // Also delete related submissions
  inMemoryStorage.submissions = inMemoryStorage.submissions.filter(
    submission => submission.formId !== id
  );
  
  return true;
};

// Delete a submission
const deleteSubmission = async (id) => {
  if (isDbConnected()) {
    try {
      const [result] = await pool.query('DELETE FROM form_submissions WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting submission from database:', error);
      // Fall back to in-memory storage
    }
  }
  
  // Delete from in-memory storage
  const submissionIndex = inMemoryStorage.submissions.findIndex(submission => submission.id === id);
  if (submissionIndex === -1) return false;
  
  inMemoryStorage.submissions.splice(submissionIndex, 1);
  return true;
};

module.exports = {
  setDbPool,
  isDbConnected,
  getAllForms,
  getFormById,
  getAllSubmissions,
  getSubmissionById,
  deleteForm,
  deleteSubmission,
  inMemoryStorage
};
