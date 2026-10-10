-- ken.didit booking requests, FAQ and policies: paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Run setup.sql first (it makes the owners list and is_owner()). Safe to run again.
--
-- Booking requests: when a client sends a request from the site, a copy lands in Kenya's panel.
--   Visitors can only send one through submit_booking_request(). Nobody but Kenya can read them.
-- FAQ and policies: anyone reads, only Kenya changes them. It copies in the 4 policies on her site today.
--
-- Text that shows on her site may not contain < > " ` or backslashes. The site strips them too.

-- 1. Booking requests
create table if not exists public.booking_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'new' check (status in ('new', 'confirmed', 'done', 'declined')),
  name          text not null check (char_length(name) between 1 and 60 and name !~ '[<>"`\\]'),
  phone         text not null check (phone ~ '^[0-9]{10}$'),
  style         text not null check (char_length(style) between 1 and 90 and style !~ '[<>"`\\]'),
  addons        text not null default '' check (char_length(addons) <= 60 and addons !~ '[<>"`\\]'),
  appt_date     date not null,
  appt_time     time not null,
  duration_min  integer not null check (duration_min between 15 and 1440),
  total         integer not null check (total between 0 and 3000),
  total_plus    boolean not null default false,
  notes         text not null default '' check (char_length(notes) <= 400 and notes !~ '[<>"`\\]'),
  paid_said     boolean not null default false,  -- the client says they paid the deposit. Check Stripe before trusting it.
  sent_by       text not null default 'text' check (sent_by in ('text', 'instagram')),
  updated_at    timestamptz not null default now()
);
create index if not exists booking_requests_created_idx on public.booking_requests (created_at desc);
create index if not exists booking_requests_phone_idx on public.booking_requests (phone, appt_date);

alter table public.booking_requests enable row level security;
drop policy if exists "Owner can read requests" on public.booking_requests;
drop policy if exists "Owner can change requests" on public.booking_requests;
drop policy if exists "Owner can delete requests" on public.booking_requests;
create policy "Owner can read requests" on public.booking_requests
  for select to authenticated using (public.is_owner());
create policy "Owner can change requests" on public.booking_requests
  for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "Owner can delete requests" on public.booking_requests
  for delete to authenticated using (public.is_owner());
-- Visitors get no direct access at all. They send requests through the function below.
revoke all on public.booking_requests from anon, authenticated;
grant select, update, delete on public.booking_requests to authenticated;

