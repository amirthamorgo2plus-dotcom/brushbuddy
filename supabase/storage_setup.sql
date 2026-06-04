-- Photo uploads setup. Run once in the Supabase SQL Editor.
-- Creates a public "photos" bucket and lets logged-in users upload.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Anyone can view photos (it's a public bucket).
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects
  for select using (bucket_id = 'photos');

-- Logged-in users can upload photos.
drop policy if exists "photos auth upload" on storage.objects;
create policy "photos auth upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');
