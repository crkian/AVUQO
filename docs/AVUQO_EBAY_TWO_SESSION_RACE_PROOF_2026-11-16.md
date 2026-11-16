# eBay deletion admission: two-session concurrency proof runbook

**Date:** 16 November 2026. **Status:** LIVE TWO-SESSION PASS NOT YET CONFIRMED.

## Why this matters
Migration `20261116165000_ebay_atomic_tombstone_admission.sql` adds a shared transaction-scoped PostgreSQL advisory lock to deletion-receipt INSERT and eBay account-to-item link INSERT/UPDATE, plus a fresh exact-digest suppression lookup. A previously successful single-session test proved that a known tombstone rejects a new link, but did not show that distinct database transactions correctly block one another.

## Attempt and observed limitation
An initial multi-request live Supabase SQL attempt was executed with two separately submitted SQL tool calls. One returned its backend identity and zero synthetic records. The second failed with **`RACE_TEST_UNEXPECTED_NO_CONTENTION`**. This does **not** prove a lock defect, and does **not** prove lock correctness, because the tool did not provide a validated barrier or proof that both statements overlapped. No successful cross-session contention was recorded; the resulting test rows were zero. Do not call this test passed.

## Repeatable two-connection test added
`scripts/test-ebay-tombstone-race.sh` runs separate `psql` client processes using an operator-supplied **private** `EBAY_RACE_TEST_DATABASE_URL` and explicit opt-in. Never commit a database URL or paste it into logs. It requires PostgreSQL client `psql`, `openssl`, a privileged, approved testing connection and at least one existing non-eBay offer, used only as a reference for a failed link attempt.

The holder transaction creates a randomly generated uncommitted HMAC-shaped receipt and holds its per-identity transaction lock. The contender transaction attempts to link the same fingerprint with `lock_timeout=1200ms`. The harness **requires PostgreSQL SQLSTATE `55P03`** (or its lock-timeout text), which demonstrates that the contender reached the lock rather than merely failing source validation. Both processes end without committing a synthetic receipt or link. The script verifies the two table totals remained unchanged and that neither synthetic fingerprint exists. A missing connection, missing opt-in, missing offer, absent overlap, wrong error or altered counts is a skip/failure, never a passing test.

Run only on an authorised environment with secure credentials, preferably a non-production clone:
```bash
ALLOW_EBAY_RACE_TEST=true \
EBAY_RACE_TEST_DATABASE_URL="<private authorised connection string>" \
bash scripts/test-ebay-tombstone-race.sh
```
This is a **manual operation**. Github quality CI executes only `bash -n` and structural safety checks, **not** two-session database integration, because the required database credentials are not installed in that workflow. Do not treat green CI as a cross-session race proof.

## Remaining scenarios
This script proves only receipt-first uncommitted lock contention, not the inverse link-first committed-transaction race, multiple receipt aliases, deadlock freedom, complete privacy erasure, high-volume contention or a real eBay signed event. Independent follow-up must cover those cases on a controlled database fixture with rollback and audit of missing account-identification records.

## Current NO-GO
eBay source paused, DB product-ingestion quarantine enabled, zero approved item-level eBay offers, production keyset last screenshot DISABLED, no production deletion HMAC/OAuth/challenge secrets, real signed provider event not tested, webhook still returns HTTP 503 and is unregistered. DBA-only erasure is partial. Awin private importer work is unchanged. Do not unlock the quarantine, issue a success acknowledgement, or claim eBay approval based on this harness.

Keep `docs/AVUQO_ACTIVE_HANDOVER.md`, its JSON, the Git feature tracker MD+JSON, Awin board, status and changelog synchronised after a future actual concurrency run.
