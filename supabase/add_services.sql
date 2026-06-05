-- Adds the service category to pros and jobs (multi-service support).
-- Run once in the Supabase SQL Editor (safe — uses "if not exists").
-- Existing rows default to 'painting'.

alter table painter_profiles add column if not exists service text default 'painting';
alter table jobs            add column if not exists service text default 'painting';
