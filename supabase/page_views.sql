-- Simple page-view tracking. Run in the Supabase SQL editor.
-- Consumed by an external admin dashboard later. No client access (service role only).

create table if not exists page_views (
  path text not null,
  viewed_at date not null default current_date,
  count integer not null default 1,
  primary key (path, viewed_at)
);

-- index for the external dashboard (charts/trends by date)
create index if not exists page_views_date_idx on page_views (viewed_at desc);

alter table page_views enable row level security;

drop policy if exists "service role only" on page_views;
create policy "service role only" on page_views using (false);

-- Atomic upsert-increment used by /api/track (service role calls it via RPC).
create or replace function increment_page_view(p_path text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into page_views (path, viewed_at, count)
  values (p_path, current_date, 1)
  on conflict (path, viewed_at)
  do update set count = page_views.count + 1;
$$;
