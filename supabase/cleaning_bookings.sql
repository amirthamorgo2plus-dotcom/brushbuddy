-- Deep Cleaning slot bookings.
-- Run once in the Supabase SQL Editor (safe to re-run).
--
-- How it works:
--   * The day is split into fixed slots (09:00, 12:00, 15:00).
--   * Each slot takes up to cleaning_slot_capacity() bookings (= cleaning teams).
--   * Customers book through book_cleaning_slot() — no login needed. It locks the
--     slot while counting, so two people grabbing the last spot can't both get it.
--   * Anyone can see how full each slot is (counts only, never names/phones)
--     through cleaning_slot_availability().
--   * Admins (profiles.role = 'admin') read and update every booking.
--
-- To change the number of teams per slot, edit cleaning_slot_capacity() below.
-- To change the slot times, update the check constraint AND lib/cleaning.ts.

create table if not exists cleaning_bookings (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references auth.users(id) on delete set null,
  slot_date     date not null,
  slot_time     text not null check (slot_time in ('09:00','12:00','15:00')),
  package       text not null,           -- "Home Deep Clean", "Kitchen", ...
  home_size     text,                    -- "2 BHK", "1500 sq ft office"
  city          text,
  area          text,
  address       text not null,
  contact_name  text not null,
  phone         text not null,
  notes         text,
  status        text not null default 'booked'
                check (status in ('booked','confirmed','done','cancelled')),
  created_at    timestamptz default now()
);

create index if not exists idx_cleaning_bookings_slot on cleaning_bookings(slot_date, slot_time);

-- Teams available per slot. -----------------------------------------------
create or replace function cleaning_slot_capacity()
returns int language sql immutable as $$ select 2 $$;

-- Public: how many bookings each slot has in a date range. -----------------
create or replace function cleaning_slot_availability(p_from date, p_to date)
returns table (slot_date date, slot_time text, booked int)
language sql
security definer
set search_path = public
as $$
  select b.slot_date, b.slot_time, count(*)::int
  from cleaning_bookings b
  where b.slot_date between p_from and p_to
    and b.status <> 'cancelled'
  group by b.slot_date, b.slot_time
$$;

-- Public: book a slot. Returns the new booking id. -------------------------
create or replace function book_cleaning_slot(
  p_date date,
  p_time text,
  p_package text,
  p_home_size text,
  p_city text,
  p_area text,
  p_address text,
  p_contact_name text,
  p_phone text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  today_ist date := (now() at time zone 'Asia/Kolkata')::date;
  taken int;
  new_id uuid;
begin
  if p_date <= today_ist or p_date > today_ist + 30 then
    raise exception 'Please pick a date between tomorrow and the next 30 days.';
  end if;
  if coalesce(trim(p_contact_name), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_address), '') = '' then
    raise exception 'Name, phone and address are required.';
  end if;

  -- Serialise bookings for this one slot so capacity can't be overshot.
  perform pg_advisory_xact_lock(hashtext('cleaning:' || p_date::text || ' ' || p_time));

  select count(*) into taken
  from cleaning_bookings
  where slot_date = p_date and slot_time = p_time and status <> 'cancelled';

  if taken >= cleaning_slot_capacity() then
    raise exception 'SLOT_FULL';
  end if;

  insert into cleaning_bookings
    (customer_id, slot_date, slot_time, package, home_size, city, area,
     address, contact_name, phone, notes)
  values
    (auth.uid(), p_date, p_time, p_package, p_home_size, p_city, p_area,
     trim(p_address), trim(p_contact_name), trim(p_phone), p_notes)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function cleaning_slot_availability(date, date) to anon, authenticated;
grant execute on function book_cleaning_slot(date, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- Row Level Security --------------------------------------------------------
-- No direct inserts: bookings only come in through book_cleaning_slot().
alter table cleaning_bookings enable row level security;

drop policy if exists "customer reads own cleaning bookings" on cleaning_bookings;
create policy "customer reads own cleaning bookings"
  on cleaning_bookings for select to authenticated
  using (customer_id = auth.uid());

drop policy if exists "admin reads all cleaning bookings" on cleaning_bookings;
create policy "admin reads all cleaning bookings"
  on cleaning_bookings for select to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "admin updates cleaning bookings" on cleaning_bookings;
create policy "admin updates cleaning bookings"
  on cleaning_bookings for update to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');
