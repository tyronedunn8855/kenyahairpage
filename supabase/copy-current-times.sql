-- Copies Kenya's current open times from her Google Sheet into Supabase, so nothing drops off the
-- booking calendar when it switches over. Paste into Supabase > SQL Editor > New query, then Run.
-- Read from the sheet on 2026-10-10: 11 days, 22 times. The sheet only has start times,
-- so each end time is set 3 hours later (the panel's default). Kenya can change any of them in the panel.
-- Safe to run twice: a time already there is skipped.
insert into public.availability (date, start_time, end_time, status) values
  ('2026-10-10', '16:30', '19:30', 'open'),
  ('2026-10-13', '16:30', '19:30', 'open'),
  ('2026-10-14', '08:00', '11:00', 'open'),
  ('2026-10-14', '11:00', '14:00', 'open'),
  ('2026-10-15', '08:00', '11:00', 'open'),
  ('2026-10-15', '11:00', '14:00', 'open'),
  ('2026-10-16', '16:30', '19:30', 'open'),
  ('2026-10-17', '16:30', '19:30', 'open'),
  ('2026-10-18', '16:30', '19:30', 'open'),
  ('2026-10-19', '16:30', '19:30', 'open'),
  ('2026-10-21', '08:00', '11:00', 'open'),
  ('2026-10-21', '11:00', '14:00', 'open'),
  ('2026-10-21', '14:00', '17:00', 'open'),
  ('2026-10-21', '17:00', '20:00', 'open'),
  ('2026-10-22', '08:00', '11:00', 'open'),
  ('2026-10-22', '11:00', '14:00', 'open'),
  ('2026-10-22', '14:00', '17:00', 'open'),
  ('2026-10-22', '17:00', '20:00', 'open'),
  ('2026-10-27', '08:00', '11:00', 'open'),
  ('2026-10-27', '11:00', '14:00', 'open'),
  ('2026-10-27', '14:00', '17:00', 'open'),
  ('2026-10-27', '17:00', '20:00', 'open')
on conflict (date, start_time) do nothing;

select count(*) as times_now_in_supabase from public.availability;
