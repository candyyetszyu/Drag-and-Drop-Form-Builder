USE marketing_campaign_form;

CREATE TABLE fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  type ENUM('text', 'dropdown', 'table', 'file') NOT NULL,
  question TEXT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  min_length INT,
  max_length INT,
  position INT NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE TABLE field_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  option_value TEXT NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

CREATE TABLE table_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('text', 'dropdown') NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

CREATE TABLE column_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  column_id INT NOT NULL,
  option_value TEXT NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (column_id) REFERENCES table_columns(id) ON DELETE CASCADE
);