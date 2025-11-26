-- Enable RLS on tables
alter table worldcups enable row level security;
alter table candidates enable row level security;
alter table comments enable row level security;
alter table profiles enable row level security;

-- WorldCups: Allow public read access
create policy "Public WorldCups are viewable by everyone"
on worldcups for select
using (true);

-- Candidates: Allow public read access
create policy "Candidates are viewable by everyone"
on candidates for select
using (true);

-- Comments: Allow public read access
create policy "Comments are viewable by everyone"
on comments for select
using (true);

-- Profiles: Allow public read access (for nickname)
create policy "Profiles are viewable by everyone"
on profiles for select
using (true);
