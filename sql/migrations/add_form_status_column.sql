USE marketing_campaign_form;

-- Add status column to forms table if it doesn't exist
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'disabled') DEFAULT 'active';

-- Update existing forms to active status if not set
UPDATE forms 
SET status = 'active'
WHERE status IS NULL;

-- Add index for faster status filtering
ALTER TABLE forms 
ADD INDEX IF NOT EXISTS idx_form_status (status);
