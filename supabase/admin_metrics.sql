-- BrushBuddy — Super Admin metrics & actions.
-- Read-only VIEWS + action FUNCTIONS for the Xeltrix Command super-admin
-- dashboard, which connects with the SERVICE ROLE key (bypasses RLS).
-- Run in the Supabase SQL editor. Safe to re-run.

-- ============================ READ VIEWS ============================

-- 1) APPROVALS — pros awaiting verification
create or replace view admin_pending_pros as
select
  pp.id            as painter_id,
  pp.name,
  pp.phone,
  pp.city,
  pp.service,
  pp.skills,
  pp.verified,
  pp.created_at
from painter_profiles pp
where pp.verified = false
order by pp.created_at desc;

-- 2) PLANS / ACCOUNTS — who is on what plan (free / founding / paid)
create or replace view admin_accounts as
select
  a.id            as account_id,
  a.name,
  a.type,
  a.city,
  u.email         as owner_email,
  p.role          as owner_role,
  a.plan,
  a.founding,
  a.plan_expires_at,
  a.source,
  a.created_at
from accounts a
left join auth.users u on u.id = a.owner_user_id
left join profiles   p on p.id = a.owner_user_id
order by a.founding desc, a.created_at desc;

-- 3) VISITS — page views per day (for charts/trends)
create or replace view admin_pageviews_daily as
select viewed_at, sum(count) as views, count(*) as pages
from page_views
group by viewed_at
order by viewed_at desc;

-- 3b) VISITS — top pages all-time
create or replace view admin_pageviews_top as
select path, sum(count) as views
from page_views
group by path
order by views desc;

-- 4) STORAGE — file count & bytes per bucket (Supabase Storage)
create or replace view admin_storage_usage as
select
  bucket_id,
  count(*)                                   as files,
  coalesce(sum((metadata->>'size')::bigint), 0) as bytes,
  round(coalesce(sum((metadata->>'size')::bigint), 0) / 1048576.0, 2) as mb
from storage.objects
group by bucket_id;

-- 5) SUMMARY — one-row dashboard headline for BrushBuddy
create or replace view admin_summary as
select
  (select count(*) from profiles)                                as users,
  (select count(*) from painter_profiles)                        as pros,
  (select count(*) from painter_profiles where verified = false) as pros_pending,
  (select count(*) from accounts)                                as accounts,
  (select count(*) from accounts where plan <> 'free')           as paid_accounts,
  (select count(*) from accounts where founding)                 as founding_accounts,
  (select count(*) from care_plans where status = 'active')      as active_care_plans,
  (select count(*) from plan_requests where status = 'requested') as open_plan_requests,
  (select coalesce(sum(count),0) from page_views)                as total_pageviews,
  (select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects) as storage_bytes;

-- ============================ ACTIONS ============================
-- Called by the dashboard via RPC (service role). Return the affected row.

-- Approve or un-approve a pro
create or replace function admin_set_pro_verified(p_painter_id uuid, p_verified boolean)
returns void language sql security definer set search_path = public as $$
  update painter_profiles set verified = p_verified where id = p_painter_id;
$$;

-- Set an account's plan (and optional founding free access for N months)
create or replace function admin_set_account_plan(
  p_account_id uuid,
  p_plan text,
  p_founding boolean default false,
  p_months int default null
)
returns void language sql security definer set search_path = public as $$
  update accounts
  set plan = p_plan,
      founding = p_founding,
      source = case when p_founding then 'xeltrix_family' else source end,
      plan_expires_at = case when p_months is not null
                             then now() + (p_months || ' months')::interval
                             else plan_expires_at end
  where id = p_account_id;
$$;

-- Grant free Family-Perks Premium by email (convenience wrapper)
create or replace function admin_grant_family_perks(p_email text, p_months int default 6)
returns void language sql security definer set search_path = public as $$
  update accounts
  set founding = true, plan = 'premium', source = 'xeltrix_family',
      plan_expires_at = now() + (p_months || ' months')::interval
  where owner_user_id = (select id from auth.users where lower(email) = lower(p_email));
$$;

-- Lock these functions to service role only (dashboard uses service key).
revoke all on function admin_set_pro_verified(uuid, boolean) from public, anon, authenticated;
revoke all on function admin_set_account_plan(uuid, text, boolean, int) from public, anon, authenticated;
revoke all on function admin_grant_family_perks(text, int) from public, anon, authenticated;
