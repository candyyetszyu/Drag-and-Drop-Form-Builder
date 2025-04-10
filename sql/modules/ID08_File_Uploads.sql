-- Table to store metadata of uploaded files
CREATE TABLE file_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each file
  form_id INT NOT NULL, -- ID of the associated form
  file_name VARCHAR(255) NOT NULL, -- Original name of the uploaded file
  file_path VARCHAR(255) NOT NULL, -- Path where the file is stored
  mime_type VARCHAR(100) NOT NULL, -- MIME type of the file
  file_size INT NOT NULL, -- Size of the file in bytes
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the file was uploaded
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE -- Foreign key linking to the forms table
);
