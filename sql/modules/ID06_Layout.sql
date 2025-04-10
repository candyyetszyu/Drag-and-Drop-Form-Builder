USE marketing_campaign_form;

CREATE TABLE form_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  width_desktop VARCHAR(20) DEFAULT '100%',
  width_mobile VARCHAR(20) DEFAULT '100%',
  position INT NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE TABLE column_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  column_id INT NOT NULL,
  field_id INT NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (column_id) REFERENCES form_columns(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  UNIQUE KEY unique_field_assignment (column_id, field_id)
);