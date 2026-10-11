-- ken.didit panel, round 3: paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Run after requests-faq.sql. Safe to run again.
--
-- Adds: deposit check from Stripe, new-request alerts, panel settings (deposit, add-on prices, style
-- categories), reviews, visit counts and automatic cleanup of old requests.
-- Text that shows on her site may not contain < > " ` or backslashes. The site strips them too.

-- 1. Booking requests: deposit check, alerts, and a third way in (started with the deposit)
alter table public.booking_requests add column if not exists deposit_paid boolean not null default false;
alter table public.booking_requests add column if not exists deposit_paid_at timestamptz;
alter table public.booking_requests add column if not exists deposit_cents integer;
alter table public.booking_requests add column if not exists stripe_session text;
alter table public.booking_requests add column if not exists notified_at timestamptz;
alter table public.booking_requests drop constraint if exists booking_requests_sent_by_check;
alter table public.booking_requests add constraint booking_requests_sent_by_check check (sent_by in ('text', 'instagram', 'deposit'));

-- 2. Visit counts: one number per day per kind. No names, no cookies, nothing about the visitor.
create table if not exists public.visit_stats (
  day   date not null,
  kind  text not null check (kind in ('visit', 'booking', 'request')),
  n     integer not null default 0,
  primary key (day, kind)
);
alter table public.visit_stats enable row level security;
drop policy if exists "Owner can read stats" on public.visit_stats;
create policy "Owner can read stats" on public.visit_stats for select to authenticated using (public.is_owner());
revoke all on public.visit_stats from anon, authenticated;
grant select on public.visit_stats to authenticated;

