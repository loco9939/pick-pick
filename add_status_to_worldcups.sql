-- Add status column to worldcups table
ALTER TABLE worldcups 
ADD COLUMN status text CHECK (status IN ('draft', 'published')) DEFAULT 'draft';

-- Migrate existing data
-- If visibility is 'draft', set status to 'draft'
UPDATE worldcups SET status = 'draft' WHERE visibility = 'draft';

-- If visibility is NOT 'draft', set status to 'published'
UPDATE worldcups SET status = 'published' WHERE visibility != 'draft';

-- Restore visibility for drafts
-- We default to 'private' for existing drafts to be safe, as we don't know their intended visibility.
-- The user can change it to 'public' if they want.
UPDATE worldcups SET visibility = 'private' WHERE visibility = 'draft';

-- Create index
CREATE INDEX idx_worldcups_status ON worldcups(status);
