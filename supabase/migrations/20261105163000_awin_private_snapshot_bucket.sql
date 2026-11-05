-- Private-only object storage foundation. No feed download, queue, worker, or publication.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('awin-bulk-private-snapshots','awin-bulk-private-snapshots',false,262144000,
        array['text/csv','text/tab-separated-values','application/gzip','application/octet-stream'])
on conflict (id) do update set
  public=false,
  file_size_limit=262144000,
  allowed_mime_types=excluded.allowed_mime_types;

-- No client-side object access policies are granted. Storage service_role
-- bypasses RLS; future uploads must be service-only with upsert=false.
-- A separate worker must verify SHA-256 of snapshot content before processing.
comment on table public.awin_bulk_import_jobs is
 'Private bulk job journal; immutable snapshot objects are stored in the non-public awin-bulk-private-snapshots bucket; worker inactive.';
