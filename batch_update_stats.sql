-- Function to batch update candidate stats
create or replace function batch_update_candidate_stats(updates jsonb)
returns void
language plpgsql
as $$
declare
  item jsonb;
begin
  -- Iterate over the JSON array
  for item in select * from jsonb_array_elements(updates)
  loop
    update candidates
    set 
      match_win_count = match_win_count + (item->>'match_win_count')::int,
      match_expose_count = match_expose_count + (item->>'match_expose_count')::int,
      win_count = win_count + (item->>'win_count')::int
    where id = (item->>'id')::uuid;
  end loop;
end;
$$ security definer;
