USE marketing_campaign_form;

-- Add metadata column if it doesn't exist to store validation codes and other JSON metadata
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS metadata JSON NULL;

-- Update the schema to ensure we can query against this field if needed
ALTER TABLE forms 
ADD INDEX IF NOT EXISTS idx_forms_metadata ((CAST(metadata->>'$.validationCode' AS CHAR(36))));
