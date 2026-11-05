# Tooled Up private snapshot upload: TUS transport hardening

This change replaces the standard Supabase object upload used by the CRON_SECRET-only, manual `POST /api/internal/awin-tooled-up-snapshot` with a 6 MiB TUS chunk uploader. Supabase recommends resumable TUS for uploads larger than 6 MB.

- Origin is derived from the configured HTTPS Supabase project URL and validated before sending the private service credential.
- Only the content-addressed key `awin/496/89987/<sha256>.csv.gz` is accepted.
- The TUS creation request includes precise `Upload-Length` and private bucket/object metadata.
- Each PATCH is limited to 6 MiB; the server must return the exact next offset.
- All redirects are rejected and the unique TUS upload URL must be on the original Supabase Storage origin with the correct path.
- Upsert is **not** enabled. Concurrent uploads to the same content-addressed key cannot overwrite each other.
- The existing snapshot route re-reads the stored file and checks its SHA-256 plus byte count after TUS upload. A failed upload can return an already-present result **only if** the existing object independently matches.
- This is still the deliberately bounded 48 MiB **in-memory** manual acquisition. TUS protects the Storage transfer, not the initial Awin download from function interruption. A true external/resumable downloader will be required if the source is larger or Vercel times out.

No changes to Awin auto import scheduling, private product staging, public offers, source status or publication rights. After capture, separately invoke `POST /api/internal/awin-snapshot-validate` with the returned digest. The complete compressed file will then be re-read, checked and recorded in the immutable audit table. This route does not infer GBP or approve image rights.

## Production validation still required

- Verify the production deployment of the new TUS code.
- Intentionally trigger manual capture via authenticated PowerShell after deployment.
- Confirm response is `private_snapshot_stored_verified` or `snapshot_already_present_verified` and inspect Storage object count.
- Trigger manual validation using the exact returned digest and confirm the aggregate-only report.
- Confirm `awin_bulk_import_jobs` is still empty and public Awin offers remain zero.

Never paste the bearer secret into the chat.
