-- Private staging only; does not enable public access or publishing.
alter table public.feed_import_records
  add column if not exists image_url text;
-- Image links are populated on NEW imports. Existing rows have no image URL.
