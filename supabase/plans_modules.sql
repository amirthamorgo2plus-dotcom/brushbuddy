-- BrushBuddy — Plan-based modular features (run in Supabase SQL editor).
-- Adds account-level plan + module toggles + Razorpay subscriptions, with RLS.
-- Safe to re-run.

-- 1. ACCOUNTS (org grouping; plan lives here) -------------------------------
create table if not exists accounts (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  type          text default 'home',  -- home|hotel|hospital|school|office|factory|shop
  city          text,
  owner_user_id uuid references auth.users(id) on delete set null,
  source        text default 'organic', -- organic|xeltrix_family|referral
  plan            text not null default 'free' check (plan in ('free','starter','premium')),
  plan_expires_at timestamptz,          -- null = no expiry; used for founding/trial
  founding        boolean not null default false, -- Family-Perks founding member
  created_at    timestamptz default now()
);

-- link a profile to its account (each user belongs to one account)
alter table profiles add column if not exists account_id uuid references accounts(id) on delete set null;

-- 2. ACCOUNT_MODULES (optional toggles & add-ons) ---------------------------
create table if not exists account_modules (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid references accounts(id) on delete cascade,
  module_id   text not null,            -- matches MODULES[].id in lib/modules.ts
  enabled     boolean not null default true,
  source      text not null default 'plan' check (source in ('plan','addon','perk')),
  created_at  timestamptz default now(),
  unique (account_id, module_id)
);

-- 3. SUBSCRIPTIONS (Razorpay) -----------------------------------------------
create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  account_id            uuid references accounts(id) on delete cascade,
  plan                  text not null check (plan in ('free','starter','premium')),
  razorpay_subscription_id text unique,
  razorpay_customer_id  text,
  status                text not null default 'created', -- created|active|halted|cancelled|completed
  current_period_end    timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_account_modules_account on account_modules(account_id);
create index if not exists idx_subscriptions_account on subscriptions(account_id);

-- 4. RLS --------------------------------------------------------------------
alter table accounts        enable row level security;
alter table account_modules enable row level security;
alter table subscriptions   enable row level security;

-- helper idea: a user is "in" an account if their profile.account_id matches,
-- or they own it. Admins (profiles.role='admin') see all.

-- ACCOUNTS
drop policy if exists "account members read" on accounts;
create policy "account members read" on accounts for select to authenticated
  using (
    owner_user_id = auth.uid()
    or id = (select account_id from profiles where id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
  );
drop policy if exists "account owner updates" on accounts;
create policy "account owner updates" on accounts for update to authenticated
  using (owner_user_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');
drop policy if exists "user creates own account" on accounts;
create policy "user creates own account" on accounts for insert to authenticated
  with check (owner_user_id = auth.uid());

-- ACCOUNT_MODULES (read for members; writes by owner/admin only — plan/add-on
-- changes normally come from the webhook via service_role which bypasses RLS)
drop policy if exists "modules read by members" on account_modules;
create policy "modules read by members" on account_modules for select to authenticated
  using (
    account_id = (select account_id from profiles where id = auth.uid())
    or account_id in (select id from accounts where owner_user_id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
  );
drop policy if exists "modules toggled by owner" on account_modules;
create policy "modules toggled by owner" on account_modules for all to authenticated
  using (account_id in (select id from accounts where owner_user_id = auth.uid())
         or (select role from profiles where id = auth.uid()) = 'admin')
  with check (account_id in (select id from accounts where owner_user_id = auth.uid())
         or (select role from profiles where id = auth.uid()) = 'admin');

-- SUBSCRIPTIONS (read own; writes only via service_role / webhook)
drop policy if exists "subs read by members" on subscriptions;
create policy "subs read by members" on subscriptions for select to authenticated
  using (
    account_id = (select account_id from profiles where id = auth.uid())
    or account_id in (select id from accounts where owner_user_id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

-- NOTE: the Razorpay webhook updates accounts.plan / account_modules /
-- subscriptions using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
