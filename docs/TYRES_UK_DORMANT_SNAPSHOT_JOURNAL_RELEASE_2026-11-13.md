# AVUQO Tyres UK dormant private job journal · 13 November 2026

## Purpose
Provide a secure, **non-operational database foundation** for the unfinished Tyres UK private snapshot enrichment worker in old PR #117. This is a distinct, smaller step from deploying that worker. Historical Awin feed ID `93988` is **not current-feed approval**. No tyre pricing, public offer, feed-image, storage, fitment, or Awin permissions are granted.

## Production source of truth checked on 13 Nov 2026
Connected Supabase `tfoukwcruaamrtgxzshh`: `public.awin_tyres_spec_enrichment_jobs` absent, snapshot claim/apply functions absent, existing `enrich_private_tyres_uk_specs` function SECURITY INVOKER, `awin-bulk-private-snapshots` bucket private (public=false), source `awin` paused and sync off. The bucket's 250 MiB allowance does not itself approve retention or upload of any new supplier data.

## Dormant journal migration
Repo file `supabase/migrations/20261113210500_tyres_uk_private_job_journal_only.sql` creates only `public.awin_tyres_spec_enrichment_jobs`, an index, RLS, and service-role-only privileges. It introduces **no claim/apply RPC**, trigger, scheduler, download, data insertion or default historical feed ID.

Security and invariants:
- Requires advertiser `12715`, explicitly supplied numeric feed ID, SHA-256 source digest and a matching content-addressed private snapshot path. No magic approval of `93988`.
- Jobs begin in **`blocked`**, never `queued`. Promotion needs a later reviewed release and positive current supplier evidence. Max 100,000 rows, 250-row processing batches only in a future separate worker.
- Unique `target_import_id/source_digest`, bounded checkpoint and non-negative counters; restrict deletion of target import with linked journal history.
- RLS enabled with **no policies**. All table permissions revoked from `PUBLIC`, `anon`, `authenticated`; only `service_role` receives SELECT/INSERT/UPDATE. No anon/authenticated RPCs.
- Migration is idempotent at table/index creation so an operator can reconcile version histories if a project-local migration runner and the connected Supabase service see it under different migration versions.

### Deployment / acceptance
1. Quality, TypeScript/Next build, secrets and schema-regression tests all pass before applying the DDL.
2. Apply **this exact reviewed SQL** using the connected Supabase migration capability, not a raw untracked SQL command.
3. Inspect the live table: RLS true, no anon/authenticated table privileges, no rows, default state `blocked`, missing worker RPCs and Awin still paused/sync off. Run security advisors.
4. Record exact Supabase migration outcome and GitHub/Vercel release in JSON and readable handovers. If a local CLI later sees the migration with a different version, reconcile history without re-running destructive DDL.
5. If validation fails, **never activate a worker**. Do not drop a table without rechecking for data; with zero jobs, rollback is possible after assessing dependencies.

### Remaining PR #117 blockers
- Safely design and test atomic claim/renew/retry leases, checkpoint transactions and metadata-only updates under interrupted and duplicate execution, including actual SQL integration tests.
- Verify the current joined Awin Tyres UK feed identifier, allowed private retention/expiry/deletion of supplier snapshots, source currency/identity and runtime memory limits.
- Preserve `/api/internal/awin-pneus-private-import` schedule; never wholesale replace `vercel.json`. Do not set `AWIN_TYRE_AUTO_ENRICH_ENABLED=true`.
- Existing exact-original-file owner manual recovery and all public tyre permission/fitting/price gates remain unchanged.

### Other Supabase advisor findings (separate security ticket, not changes in this release)
Security advisor on 13 Nov also flagged signed-in execution of two `SECURITY DEFINER` publishing RPCs (`public.publish_avuqo_legal` and `public.publish_editorial`). This warrants an independent authorisation regression review before permission changes. It also flagged disabled leaked-password protection and RLS-enabled service-only tables without policies; the latter pattern may be intentional for service-only operation.
