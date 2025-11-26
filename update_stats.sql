-- Add total_plays column to worldcups table
alter table worldcups add column if not exists total_plays int default 0;

-- Function to increment match stats (win/expose)
create or replace function increment_match_stats(winner_id uuid, loser_id uuid)
returns void
language plpgsql
as $$
begin
  -- Update winner: match_win_count + 1, match_expose_count + 1
  update candidates
  set match_win_count = match_win_count + 1,
      match_expose_count = match_expose_count + 1
  where id = winner_id;

  -- Update loser: match_expose_count + 1
  update candidates
  set match_expose_count = match_expose_count + 1
  where id = loser_id;
end;
$$ security definer;

-- Function to increment worldcup stats (total_plays)
create or replace function increment_worldcup_stats(worldcup_id uuid)
returns void
language plpgsql
as $$
begin
  update worldcups
  set total_plays = total_plays + 1
  where id = worldcup_id;
end;
$$ security definer;
