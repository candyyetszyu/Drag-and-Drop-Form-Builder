-- Marketing Campaign Form Builder Database Initialization

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS marketing_campaign_form;
USE marketing_campaign_form;

-- Forms table to store form metadata
CREATE TABLE IF NOT EXISTS forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Submissions table to store form responses
CREATE TABLE IF NOT EXISTS form_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  response_data JSON,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Add sample form if table is empty
INSERT INTO forms (title, description, fields)
SELECT 'Customer Feedback Survey', 'Help us improve our products and services', JSON_ARRAY(
  JSON_OBJECT(
    'id', 'name',
    'type', 'text',
    'question', 'What is your name?',
    'isRequired', true
  ),
  JSON_OBJECT(
    'id', 'email',
    'type', 'text',
    'question', 'What is your email address?',
    'isRequired', true
  ),
  JSON_OBJECT(
    'id', 'rating',
    'type', 'dropdown',
    'question', 'How would you rate our service?',
    'isRequired', true,
    'options', JSON_ARRAY(
      JSON_OBJECT('value', '5', 'label', 'Excellent'),
      JSON_OBJECT('value', '4', 'label', 'Good'),
      JSON_OBJECT('value', '3', 'label', 'Average'),
      JSON_OBJECT('value', '2', 'label', 'Below Average'),
      JSON_OBJECT('value', '1', 'label', 'Poor')
    )
  ),
  JSON_OBJECT(
    'id', 'feedback',
    'type', 'text',
    'question', 'Do you have any additional feedback?',
    'isRequired', false
  )
)
WHERE NOT EXISTS (SELECT 1 FROM forms LIMIT 1);