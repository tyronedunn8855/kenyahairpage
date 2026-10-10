-- ken.didit availability: paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Safe to run again: it only creates what is missing and resets the policies.
--
-- Kenya signs in with her phone number and a password. Her account's login is built from that number:
-- p + the 10 digits + @kenyastyles.vercel.app. The line at the bottom uses the booking number already on her
-- site, (414) 388-1130. If she will type a different number, change the digits there before you run it.

-- 1. The table the booking calendar reads
create table if not exists public.availability (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  status      text not null default 'open' check (status in ('open', 'booked', 'closed')),
  note        text check (char_length(note) <= 200),
  created_at  timestamptz not null default now(),
  constraint availability_end_after_start check (end_time > start_time),
  constraint availability_one_per_start unique (date, start_time)
);
create index if not exists availability_date_idx on public.availability (date);

-- 2. Who may change it. Nobody can read or edit this list from the website.
create table if not exists public.owners (
  email text primary key check (email = lower(email))
);
alter table public.owners enable row level security;
revoke all on public.owners from anon, authenticated;

-- True only when the signed-in person's email is on the owners list
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.owners
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

-- 3. Row Level Security: anyone can read, only an owner can add, change or delete
alter table public.availability enable row level security;

drop policy if exists "Anyone can read availability" on public.availability;
drop policy if exists "Owner can add availability" on public.availability;
drop policy if exists "Owner can change availability" on public.availability;
drop policy if exists "Owner can delete availability" on public.availability;

create policy "Anyone can read availability" on public.availability
  for select to anon, authenticated using (true);
create policy "Owner can add availability" on public.availability
  for insert to authenticated with check (public.is_owner());
create policy "Owner can change availability" on public.availability
  for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "Owner can delete availability" on public.availability
  for delete to authenticated using (public.is_owner());

-- Visitors read the calendar columns only. Kenya's notes stay out of the public API.
revoke all on public.availability from anon;
grant select (id, date, start_time, end_time, status) on public.availability to anon;
grant select, insert, update, delete on public.availability to authenticated;

-- 4. Kenya's login (lowercase). Create the same login under Authentication > Users > Add user.
insert into public.owners (email) values ('p4143881130@kenyastyles.vercel.app') on conflict do nothing;
