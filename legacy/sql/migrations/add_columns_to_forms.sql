USE marketing_campaign_form;

-- Add submission_count column if it doesn't exist
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS submission_count INT DEFAULT 0;

-- Add status column if it doesn't exist
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'disabled') DEFAULT 'active';

-- Add share_url column if it doesn't exist
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS share_url VARCHAR(255) NULL;

-- Update existing forms to have a submission count based on actual submissions
UPDATE forms f
SET submission_count = (
    SELECT COUNT(*) 
    FROM form_submissions 
    WHERE form_id = f.id
)
WHERE TRUE;
