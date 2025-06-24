USE marketing_campaign_form;

CREATE TABLE logic_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  source_field_id INT NOT NULL,
  condition_type ENUM('equals', 'not_equals', 'contains', 'greater_than') NOT NULL,
  condition_value TEXT NOT NULL,
  action_type ENUM('show', 'hide', 'jump_to') NOT NULL,
  target_field_id INT,
  jump_to_field_id INT,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (source_field_id) REFERENCES fields(id) ON DELETE CASCADE,
  FOREIGN KEY (target_field_id) REFERENCES fields(id) ON DELETE SET NULL,
  FOREIGN KEY (jump_to_field_id) REFERENCES fields(id) ON DELETE SET NULL
);