create or replace function public.track_visit(p_kind text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_kind not in ('visit', 'booking') then return; end if;
  insert into visit_stats (day, kind, n) values ((now() at time zone 'America/Chicago')::date, p_kind, 1)
  on conflict (day, kind) do update set n = least(visit_stats.n + 1, 1000000);
end;
$$;
revoke all on function public.track_visit(text) from public;
grant execute on function public.track_visit(text) to anon, authenticated;

-- 3. The website's way in for requests, now with cleanup and a request count
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
  if coalesce(p_website, '') <> '' then return null; end if;
  if char_length(v_phone) = 11 and left(v_phone, 1) = '1' then v_phone := substr(v_phone, 2); end if;
  if char_length(v_phone) <> 10 then raise exception 'bad phone' using errcode = '22023'; end if;
  if p_date is null or p_time is null or p_date < v_today or p_date > v_today + 120 then
    raise exception 'bad date' using errcode = '22023';
  end if;
  if not exists (select 1 from availability where date = p_date and start_time = p_time and status = 'open') then
    raise exception 'time not open' using errcode = 'P0001';
  end if;
  select id into v_id from booking_requests
   where phone = v_phone and appt_date = p_date and appt_time = p_time and created_at > now() - interval '2 days';
  if v_id is not null then
    if p_paid_said then update booking_requests set paid_said = true where id = v_id; end if;
    return v_id;
  end if;
  if (select count(*) from booking_requests where phone = v_phone and created_at > now() - interval '1 day') >= 4
     or (select count(*) from booking_requests where created_at > now() - interval '1 hour') >= 40 then
    raise exception 'too many requests' using errcode = 'P0001';
  end if;
  -- Client details don't pile up: requests for appointments more than 90 days back are deleted
  delete from booking_requests where appt_date < v_today - 90;
  insert into booking_requests (name, phone, style, addons, appt_date, appt_time, duration_min, total, total_plus, notes, paid_said, sent_by)
  values (trim(p_name), v_phone, trim(p_style), trim(coalesce(p_addons, '')), p_date, p_time, p_duration_min, p_total,
          coalesce(p_total_plus, false), trim(coalesce(p_notes, '')), coalesce(p_paid_said, false), coalesce(p_sent_by, 'text'))
  returning id into v_id;
  insert into visit_stats (day, kind, n) values (v_today, 'request', 1)
  on conflict (day, kind) do update set n = visit_stats.n + 1;
  return v_id;
end;
$$;
revoke all on function public.submit_booking_request(text, text, text, text, date, time, integer, integer, boolean, text, boolean, text, text) from public;
grant execute on function public.submit_booking_request(text, text, text, text, date, time, integer, integer, boolean, text, boolean, text, text) to anon, authenticated;

-- 4. Alerts: the phones Kenya turned alerts on for. Only she can see or change this list.
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  endpoint    text not null unique check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh      text not null check (char_length(p256dh) between 60 and 120),
  auth        text not null check (char_length(auth) between 16 and 40),
  created_at  timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "Owner can read alerts" on public.push_subscriptions;
drop policy if exists "Owner can add alerts" on public.push_subscriptions;
drop policy if exists "Owner can remove alerts" on public.push_subscriptions;
create policy "Owner can read alerts" on public.push_subscriptions for select to authenticated using (public.is_owner());
create policy "Owner can add alerts" on public.push_subscriptions for insert to authenticated with check (public.is_owner());
create policy "Owner can remove alerts" on public.push_subscriptions for delete to authenticated using (public.is_owner());
revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, delete on public.push_subscriptions to authenticated;

-- 5. Settings: deposit and add-on prices
create table if not exists public.site_settings (
  id            integer primary key default 1 check (id = 1),
  deposit       integer not null default 15 check (deposit between 0 and 500),
  long_price    integer not null default 15 check (long_price between 0 and 200),
  design_price  integer not null default 10 check (design_price between 0 and 200),
  updated_at    timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- 6. Style categories (Knotless, Fulani...). Prices and photos point at these.
create table if not exists public.service_categories (
  id           text primary key check (id ~ '^[a-z0-9-]{2,24}$'),
  name         text not null check (char_length(name) between 1 and 30 and name !~ '[<>"`\\]'),
  description  text not null default '' check (char_length(description) <= 90 and description !~ '[<>"`\\]'),
  long         boolean not null default false,
  photo        text not null check (photo ~ '^(builtin:[a-z0-9-]+|uploads/[a-f0-9-]+)$'),
  pos          text not null default 'center 50%' check (pos ~ '^center [0-9]{1,3}%$'),
  hidden       boolean not null default false,
  sort         integer not null default 0,
  updated_at   timestamptz not null default now()
);
insert into public.service_categories (id, name, description, long, photo, pos, sort) values
  ('knotless', 'Knotless', 'Lightweight, no-tension knotless braids.', true, 'builtin:knotless-1', 'center 78%', 10),
  ('fulani', 'Fulani', 'Fulani braids with your choice of size.', true, 'builtin:fulani-1', 'center 64%', 20),
  ('feedins', 'Feed-ins', 'Sleek feed-in braids, priced by count.', true, 'builtin:braids-7', 'center 40%', 30),
  ('quickweave', 'Quick weaves', 'Quick weave installs and ponytails.', false, 'builtin:quickweave-2', 'center 72%', 40),
  ('male', 'Men''s styles', 'Cornrows, twists, retwists, and locs.', false, 'builtin:braids-1', 'center 66%', 50),
  ('kids', 'Kids styles', 'Styles for the little ones, priced by age.', false, 'builtin:kids-1', 'center 42%', 60)
on conflict (id) do nothing;

-- Prices and photos now point at the category list instead of a fixed set of six
alter table public.price_options drop constraint if exists price_options_service_id_check;
alter table public.gallery_photos drop constraint if exists gallery_photos_book_check;
alter table public.price_options drop constraint if exists price_options_service_fk;
alter table public.gallery_photos drop constraint if exists gallery_photos_book_fk;
alter table public.price_options add constraint price_options_service_fk foreign key (service_id) references public.service_categories (id);
alter table public.gallery_photos add constraint gallery_photos_book_fk foreign key (book) references public.service_categories (id);

-- 7. Reviews Kenya pastes in from real clients. Visitors only see the ones she shows.
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 40 and name !~ '[<>"`\\]'),
  body        text not null check (char_length(body) between 1 and 400 and body !~ '[<>"`\\]'),
  stars       smallint check (stars between 1 and 5),
  service     text not null default '' check (char_length(service) <= 40 and service !~ '[<>"`\\]'),
  source      text not null default '' check (source in ('', 'Text', 'Instagram', 'Facebook', 'Google', 'In person')),
  hidden      boolean not null default false,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 8. Row Level Security for the new tables: anyone reads, only the owner writes
alter table public.site_settings enable row level security;
alter table public.service_categories enable row level security;
alter table public.reviews enable row level security;
do $$
declare t text;
begin
  foreach t in array array['site_settings','service_categories','reviews'] loop
    execute format('drop policy if exists "Anyone can read" on public.%I', t);
    execute format('drop policy if exists "Owner can add" on public.%I', t);
    execute format('drop policy if exists "Owner can change" on public.%I', t);
    execute format('drop policy if exists "Owner can delete" on public.%I', t);
    execute format('create policy "Owner can add" on public.%I for insert to authenticated with check (public.is_owner())', t);
    execute format('create policy "Owner can change" on public.%I for update to authenticated using (public.is_owner()) with check (public.is_owner())', t);
    execute format('create policy "Owner can delete" on public.%I for delete to authenticated using (public.is_owner())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
create policy "Anyone can read" on public.site_settings for select to anon, authenticated using (true);
create policy "Anyone can read" on public.service_categories for select to anon, authenticated using (true);
-- Hidden reviews stay private to Kenya
create policy "Anyone can read" on public.reviews for select to anon, authenticated using (hidden = false or public.is_owner());
-- The settings row is never deleted or added from the panel
revoke insert, delete on public.site_settings from authenticated;

select (select count(*) from public.service_categories) as categories,
       (select deposit from public.site_settings) as deposit,
       (select count(*) from public.reviews) as reviews;
