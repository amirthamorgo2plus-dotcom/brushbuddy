-- Row Level Security policies for the Care Plans tables.
-- Run this AFTER care_plans.sql (and after choosing "Run and enable RLS").
--
-- Model:
--  * Anyone can SUBMIT a plan request (the public /plans/request form).
--  * A logged-in customer can read their OWN requests/plans/visits/claims.
--  * Admin work is done with the service_role key, which bypasses RLS,
--    so no extra admin policies are needed here.

-- Make sure RLS is on (safe to re-run).
alter table plan_requests enable row level security;
alter table care_plans    enable row level security;
alter table plan_visits   enable row level security;
alter table plan_claims   enable row level security;

-- plan_requests -------------------------------------------------------------
-- Public can create a request (anon or logged-in). Form may have no user id.
drop policy if exists "anyone can submit a plan request" on plan_requests;
create policy "anyone can submit a plan request"
  on plan_requests for insert
  to anon, authenticated
  with check (true);

-- A logged-in customer can read their own requests.
drop policy if exists "customer reads own plan requests" on plan_requests;
create policy "customer reads own plan requests"
  on plan_requests for select
  to authenticated
  using (customer_id = auth.uid());

-- care_plans ----------------------------------------------------------------
drop policy if exists "customer reads own plans" on care_plans;
create policy "customer reads own plans"
  on care_plans for select
  to authenticated
  using (customer_id = auth.uid());

-- plan_visits (visible if the visit belongs to one of my plans) --------------
drop policy if exists "customer reads own plan visits" on plan_visits;
create policy "customer reads own plan visits"
  on plan_visits for select
  to authenticated
  using (
    plan_id in (select id from care_plans where customer_id = auth.uid())
  );

-- plan_claims (read + raise a claim on my own plan) -------------------------
drop policy if exists "customer reads own plan claims" on plan_claims;
create policy "customer reads own plan claims"
  on plan_claims for select
  to authenticated
  using (
    plan_id in (select id from care_plans where customer_id = auth.uid())
  );

drop policy if exists "customer raises claim on own plan" on plan_claims;
create policy "customer raises claim on own plan"
  on plan_claims for insert
  to authenticated
  with check (
    plan_id in (select id from care_plans where customer_id = auth.uid())
  );
