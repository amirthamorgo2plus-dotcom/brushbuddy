-- BrushBuddy — backfill accounts for existing users + set Family-Perks founding.
-- Run in the Supabase SQL editor AFTER plans_modules.sql. Safe to re-run.

-- 1. Give every user without an account a personal one, and link the profile.
insert into accounts (owner_user_id, name, source)
select p.id, coalesce(p.name, split_part(u.email, '@', 1)), 'organic'
from profiles p
join auth.users u on u.id = p.id
where p.account_id is null
  and not exists (select 1 from accounts a where a.owner_user_id = p.id);

update profiles p
set account_id = a.id
from accounts a
where a.owner_user_id = p.id
  and p.account_id is null;

-- 2. Mark Family-Perks members as FOUNDING → resolves to Premium for 6 months,
--    then auto-downgrades to Free (entitlements.effectivePlan handles this).
--    EDIT the email list (or set source='xeltrix_family' when you import them).
update accounts
set founding = true,
    source = 'xeltrix_family',
    plan = 'premium',
    plan_expires_at = now() + interval '6 months'
where owner_user_id in (
  select id from auth.users
  where email in (
    -- 'customer1@example.com',
    -- 'customer2@example.com'
    'sureshd74@gmail.com'   -- example: the current admin/test account
  )
);

-- 3. Verify
select a.name, u.email, a.plan, a.founding, a.plan_expires_at, a.source
from accounts a join auth.users u on u.id = a.owner_user_id
order by a.founding desc, a.created_at desc;
