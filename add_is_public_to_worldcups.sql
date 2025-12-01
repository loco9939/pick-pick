-- Add is_public column to worldcups table
ALTER TABLE worldcups 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Update existing records to be public
UPDATE worldcups SET is_public = true;

-- Make it not null after setting default
ALTER TABLE worldcups 
ALTER COLUMN is_public SET NOT NULL;
