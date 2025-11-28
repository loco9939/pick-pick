-- Add category column to worldcups table
ALTER TABLE worldcups 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'all';

-- Create worldcup_activities table
CREATE TABLE IF NOT EXISTS worldcup_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    worldcup_id uuid REFERENCES worldcups(id) ON DELETE CASCADE,
    worldcup_title text NOT NULL,
    candidate_name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on worldcup_activities
ALTER TABLE worldcup_activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Enable read access for all users" ON worldcup_activities
    FOR SELECT USING (true);

-- Create policy to allow public insert access (for anonymous users to record activity)
CREATE POLICY "Enable insert access for all users" ON worldcup_activities
    FOR INSERT WITH CHECK (true);

-- Create index for faster querying of recent activities
CREATE INDEX IF NOT EXISTS idx_worldcup_activities_created_at ON worldcup_activities(created_at DESC);
