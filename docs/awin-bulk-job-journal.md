# Awin bulk-job journal: phase 1 (inert)

This migration introduces `public.awin_bulk_import_jobs` as a private metadata journal, **not an active scheduler or worker**.

## Existing working safeguards

- Petlibro UK: 44 private records, completed and duplicate retry passed.
- Mozillion SIM-free: 219 private records, completed and duplicate retry passed.
- `large_feed_import_sessions` and the 250-row atomic `append_general_awin_feed_chunk` RPC are retained.
- `AWIN_AUTO_IMPORT_ENABLED` remains unset; public Awin source stays paused.

## Journal contract

- Identifies a joined Awin advertiser and feed.
- Records an immutable SHA-256 snapshot fingerprint and a *storage key*, not an Awin signed download URL.
- Tracks planned, blocked, snapshot-ready, running, retryable, completed, failed and cancelled states.
- Caps progress to 500,000 rows / 2,000 chunks of 250 and bounds retry counts.
- Binds a future job to an existing private `feed_import_runs` record before it may run.
- Is protected by RLS; `anon` and `authenticated` have no table grants.
- No new cron, route, queue consumer or job-claim function is included.

## Next engineering stages (not yet implemented)

1. Secure object storage and snapshot creation from joined, allowlisted physical-product feeds. Store only immutable, digested snapshots; never persist Awin credentials.
2. Explicit source format and rights review for Tooled Up `496:89987`. Avoid alternative service feeds.
3. Atomic queue claim with bounded lease, heartbeat and retry backoff.
4. One chunk per server execution, replay-safe using existing private RPC idempotency. A checkpoint must advance in the same database transaction as a chunk commit, or be derived from the authoritative existing session after crashes.
5. Cross-feed overlap / merchant-product identity policy and tests.
6. Interrupted-run, duplicate-work, lease expiry, corrupted snapshot, revoked membership, and no-publication integration tests before any unattended scheduling.

## Validation gate

No bulk job may become runnable merely by inserting a planning row. The worker must not be enabled until the above conditions have been verified. Public publishing requires separate explicit approval.
