-- Unique-visitor tracking (anonymous). Run in the Supabase SQL editor.
-- A random visitor id is stored in the browser's localStorage (no personal
-- data). One row per (visitor, day) = unique visitors per day.

create table if not exists daily_visitors (
  visitor_id text not null,
  visited_at date not null default current_date,
  primary key (visitor_id, visited_at)
);

create index if not exists daily_visitors_date_idx on daily_visitors (visited_at desc);

alter table daily_visitors enable row level security;
drop policy if exists "service role only" on daily_visitors;
create policy "service role only" on daily_visitors using (false);

-- record a visitor for today (idempotent per day)
create or replace function record_visitor(p_visitor_id text)
returns void language sql security definer set search_path = public as $$
  insert into daily_visitors (visitor_id, visited_at)
  values (p_visitor_id, current_date)
  on conflict do nothing;
$$;

-- dashboard view: unique visitors per day
create or replace view admin_unique_visitors_daily as
select visited_at, count(*) as unique_visitors
from daily_visitors
group by visited_at
order by visited_at desc;
