-- Admin helper: look up a login account's user id by email, so the admin can
-- link an activated Care Plan to the right customer's login.
--
-- The browser (anon key) can't read auth.users directly. This SECURITY DEFINER
-- function can, but it first checks the caller is an admin, and only returns
-- the id (never other user data). Run once in the Supabase SQL editor.

create or replace function admin_find_user_id(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  -- only admins may use this
  if (select role from profiles where id = auth.uid()) is distinct from 'admin' then
    raise exception 'not authorized';
  end if;

  select u.id into uid
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  return uid; -- null if no such account
end;
$$;

revoke all on function admin_find_user_id(text) from public, anon;
grant execute on function admin_find_user_id(text) to authenticated;
