const express = require('express');
const multer = require('multer');
const path = require('path');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads with a 5MB limit
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Endpoint to handle file uploads
// Saves uploaded file metadata to the database
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { formId } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Insert file metadata into the database
    const sql = `
      INSERT INTO file_uploads (form_id, file_name, file_path, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?)
    `;
    await executeQuery(sql, [
      formId,
      file.originalname,
      file.path,
      file.mimetype,
      file.size,
    ]);

    res.status(200).json({ message: 'File uploaded successfully', file });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// Endpoint to retrieve files by form ID
// Fetches all files associated with a specific form
router.get('/files/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const sql = `SELECT * FROM file_uploads WHERE form_id = ?`;
    const files = await executeQuery(sql, [formId]);

    res.status(200).json(files);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ message: 'Failed to retrieve files' });
  }
});

module.exports = router;