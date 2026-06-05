-- BrushBuddy schema v2
-- WHY: painters may not have email/login. This lets a painter exist WITHOUT an
-- account (added by an admin). A painter row now has its own id, stores name/city
-- directly, and links to a login account only IF they have one (user_id, nullable).
--
-- Safe to run now (tables are empty). Run this whole file in the Supabase SQL Editor.
-- It replaces painter_profiles + the tables that point to it.

-- Drop the tables we are restructuring (empty, so no data lost) ------------
drop table if exists messages         cascade;
drop table if exists payments         cascade;
drop table if exists reviews          cascade;
drop table if exists bookings         cascade;
drop table if exists quotes           cascade;
drop table if exists portfolio_items  cascade;
drop table if exists painter_profiles cascade;

-- PAINTER PROFILES (self-contained; user_id is OPTIONAL) -------------------
create table painter_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references profiles(id) on delete set null, -- null = no login (admin added)
  name          text not null,
  service       text default 'painting',  -- service category (painting, deep-cleaning, ...)
  city          text,
  area          text,            -- locality within the city (e.g. "RS Puram")
  phone         text,            -- so you can contact painters who have no account
  photo         text,
  about         text,
  skills        text[] default '{}',
  price_per_day integer default 0,
  verified      boolean default false,
  lat           double precision,   -- optional precise map location
  lng           double precision,
  rating_avg    numeric(2,1) default 0,
  rating_count  integer default 0,
  jobs_done     integer default 0,
  created_at    timestamptz default now()
);

create table portfolio_items (
  id         uuid primary key default gen_random_uuid(),
  painter_id uuid references painter_profiles(id) on delete cascade,
  image_url  text not null,
  caption    text,
  created_at timestamptz default now()
);

create table quotes (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid references jobs(id) on delete cascade,
  painter_id uuid references painter_profiles(id) on delete cascade,
  amount     integer not null,
  message    text,
  status     text default 'sent' check (status in ('sent','accepted','rejected')),
  created_at timestamptz default now()
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid references jobs(id) on delete cascade,
  painter_id  uuid references painter_profiles(id),
  customer_id uuid references profiles(id),
  amount      integer,
  schedule    date,
  status      text default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  created_at  timestamptz default now()
);

create table payments (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings(id) on delete cascade,
  amount        integer,
  commission    integer,
  status        text default 'held' check (status in ('held','released','refunded')),
  payout_status text default 'pending' check (payout_status in ('pending','paid')),
  created_at    timestamptz default now()
);

create table reviews (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id) on delete set null,
  painter_id   uuid references painter_profiles(id) on delete cascade,
  customer_id  uuid references profiles(id),
  customer_name text,
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

create table messages (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  sender_id  uuid references profiles(id),
  text       text,
  created_at timestamptz default now()
);

create index if not exists idx_painters_city on painter_profiles(city);
create index if not exists idx_reviews_painter on reviews(painter_id);
create index if not exists idx_quotes_job on quotes(job_id);

-- Keep painter rating fresh after each review -----------------------------
create or replace function refresh_painter_rating() returns trigger as $$
begin
  update painter_profiles pp
  set rating_count = sub.cnt, rating_avg = round(sub.avg, 1)
  from (
    select painter_id, count(*) cnt, avg(stars) avg
    from reviews where painter_id = new.painter_id group by painter_id
  ) sub
  where pp.id = sub.painter_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_refresh_rating on reviews;
create trigger trg_refresh_rating after insert on reviews
for each row execute function refresh_painter_rating();

-- ROW LEVEL SECURITY ------------------------------------------------------
alter table painter_profiles enable row level security;
alter table portfolio_items  enable row level security;
alter table quotes           enable row level security;
alter table bookings         enable row level security;
alter table payments         enable row level security;
alter table reviews          enable row level security;
alter table messages         enable row level security;

-- PROFILES: each user can read/create/update their OWN row.
-- (Required so the app can read your role — including role='admin'.)
alter table profiles enable row level security;
drop policy if exists "own profile read"   on profiles;
drop policy if exists "own profile insert" on profiles;
drop policy if exists "own profile update" on profiles;
create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Handy: is the current user an admin?
-- (reads the caller's own profile row, allowed by the profiles "own read" policy)
-- We inline this check in each policy below.

-- PAINTER PROFILES: everyone reads; a painter edits own; admin manages all.
create policy "painters public read" on painter_profiles for select using (true);
create policy "painter or admin writes" on painter_profiles for all
  using (
    user_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    user_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- PORTFOLIO: public read; the painter who owns it (or admin) writes.
create policy "portfolio public read" on portfolio_items for select using (true);
create policy "portfolio owner or admin" on portfolio_items for all
  using (
    exists (select 1 from painter_profiles pp where pp.id = portfolio_items.painter_id and pp.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from painter_profiles pp where pp.id = portfolio_items.painter_id and pp.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- QUOTES: the painter and the job's customer can see; painter sends/edits.
create policy "quotes visible to both" on quotes for select using (
  exists (select 1 from painter_profiles pp where pp.id = quotes.painter_id and pp.user_id = auth.uid())
  or auth.uid() = (select customer_id from jobs where jobs.id = quotes.job_id)
);
create policy "painter writes quote" on quotes for insert with check (
  exists (select 1 from painter_profiles pp where pp.id = quotes.painter_id and pp.user_id = auth.uid())
);
create policy "painter edits quote" on quotes for update using (
  exists (select 1 from painter_profiles pp where pp.id = quotes.painter_id and pp.user_id = auth.uid())
);
create policy "customer updates job quotes" on quotes for update using (
  auth.uid() = (select customer_id from jobs where jobs.id = quotes.job_id)
);

-- BOOKINGS: only the two parties.
create policy "booking parties" on bookings for all
  using (
    auth.uid() = customer_id
    or exists (select 1 from painter_profiles pp where pp.id = bookings.painter_id and pp.user_id = auth.uid())
  )
  with check (
    auth.uid() = customer_id
    or exists (select 1 from painter_profiles pp where pp.id = bookings.painter_id and pp.user_id = auth.uid())
  );

-- PAYMENTS: only people on the related booking.
create policy "payment parties read" on payments for select using (
  exists (
    select 1 from bookings b
    where b.id = payments.booking_id
      and (b.customer_id = auth.uid()
           or exists (select 1 from painter_profiles pp where pp.id = b.painter_id and pp.user_id = auth.uid()))
  )
);

-- REVIEWS: everyone reads; logged-in customer writes; painter (or admin) replies.
create policy "reviews public read" on reviews for select using (true);
create policy "customer writes review" on reviews for insert with check (auth.uid() = customer_id);
create policy "painter or admin replies" on reviews for update using (
  exists (select 1 from painter_profiles pp where pp.id = reviews.painter_id and pp.user_id = auth.uid())
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- MESSAGES: only the booking's two parties.
create policy "chat parties read" on messages for select using (
  exists (
    select 1 from bookings b
    where b.id = messages.booking_id
      and (b.customer_id = auth.uid()
           or exists (select 1 from painter_profiles pp where pp.id = b.painter_id and pp.user_id = auth.uid()))
  )
);
create policy "chat parties send" on messages for insert with check (auth.uid() = sender_id);
