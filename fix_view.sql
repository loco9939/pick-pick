-- Drop view first to allow type change (bigint -> int)
drop view if exists public.worldcup_stats;

-- Redefine worldcup_stats view to use total_plays from worldcups table
create or replace view public.worldcup_stats as
select
  w.id as worldcup_id,
  w.title,
  count(c.id) as candidate_count,
  w.total_plays as total_plays
from worldcups w
left join candidates c on w.id = c.worldcup_id
where w.is_deleted = false
group by w.id, w.title, w.total_plays;