-- The only way in from the website. It checks everything and refuses floods.
create or replace function public.submit_booking_request(
  p_name text, p_phone text, p_style text, p_addons text, p_date date, p_time time,
  p_duration_min integer, p_total integer, p_total_plus boolean, p_notes text,
  p_paid_said boolean, p_sent_by text, p_website text default ''
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_id uuid;
begin
  -- Honeypot: people never see this field. Bots fill it. Pretend it worked and save nothing.
  if coalesce(p_website, '') <> '' then return null; end if;
  if char_length(v_phone) = 11 and left(v_phone, 1) = '1' then v_phone := substr(v_phone, 2); end if;
  if char_length(v_phone) <> 10 then raise exception 'bad phone' using errcode = '22023'; end if;
  if p_date is null or p_time is null or p_date < v_today or p_date > v_today + 120 then
    raise exception 'bad date' using errcode = '22023';
  end if;
  -- The time has to be one Kenya opened in her panel
  if not exists (select 1 from availability where date = p_date and start_time = p_time and status = 'open') then
    raise exception 'time not open' using errcode = 'P0001';
  end if;
  -- Same person, same time again (text first, then Instagram): keep the first one
  select id into v_id from booking_requests
   where phone = v_phone and appt_date = p_date and appt_time = p_time and created_at > now() - interval '2 days';
  if v_id is not null then return v_id; end if;
  -- Flood limits: 4 a day per phone number, 40 an hour for the whole site
  if (select count(*) from booking_requests where phone = v_phone and created_at > now() - interval '1 day') >= 4
     or (select count(*) from booking_requests where created_at > now() - interval '1 hour') >= 40 then
    raise exception 'too many requests' using errcode = 'P0001';
  end if;
  insert into booking_requests (name, phone, style, addons, appt_date, appt_time, duration_min, total, total_plus, notes, paid_said, sent_by)
  values (trim(p_name), v_phone, trim(p_style), trim(coalesce(p_addons, '')), p_date, p_time, p_duration_min, p_total,
          coalesce(p_total_plus, false), trim(coalesce(p_notes, '')), coalesce(p_paid_said, false), coalesce(p_sent_by, 'text'))
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.submit_booking_request(text, text, text, text, date, time, integer, integer, boolean, text, boolean, text, text) from public;
grant execute on function public.submit_booking_request(text, text, text, text, date, time, integer, integer, boolean, text, boolean, text, text) to anon, authenticated;

-- 2. Policies (the "Before you come" cards) and FAQ
create table if not exists public.site_policies (
  id          uuid primary key default gen_random_uuid(),
  big         text not null check (char_length(big) between 1 and 14 and big !~ '[<>"`\\]'),
  title       text not null check (char_length(title) between 1 and 30 and title !~ '[<>"`\\]'),
  body        text not null check (char_length(body) between 1 and 240 and body !~ '[<>"`\\]'),
  hidden      boolean not null default false,
  sort        integer not null default 0,
  updated_at  timestamptz not null default now()
);
create table if not exists public.faq_items (
  id          uuid primary key default gen_random_uuid(),
  q           text not null check (char_length(q) between 1 and 120 and q !~ '[<>"`\\]'),
  a           text not null check (char_length(a) between 1 and 500 and a !~ '[<>"`\\]'),
  hidden      boolean not null default false,
  sort        integer not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.site_policies enable row level security;
alter table public.faq_items enable row level security;
do $$
declare t text;
begin
  foreach t in array array['site_policies','faq_items'] loop
    execute format('drop policy if exists "Anyone can read" on public.%I', t);
    execute format('drop policy if exists "Owner can add" on public.%I', t);
    execute format('drop policy if exists "Owner can change" on public.%I', t);
    execute format('drop policy if exists "Owner can delete" on public.%I', t);
    execute format('create policy "Anyone can read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "Owner can add" on public.%I for insert to authenticated with check (public.is_owner())', t);
    execute format('create policy "Owner can change" on public.%I for update to authenticated using (public.is_owner()) with check (public.is_owner())', t);
    execute format('create policy "Owner can delete" on public.%I for delete to authenticated using (public.is_owner())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- 3. Copy in what her site shows today (skipped if anything is already there)
insert into public.site_policies (big, title, body, sort)
select * from (values
  ('$15', 'Deposit', 'A $15 deposit is required to book. It goes toward the price of your service.', 10),
  ('Day before', 'Address', 'The address is sent the day before your appointment.', 20),
  ('10 min', 'Grace period', 'You have a 10-minute grace period. After 10 minutes there is a $15 late fee.', 30),
  ('20 min', 'Late cancel', 'After 20 minutes, your appointment will be canceled.', 40)
) as v(big, title, body, sort)
where not exists (select 1 from public.site_policies);

-- Starter questions, built only from what her site already says. Kenya edits or hides them in the panel.
insert into public.faq_items (q, a, sort)
select * from (values
  ('When is my appointment confirmed?', 'Sending a request does not hold the time. It is yours once Kenya texts you back, and the $15 deposit locks in your spot.', 10),
  ('Where do I go?', 'Kenya sends the address the day before your appointment.', 20),
  ('How can I pay?', 'Apple Pay, Cash App or cash. The $15 deposit goes toward the price of your service.', 30),
  ('Can I get a style that is not on the list?', 'Yes, ask first. Text, DM or message Kenya with the style and she will let you know.', 40)
) as v(q, a, sort)
where not exists (select 1 from public.faq_items);

select (select count(*) from public.site_policies) as policies,
       (select count(*) from public.faq_items) as faq,
       (select count(*) from public.booking_requests) as requests;
