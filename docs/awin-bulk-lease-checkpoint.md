# Private Awin bulk lease and checkpoint contract

**Scope:** database primitives only. There is still **no** bulk snapshot downloader, worker, cron, queue dispatcher, or public publishing.

## Claim: `claim_private_awin_bulk_job(job_id, lease_seconds)`

- Requires an existing snapshot-backed job and a private import in `importing` with permission status `unverified`.
- Enforces Awin source `paused` and `sync_enabled=false`.
- Locks the job row and underlying import session; issues an unguessable lease token with 30–120 second expiry.
- Rejects concurrent unexpired claims and jobs after 20 attempts.
- **Crash recovery:** if an earlier append RPC committed but the journal did not advance, the next expired-lease claim copies *authoritative* `large_feed_import_sessions` progress instead of replaying a duplicate chunk.
- These primitives do not enforce the complete vendor schema, membership, storage/object authenticity, or publication rights; the future worker must enforce those independently before any write.

## Reconcile: `reconcile_private_awin_bulk_job(job_id, lease_token, release)`

- Rejects stale or expired lease tokens.
- Reads authoritative import-session counters rather than trusting caller-supplied progress.
- Advances only monotonically within validated total and 250-row chunk bounds.
- On release, records `retryable`; after the underlying private import is finished and counts match, records `completed`.
- The existing `append_general_awin_feed_chunk` remains the only authority for chunk commits. Journal reconciliation is a separate transaction, with crash recovery at the next claim.
- An executor must never call finalisation before all chunks have passed full validation and membership/rights gates.

## Access & testing

Both RPCs have EXECUTE revoked from PUBLIC, anon and authenticated, granted only to service_role. The table itself remains RLS-protected. The migration has been applied and privileges inspected. **No real bulk job has yet exercised these functions.**

Next: isolated transactional tests with synthetic job/session data and multi-worker contention, then immutable snapshot storage, schema projection, per-chunk durable worker, and no-publication integration tests. Do not enable scheduling.
