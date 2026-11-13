# Tyres UK private worker readiness preflight · 13 November 2026

## Live Supabase findings (read-only)
Direct checks on the connected production Supabase project `tfoukwcruaamrtgxzshh` found:
- `public.awin_tyres_spec_enrichment_jobs` **absent**. PR #117's job migration has never been applied.
- Awin `sources` entry remains **`status='paused'` and `sync_enabled=false`**.
- Storage bucket `awin-bulk-private-snapshots` exists and **`public=false`**, file-size limit 262144000 bytes, allowed types `text/csv`, `text/tab-separated-values`, `application/gzip`, `application/octet-stream`.
- `pg_policies` lists **no storage.objects policies**. This is not a full security audit, but no general anon/authenticated object policy was found.
- `public.enrich_private_tyres_uk_specs` exists as `security invoker`. The proposed snapshot-job claim/apply functions do **not** exist.
- Migration history contains the 2026-11-05 private bucket and 2026-11-08 private enrichment migrations, but not the 2026-11-09 V2 snapshot-job migration.

These observations are time-specific; future chats must refresh them. None authorise new feed usage or product publication.

## Production owner preflight
New `action:'automation_preflight'` on the already owner-only `POST /api/control-centre/tyre-spec-enrichment` endpoint:
- Runs **after** existing session/owner role, paused joined Awin source, exact completed private Tyres UK import and digest checks.
- Read-only service-role queries test whether the job table is accessible and whether the existing snapshot bucket remains private.
- Returns explicit `ready_to_enable:false`, `no_database_writes:true`, unverified current feed, leases/runtime, retention and publication rights.
- Provides a specific blocker list in `/control-centre/tyre-spec-enrichment`.
- Does **not** download Awin data, claim a lease, create snapshot/jobs, touch historical prices, apply schema, schedule a cron, enable environment flags or grant usage rights.

## Old PR #117 blockers and migration review
The original `supabase/migrations/20261109133000_private_tyres_uk_snapshot_enrichment.sql` is NOT applied and NOT included in this small release. Before changing database schema:
1. Validate the old functions' security-invoker execution privileges and `search_path`; anonymous/authenticated must have no job/RPC access. Confirm correct least-privilege role in live schema.
2. Test atomic job leases and failure recovery with representative private fixtures; no concurrent worker may process a row twice.
3. Confirm numeric/field validation and that the candidate update may **only** append unverified load/speed to unchanged private review identity. It must never edit price, publication flags or source permissions.
4. Verify the active Awin Tyres UK feed ID 93988, partnership, access and licence. This ID is historical, not confirmed by the live data queried in this task.
5. Establish retention and deletion limits for private supplier snapshots before storing them. The bucket currently permits uploads up to 250 MiB, whereas the historic worker's gzip limit was 25 MiB; verify per-route limits and memory/runtime performance.
6. Preserve the current `/api/internal/awin-pneus-private-import` cron. Old PR #117's `vercel.json` would replace it rather than append the tyre job.
7. Only after controlled database deployment, negative tests, independent data source permission and a safe sample run should anyone consider turning `AWIN_TYRE_AUTO_ENRICH_ENABLED` on. Do not activate implicitly.

## Release acceptance
This release is solely a **read-only production visibility check**. Unit/contract quality checks and Vercel READY do not prove runtime worker readiness, storage retention compliance or feed publication rights. Old PR #117 remains OPEN until the actual worker, database migration, recovery and safe rollback can be reviewed separately.
