-- BrushBuddy database schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL editor when you are ready to go live.
-- Until then the app runs on the sample data in lib/data.ts.

-- 1. PROFILES  (one row per user, links to Supabase auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text not null default 'customer' check (role in ('customer','painter','admin')),
  name        text,
  phone       text,
  city        text,
  created_at  timestamptz default now()
);

-- 2. PAINTER PROFILES  (extra info only painters have)
create table if not exists painter_profiles (
  user_id        uuid primary key references profiles(id) on delete cascade,
  photo          text,
  about          text,
  skills         text[] default '{}',
  price_per_day  integer default 0,
  verified       boolean default false,
  rating_avg     numeric(2,1) default 0,
  rating_count   integer default 0,
  jobs_done      integer default 0
);

-- 3. PORTFOLIO  (work photos)
create table if not exists portfolio_items (
  id         uuid primary key default gen_random_uuid(),
  painter_id uuid references painter_profiles(user_id) on delete cascade,
  image_url  text not null,
  caption    text,
  created_at timestamptz default now()
);

-- 4. JOBS  (posted by customers)
create table if not exists jobs (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete cascade,
  title       text not null,
  type        text,
  city        text,
  area        text,
  budget      integer,
  details     text,
  status      text default 'open' check (status in ('open','booked','done','cancelled')),
  created_at  timestamptz default now()
);

-- 5. QUOTES  (painter offers a price on a job)
create table if not exists quotes (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid references jobs(id) on delete cascade,
  painter_id uuid references painter_profiles(user_id) on delete cascade,
  amount     integer not null,
  message    text,
  status     text default 'sent' check (status in ('sent','accepted','rejected')),
  created_at timestamptz default now()
);

-- 6. BOOKINGS  (an accepted job in progress)
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid references jobs(id) on delete cascade,
  painter_id  uuid references painter_profiles(user_id),
  customer_id uuid references profiles(id),
  amount      integer,
  schedule    date,
  status      text default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  created_at  timestamptz default now()
);

-- 7. PAYMENTS  (one per booking; commission tracked here)
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings(id) on delete cascade,
  amount        integer,
  commission    integer,
  status        text default 'held' check (status in ('held','released','refunded')),
  payout_status text default 'pending' check (payout_status in ('pending','paid')),
  created_at    timestamptz default now()
);

-- 8. REVIEWS  (only after a completed booking = "verified" review)
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id) on delete cascade,
  painter_id   uuid references painter_profiles(user_id) on delete cascade,
  customer_id  uuid references profiles(id),
  stars        integer check (stars between 1 and 5),
  quality      integer check (quality between 1 and 5),
  on_time      integer check (on_time between 1 and 5),
  cleanliness  integer check (cleanliness between 1 and 5),
  value        integer check (value between 1 and 5),
  text         text,
  photos       text[] default '{}',
  reply        text,
  created_at   timestamptz default now()
);

-- 9. MESSAGES  (chat between customer and painter)
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  sender_id  uuid references profiles(id),
  text       text,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_jobs_city on jobs(city);
create index if not exists idx_reviews_painter on reviews(painter_id);
create index if not exists idx_quotes_job on quotes(job_id);

-- Keep painter rating up to date after every new review
create or replace function refresh_painter_rating() returns trigger as $$
begin
  update painter_profiles pp
  set rating_count = sub.cnt,
      rating_avg   = round(sub.avg, 1)
  from (
    select painter_id, count(*) cnt, avg(stars) avg
    from reviews where painter_id = new.painter_id group by painter_id
  ) sub
  where pp.user_id = sub.painter_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_refresh_rating on reviews;
create trigger trg_refresh_rating
after insert on reviews
for each row execute function refresh_painter_rating();

-- NOTE: enable Row Level Security on each table and add policies
-- before going to production (customers see their own data, etc.).
