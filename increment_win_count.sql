create or replace function increment_win_count(candidate_id uuid)
returns void
language plpgsql
as $$
begin
  update candidates
  set win_count = win_count + 1,
      match_win_count = match_win_count + 1
  where id = candidate_id;
end;
$$;
