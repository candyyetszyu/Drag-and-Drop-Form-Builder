USE marketing_campaign_form;

CREATE TABLE form_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  user_id INT,
  session_id VARCHAR(255),
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE field_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  response_id INT NOT NULL,
  field_id INT NOT NULL,
  response_value TEXT,
  FOREIGN KEY (response_id) REFERENCES form_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  UNIQUE KEY unique_response_field (response_id, field_id)
);