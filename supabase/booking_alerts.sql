-- WhatsApp alert to the owner on every new Deep Cleaning booking (via CallMeBot).
-- Run once in the Supabase SQL Editor AFTER cleaning_bookings.sql (safe to re-run).
--
-- Then save your number + CallMeBot API key (run separately, NOT committed to git):
--
--   insert into alert_settings (id, whatsapp_phone, callmebot_apikey)
--   values (1, '+91XXXXXXXXXX', 'YOUR_API_KEY')
--   on conflict (id) do update
--     set whatsapp_phone = excluded.whatsapp_phone,
--         callmebot_apikey = excluded.callmebot_apikey;
--
-- Turn alerts off/on:  update alert_settings set enabled = false where id = 1;
--
-- The HTTP call is fire-and-forget (pg_net), so a slow or failed alert never
-- blocks or breaks a customer's booking.

create extension if not exists pg_net;

-- One-row settings table. RLS on with no policies = invisible to the app/browser.
create table if not exists alert_settings (
  id                int primary key default 1 check (id = 1),
  whatsapp_phone    text,      -- international format, e.g. +919876543210
  callmebot_apikey  text,
  enabled           boolean not null default true
);
alter table alert_settings enable row level security;

create or replace function notify_cleaning_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  s   alert_settings;
  msg text;
begin
  select * into s from alert_settings where id = 1;
  if not found or not s.enabled
     or coalesce(s.whatsapp_phone, '') = '' or coalesce(s.callmebot_apikey, '') = '' then
    return new;
  end if;

  msg := concat_ws(E'\n',
    '🧼 New Deep Cleaning booking',
    to_char(new.slot_date, 'Dy DD Mon') || ', ' ||
      case new.slot_time
        when '09:00' then '9:00 AM'
        when '12:00' then '12:00 PM'
        when '15:00' then '3:00 PM'
        else new.slot_time
      end,
    new.package || coalesce(' · ' || nullif(new.home_size, ''), ''),
    new.contact_name || ' · ' || new.phone,
    concat_ws(', ', new.address, nullif(new.area, ''), nullif(new.city, '')),
    'Notes: ' || nullif(new.notes, ''),
    'Ref: ' || upper(left(new.id::text, 8))
  );

  perform net.http_get(
    url    := 'https://api.callmebot.com/whatsapp.php',
    params := jsonb_build_object(
      'phone',  s.whatsapp_phone,
      'text',   msg,
      'apikey', s.callmebot_apikey
    )
  );
  return new;
exception when others then
  return new; -- never fail a booking because the alert couldn't be sent
end;
$$;

drop trigger if exists cleaning_booking_whatsapp_alert on cleaning_bookings;
create trigger cleaning_booking_whatsapp_alert
  after insert on cleaning_bookings
  for each row execute function notify_cleaning_booking();
