USE marketing_campaign_form;

-- Add status column to forms table if it doesn't exist
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'disabled') DEFAULT 'active';

-- Update existing forms to have active status
UPDATE forms 
SET status = 'active'
WHERE status IS NULL;
