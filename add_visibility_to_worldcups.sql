-- Add visibility column to worldcups table
ALTER TABLE worldcups 
ADD COLUMN visibility text CHECK (visibility IN ('public', 'private', 'draft')) DEFAULT 'draft';

-- Migrate existing data
-- If is_public is true, set visibility to 'public'
UPDATE worldcups SET visibility = 'public' WHERE is_public = true;

-- If is_public is false, set visibility to 'draft' (safest default, user can change to private)
-- Or maybe 'private'? The user said "private (link only) was showing as draft".
-- So previously is_public=false meant EITHER draft OR private.
-- Let's default to 'draft' for safety, or 'private' if we assume most are completed.
-- Given the user's complaint, they probably want to distinguish.
-- Let's set to 'private' if it has candidates, otherwise 'draft'? Too complex for SQL maybe.
-- Let's just set to 'private' for now as a baseline for non-public ones, or 'draft'.
-- Actually, the user's issue was that they saved as "Private" but it showed "Draft".
-- So let's just set is_public=false to 'private' for now, and the user can change to 'draft' if needed?
-- No, 'draft' is probably safer.
UPDATE worldcups SET visibility = 'private' WHERE is_public = false;

-- Create an index for performance
CREATE INDEX idx_worldcups_visibility ON worldcups(visibility);
