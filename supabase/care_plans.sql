-- BrushBuddy Care Plans — yearly membership model.
-- Run this in the Supabase SQL editor after schema.sql.
--
-- Flow:  plan_requests (customer asks)  ->  care_plans (we quote & activate)
--        ->  plan_visits (scheduled upkeep)  ->  plan_claims (protection)

-- 1. A customer's request for a custom yearly plan (before we quote it).
create table if not exists plan_requests (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references auth.users(id) on delete set null,
  property_kind text not null,                 -- "Hotel / Resort", "Home / Apartment", ...
  segment       text not null,                 -- 'home' | 'business'
  size_note     text,                          -- free text: "40-room hotel", "3 BHK"
  services      text[] not null default '{}',  -- service slugs to cover
  city          text,
  area          text,
  contact_name  text,
  phone         text,
  notes         text,
  status        text not null default 'requested', -- requested|quoted|active|declined
  created_at    timestamptz default now()
);

-- 2. An active (or quoted) yearly plan for a property.
create table if not exists care_plans (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid references plan_requests(id) on delete set null,
  customer_id   uuid references auth.users(id) on delete set null,
  title         text,                          -- e.g. "Sunrise Hotel — Annual Care"
  services      text[] not null default '{}',
  yearly_price  numeric,                        -- the custom quote (₹)
  visits_per_year int,                          -- planned scheduled visits
  starts_on     date,
  ends_on       date,
  status        text not null default 'quoted', -- quoted|active|expired|cancelled
  created_at    timestamptz default now()
);

-- 3. Scheduled upkeep visits under a plan (the "scheduled, not reactive" part).
create table if not exists plan_visits (
  id            uuid primary key default gen_random_uuid(),
  plan_id       uuid references care_plans(id) on delete cascade,
  painter_id    uuid references auth.users(id) on delete set null, -- assigned pro
  service       text,
  scheduled_for date,
  status        text not null default 'planned', -- planned|done|missed
  notes         text,
  created_at    timestamptz default now()
);

-- 4. Protection claims — covered work that needs re-doing within the year.
create table if not exists plan_claims (
  id            uuid primary key default gen_random_uuid(),
  plan_id       uuid references care_plans(id) on delete cascade,
  service       text,
  description   text,
  status        text not null default 'open',   -- open|approved|fixed|rejected
  created_at    timestamptz default now()
);

create index if not exists idx_plan_requests_status on plan_requests(status);
create index if not exists idx_care_plans_customer on care_plans(customer_id);
create index if not exists idx_plan_visits_plan on plan_visits(plan_id);

-- NOTE: enable Row Level Security and add policies before production
-- (a customer sees only their own requests/plans/visits/claims; admins see all).
