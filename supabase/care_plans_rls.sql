-- Row Level Security policies for the Care Plans tables.
-- Run this in the Supabase SQL editor AFTER care_plans.sql.
-- Safe to re-run (every policy is dropped first).
--
-- This app talks to Supabase from the BROWSER with the anon key, so "admin"
-- is a logged-in user whose profiles.role = 'admin' (NOT the service_role key).
--
-- Who can do what:
--   * Anyone (even logged out) can SUBMIT a plan request (public /plans/request).
--   * An ADMIN can read every request, and create/manage plans, visits & claims.
--   * A logged-in CUSTOMER can read their OWN plans/visits/claims and raise claims.

alter table plan_requests enable row level security;
alter table care_plans    enable row level security;
alter table plan_visits   enable row level security;
alter table plan_claims   enable row level security;

-- Helper: is the current user an admin?  (reads the caller's own profile row,
-- which they're allowed to read, so no recursion problem.)
--   (select role from profiles where id = auth.uid()) = 'admin'

-- plan_requests -------------------------------------------------------------
drop policy if exists "anyone can submit a plan request" on plan_requests;
create policy "anyone can submit a plan request"
  on plan_requests for insert to anon, authenticated
  with check (true);

drop policy if exists "customer reads own plan requests" on plan_requests;
create policy "customer reads own plan requests"
  on plan_requests for select to authenticated
  using (customer_id = auth.uid());

drop policy if exists "admin reads all plan requests" on plan_requests;
create policy "admin reads all plan requests"
  on plan_requests for select to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "admin updates plan requests" on plan_requests;
create policy "admin updates plan requests"
  on plan_requests for update to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- care_plans ----------------------------------------------------------------
drop policy if exists "customer reads own plans" on care_plans;
create policy "customer reads own plans"
  on care_plans for select to authenticated
  using (customer_id = auth.uid());

drop policy if exists "admin manages plans" on care_plans;
create policy "admin manages plans"
  on care_plans for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- plan_visits ---------------------------------------------------------------
drop policy if exists "customer reads own plan visits" on plan_visits;
create policy "customer reads own plan visits"
  on plan_visits for select to authenticated
  using (plan_id in (select id from care_plans where customer_id = auth.uid()));

drop policy if exists "admin manages plan visits" on plan_visits;
create policy "admin manages plan visits"
  on plan_visits for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- plan_claims ---------------------------------------------------------------
drop policy if exists "customer reads own plan claims" on plan_claims;
create policy "customer reads own plan claims"
  on plan_claims for select to authenticated
  using (plan_id in (select id from care_plans where customer_id = auth.uid()));

drop policy if exists "customer raises claim on own plan" on plan_claims;
create policy "customer raises claim on own plan"
  on plan_claims for insert to authenticated
  with check (plan_id in (select id from care_plans where customer_id = auth.uid()));

drop policy if exists "admin manages plan claims" on plan_claims;
create policy "admin manages plan claims"
  on plan_claims for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');
