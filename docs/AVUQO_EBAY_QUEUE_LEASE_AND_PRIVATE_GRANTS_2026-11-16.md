# eBay work-queue concurrency and least-privilege acceptance

**Date:** 16 November 2026. **Budget:** £0. **Execution:** native PostgreSQL on public GitHub-hosted Ubuntu runner; no Docker, no Supabase branch, no new paid infrastructure.

## New runtime PostgreSQL checks

The existing native job now runs `scripts/test-ebay-native-queue-lease-race.sh` against the temporary Unix-socket-only synthetic database. It inserts a *random synthetic* deletion receipt in the isolated runner database, verifies that precisely seven work-surface tasks were seeded, and marks six of them blocked to leave exactly one eligible queue item. Connection A begins a transaction, claims that single task with `public.ebay_claim_erasure_work(90)`, then holds the row lock and signals readiness with an unrelated PostgreSQL advisory transaction lock. An independent connection B must receive zero new claims (the actual queue claim is `FOR UPDATE SKIP LOCKED`). Connection A rolls back; a subsequent claim must retrieve the original task with attempt 1 and leave the receipt pending, never completed. The entire synthetic database is discarded by GitHub after the job.

`tests/fixtures/ebay-local-permissions-integrity.sql` asserts that `anon`, `authenticated` and `service_role` have no SELECT/INSERT/UPDATE/DELETE rights over `public.ebay_erasure_work_items` and no EXECUTE on either DBA-only claim/outcome routine. It also attempts to change an isolated synthetic receipt to `completed` inside a rolled-back transaction and requires the existing permanent-tombstone trigger to reject it. It does not relax an eBay guard or change production privileges.

Static assertions in `tests/ebay-native-lease-race.test.mjs` ensure that the native runner still executes these tests. The authoritative execution evidence is the separate GitHub job **Native PostgreSQL eBay concurrency (synthetic, no Docker)**; lint/build alone is not an actual PostgreSQL pass.

## Explicit remaining gaps

This only establishes single-eligible-item worker exclusion, rollback retry, private function grants and receipt completion protection in a minimal synthetic subset. It is **not** an erasure worker, not a full-store inventory, not committed post-link erasure, not third-party processor or backup compliance, not a provider-signed notification test and not a green light to acknowledge eBay. The work-journal migration is still **not applied to production**. Keep eBay `paused` with sync disabled, ingestion quarantined, webhook HTTP 503/unregistered, and all Awin private feed work unchanged.

To meet a future lawful erasure release gate, implement each deletion surface with idempotent verification/retries, provider evidence and retention decisions, test the full actual schema and independently review legal obligations before changing receipt completion or webhook behaviour.
