-- Adds locality + map-location columns to painter_profiles.
-- Run this once in the Supabase SQL Editor (safe — uses "if not exists").
-- Needed so painters can have an area (e.g. "RS Puram") and exact map pins.

alter table painter_profiles add column if not exists area text;
alter table painter_profiles add column if not exists lat  double precision;
alter table painter_profiles add column if not exists lng  double precision;
