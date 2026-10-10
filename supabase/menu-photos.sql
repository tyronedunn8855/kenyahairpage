-- ken.didit prices and photos: paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Run setup.sql first (it makes the owners list and is_owner()). Safe to run again.
-- It copies her current 23 price options and 18 gallery photos in, so the site looks the same on day one.

-- Text Kenya types shows on her public site, so it may not contain < > " ` or backslashes.
-- The site strips them too. This is the second lock.

-- 1. Prices: one row per option inside a service (Knotless > Small, and so on)
create table if not exists public.price_options (
  id               uuid primary key default gen_random_uuid(),
  service_id       text not null check (service_id in ('knotless','fulani','feedins','quickweave','male','kids')),
  name             text not null check (char_length(name) between 1 and 40 and name !~ '[<>"`\\]'),
  price            integer not null check (price between 0 and 2000),
  duration         text not null check (char_length(duration) between 1 and 30 and duration !~ '[<>"`\\]'),
  plus             boolean not null default false,
  design           boolean not null default false,
  design_duration  text check (design_duration is null or (char_length(design_duration) <= 30 and design_duration !~ '[<>"`\\]')),
  sort             integer not null default 0,
  updated_at       timestamptz not null default now()
);
create index if not exists price_options_service_idx on public.price_options (service_id, sort);

-- 2. Gallery: built-in photos (src 'builtin:name', files in the site) and her uploads (src 'uploads/<id>')
create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  src         text not null unique check (src ~ '^(builtin:[a-z0-9-]+|uploads/[a-f0-9-]+)$'),
  tag         text not null check (tag in ('Knotless','Braids','Fulani','Locs','Quick weaves','Kids')),
  caption     text not null default '' check (char_length(caption) <= 80 and caption !~ '[<>"`\\]'),
  book        text not null check (book in ('knotless','fulani','feedins','quickweave','male','kids')),
  tall        boolean not null default false,
  width       integer,
  height      integer,
  hidden      boolean not null default false,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists gallery_photos_sort_idx on public.gallery_photos (sort);

-- 3. Row Level Security: anyone reads, only the owner (Kenya) writes
alter table public.price_options enable row level security;
alter table public.gallery_photos enable row level security;
do $$
declare t text;
begin
  foreach t in array array['price_options','gallery_photos'] loop
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

-- 4. Photo storage: a public bucket for her uploads. Anyone can view a photo; only the owner can add or delete.
--    Photos are shrunk on her phone before upload (longest side 1600px, never cropped), so 5 MB is plenty.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 5242880, array['image/webp','image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/webp','image/jpeg'];

drop policy if exists "Owner can upload gallery photos" on storage.objects;
drop policy if exists "Owner can replace gallery photos" on storage.objects;
drop policy if exists "Owner can delete gallery photos" on storage.objects;
create policy "Owner can upload gallery photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and public.is_owner());
create policy "Owner can replace gallery photos" on storage.objects
  for update to authenticated using (bucket_id = 'gallery' and public.is_owner()) with check (bucket_id = 'gallery' and public.is_owner());
create policy "Owner can delete gallery photos" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery' and public.is_owner());

-- 5. Copy in what her site shows today (skipped if anything is already there)
insert into public.price_options (service_id, name, price, duration, plus, design, design_duration, sort)
select * from (values
  ('knotless', 'Extra small', 260, '12+ hrs', false, false, null, 10),
  ('knotless', 'Small', 220, '8 hrs', false, false, null, 20),
  ('knotless', 'Medium', 180, '5 hrs', false, false, null, 30),
  ('knotless', 'Large', 130, '3 hrs 30 min', false, false, null, 40),
  ('fulani', 'Small', 210, '6 hrs 30 min', false, false, null, 10),
  ('fulani', 'Medium', 180, '5 hrs', false, false, null, 20),
  ('fulani', 'Large', 150, '4 hrs', false, false, null, 30),
  ('feedins', '4 braids', 40, '1 hr 15 min', false, false, null, 10),
  ('feedins', '6 braids', 60, '1 hr 30 min', false, false, null, 20),
  ('feedins', '8 braids', 80, '2 hrs', false, false, null, 30),
  ('feedins', '10+ braids', 90, '3+ hrs', true, false, null, 40),
  ('quickweave', 'Quick weave', 85, '3 hrs', false, false, null, 10),
  ('quickweave', 'Quick weave ponytail', 70, '4 hrs', false, false, null, 20),
  ('quickweave', 'Quick weave with braids', 100, '4 hrs', false, false, null, 30),
  ('male', 'Cornrows', 55, '1 hr 30 min', false, true, '2 hrs', 10),
  ('male', 'Twists', 60, '2 hrs 30 min', false, false, null, 20),
  ('male', 'Retwists', 65, '2 hrs 30 min', false, false, null, 30),
  ('male', 'Retwists + style', 75, '3 hrs 30 min', false, false, null, 40),
  ('male', 'Starter locs', 90, '2 hrs', false, false, null, 50),
  ('male', 'Freeform transformation', 85, '3 hrs', false, false, null, 60),
  ('kids', 'Ages 3 and under', 40, '3 hrs', false, false, null, 10),
  ('kids', 'Ages 4 to 10', 55, '2 hrs', false, false, null, 20),
  ('kids', 'Ages 11 to 14', 70, '3+ hrs', true, false, null, 30)
) as v(service_id, name, price, duration, plus, design, design_duration, sort)
where not exists (select 1 from public.price_options);

insert into public.gallery_photos (src, tag, caption, book, tall, sort)
values
  ('builtin:knotless-2', 'Knotless', 'Knotless braids', 'knotless', true, 10),
  ('builtin:braids-4', 'Braids', 'Heart design cornrows', 'male', false, 20),
  ('builtin:fulani-1', 'Fulani', 'Fulani braids with curls', 'fulani', false, 30),
  ('builtin:locs-1', 'Locs', 'Loc retwist', 'male', true, 40),
  ('builtin:kids-2', 'Kids', 'Kids braids with bows', 'kids', false, 50),
  ('builtin:braids-7', 'Braids', 'Zigzag stitch braids', 'feedins', false, 60),
  ('builtin:quickweave-2', 'Quick weaves', 'Quick weave', 'quickweave', false, 70),
  ('builtin:braids-2', 'Braids', 'Zigzag cornrows', 'male', false, 80),
  ('builtin:knotless-1', 'Knotless', 'Small knotless braids', 'knotless', false, 90),
  ('builtin:locs-2', 'Locs', 'Starter locs', 'male', false, 100),
  ('builtin:kids-1', 'Kids', 'Kids braids with beads', 'kids', true, 110),
  ('builtin:braids-5', 'Braids', 'Stitch braids', 'male', false, 120),
  ('builtin:quickweave-1', 'Quick weaves', 'Quick weave with braids', 'quickweave', false, 130),
  ('builtin:braids-locs-1', 'Locs', 'Twists and cornrows', 'male', false, 140),
  ('builtin:locs-3', 'Locs', 'Loc style', 'male', false, 150),
  ('builtin:braids-1', 'Braids', 'Stitch cornrows', 'male', false, 160),
  ('builtin:kids-3', 'Kids', 'Kids cornrows', 'kids', false, 170),
  ('builtin:braids-6', 'Braids', 'Wavy cornrows', 'kids', false, 180)
on conflict (src) do nothing;

select (select count(*) from public.price_options) as price_options,
       (select count(*) from public.gallery_photos) as gallery_photos;
