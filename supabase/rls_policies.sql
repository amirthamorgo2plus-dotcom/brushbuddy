-- BrushBuddy — Row Level Security (RLS) policies
-- Run this in the Supabase SQL Editor AFTER schema.sql (with RLS enabled).
-- These rules decide who can read and write each table.
--
-- Idea in plain words:
--   * Anyone can BROWSE painters, their photos, and reviews (public discovery).
--   * Anyone can SEE open jobs.
--   * You must be LOGGED IN to post jobs, send quotes, or leave reviews.
--   * You can only read/edit YOUR OWN private rows (your profile, your bookings,
--     your payments, your chat messages).

-- Make sure RLS is on for every table (safe to run again) ---------------
alter table profiles          enable row level security;
alter table painter_profiles  enable row level security;
alter table portfolio_items   enable row level security;
alter table jobs              enable row level security;
alter table quotes            enable row level security;
alter table bookings          enable row level security;
alter table payments          enable row level security;
alter table reviews           enable row level security;
alter table messages          enable row level security;

-- PROFILES ----------------------------------------------------------------
-- You can see and edit only your own profile; you create your own on signup.
create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- PAINTER PROFILES --------------------------------------------------------
-- Everyone can browse painters. Painter edits only their own.
create policy "painters public read"  on painter_profiles for select using (true);
create policy "painter manages own"   on painter_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PORTFOLIO (work photos) -------------------------------------------------
-- Everyone can see photos. Painter manages their own.
create policy "portfolio public read" on portfolio_items for select using (true);
create policy "portfolio owner write" on portfolio_items for all
  using (auth.uid() = painter_id) with check (auth.uid() = painter_id);

-- JOBS --------------------------------------------------------------------
-- Anyone can see jobs (painters need to find work).
-- Logged-in customers create jobs; they edit only their own.
create policy "jobs public read"   on jobs for select using (true);
create policy "jobs owner insert"  on jobs for insert with check (auth.uid() = customer_id);
create policy "jobs owner update"  on jobs for update using (auth.uid() = customer_id);

-- QUOTES ------------------------------------------------------------------
-- The painter who sent it and the customer who owns the job can see it.
create policy "quotes visible to both" on quotes for select using (
  auth.uid() = painter_id
  or auth.uid() = (select customer_id from jobs where jobs.id = quotes.job_id)
);
create policy "painter sends quote" on quotes for insert with check (auth.uid() = painter_id);
create policy "painter edits quote" on quotes for update using (auth.uid() = painter_id);

-- BOOKINGS ----------------------------------------------------------------
-- Only the two people in the booking can see/manage it.
create policy "booking parties read" on bookings for select using (
  auth.uid() = customer_id or auth.uid() = painter_id
);
create policy "booking parties write" on bookings for all using (
  auth.uid() = customer_id or auth.uid() = painter_id
) with check (
  auth.uid() = customer_id or auth.uid() = painter_id
);

-- PAYMENTS ----------------------------------------------------------------
-- Only the people on the related booking can see the payment.
create policy "payment parties read" on payments for select using (
  auth.uid() in (
    select customer_id from bookings where bookings.id = payments.booking_id
    union
    select painter_id  from bookings where bookings.id = payments.booking_id
  )
);

-- REVIEWS -----------------------------------------------------------------
-- Everyone can read reviews (they help people choose).
-- A logged-in customer writes a review; the painter can add a reply.
create policy "reviews public read"   on reviews for select using (true);
create policy "customer writes review" on reviews for insert with check (auth.uid() = customer_id);
create policy "painter replies review" on reviews for update using (auth.uid() = painter_id);

-- MESSAGES (chat) ---------------------------------------------------------
-- Only the two people on the booking can read/send messages.
create policy "chat parties read" on messages for select using (
  auth.uid() in (
    select customer_id from bookings where bookings.id = messages.booking_id
    union
    select painter_id  from bookings where bookings.id = messages.booking_id
  )
);
create policy "chat parties send" on messages for insert with check (auth.uid() = sender_id);
