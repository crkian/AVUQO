# eBay DBA-only bounded mapped-catalogue processor

**16 November 2026** · **£0 additional spend** · **No Docker** · **CANDIDATE, NOT DEPLOYED IN SUPABASE**

## Why this exists

PR #255 proved the actual original versioned `ebay_purge_mapped_account_rows`, audited wrapper, work journal and leased executor using native PostgreSQL. PR #256 proved the eBay Developer Portal verification GET and deliberate deletion POST failure. Neither supplied a safe operational single-step processing entry point. This candidate fills *only that narrow gap*.

## Implementation

`supabase/migrations/20261116200000_ebay_dba_bounded_mapped_purge_runner.sql` defines `public.ebay_run_next_mapped_catalogue_erasure()`. It is **DBA-only**, accepts **no caller-supplied identity or receipt**, and selects **one** eligible `mapped_catalogue` work item for a `pending_privacy_review` or `processing` receipt using `FOR UPDATE OF w SKIP LOCKED`. It atomically sets a bounded 90-second lease, advances the attempt and invokes the **actual versioned** `ebay_execute_leased_mapped_catalogue_erasure(receipt_id,attempt)`. The existing executor checks eBay remains paused and synchronisation disabled, invokes the original source-isolated audited purge, writes a count-only audit and moves the queue item to `awaiting_evidence`.

**Postgres transaction semantics:** All steps execute inside one function call/transaction. Any exception aborts the claim, purge, audit and review transition together. If there is no eligible mapped task, the function returns no rows. It is not a cron, API endpoint, or running worker, and must never be used as an eBay notification acknowledgement. Permissions for `public`, `anon`, `authenticated` and `service_role` are explicitly revoked. The code cannot mark a receipt `completed` or configure the portal.

## Docker-free native PostgreSQL acceptance

The existing GitHub `ebay_postgres` job now executes the exact new migration and `tests/fixtures/ebay-local-dba-processor-acceptance.sql` **after** the original production mapped purge and audited wrapper migrations. On a throwaway synthetic database it verifies:

1. One eligible mapped record is purged, audited and moved to `awaiting_evidence`, with unrelated eBay and non-eBay rows preserved.
2. Calling again returns no work, and the receipt remains `pending_privacy_review`, never `completed`.
3. If the eBay source is not paused, processing fails and the work claim is rolled back without deleting data.
4. A restrictive foreign key rejects the purge and rolls back the claim and audit in the same database transaction.
5. All fixture data disappears after explicit rollbacks.

This is the real function executing original SQL on a **minimal synthetic schema**, not a proof of full production schema constraints or account erasure across other stores. GitHub job success is required for any claim that the tests passed.

## Go/no-go and remaining implementation

**NO-GO** for production activation. The new versioned SQL is **not applied** to production Supabase. No scheduler or worker calls it. Existing journal/executor migrations remain unapplied. eBay source is paused, sync off, imports quarantined, deletion webhook HTTP 503/unregistered, production token not configured, and Awin unaffected.

To finish the actual eBay Developer Portal integration, we still must inventory/implement the other erasure surfaces, processor data, file/storage/logs/analytics, backup and legal retention decisions, full-schema referential acceptance and genuine signed eBay notification handling. Only after a reviewed lawful idempotent end-to-end processor exists can the permanent completion guard and webhook 503 be reconsidered. This incremental DBA tool is not that complete process.
