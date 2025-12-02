-- Add draft_data column to worldcups table
ALTER TABLE worldcups 
ADD COLUMN draft_data jsonb;

-- Comment on column
COMMENT ON COLUMN worldcups.draft_data IS 'Stores work-in-progress data for published worldcups';
