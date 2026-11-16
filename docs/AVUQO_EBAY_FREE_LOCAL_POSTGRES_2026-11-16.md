# Docker-free, £0 eBay PostgreSQL concurrency verification

**Date:** 16 November 2026. **Scope:** synthetic database safety check, not eBay deletion completion.

AVUQO is a **public GitHub repository**; GitHub's standard hosted runners are free for public repositories. The standard `ubuntu-24.04` runner has PostgreSQL installed and its service initially disabled. The existing `.github/workflows/quality.yml` now includes `ebay_postgres`, which starts the local PostgreSQL service and uses a dedicated synthetic database named `avuqo_ebay_ci_synthetic`. No containers, local installation, Supabase branch, external database connection, paid resources or production data are needed. The hosted VM and synthetic test database disappear after the job.

## Executed tests and limitations

The runner applies selected **real** versioned AVUQO migrations over a minimal synthetic fixture: receipt integrity trigger, account tombstone admission triggers and seven-surface private retry work journal. It checks the queue's initial seven items, stale-attempt rejection and transaction rollback, then runs independent database sessions for **receipt-first**, **advisory-lock reverse witness**, and **real ownership-link INSERT-first against receipt INSERT**. That last test uses an *uncommitted* synthetic eBay-source ownership link in one transaction; it does **not** prove a committed link followed by full erasure. All test-generated receipt/link records are rolled back. The fixture is a narrow subset of AVUQO, not a production schema clone.

The `ebay_postgres` GitHub job is the sole source of actual PostgreSQL test evidence. Lint/build and static contract checks must not be described as a successful concurrency test unless this job succeeds. To review its logs: open the pull request, choose **Checks**, and inspect **Native PostgreSQL eBay concurrency (synthetic, no Docker)**.

## Budget and safety

No Docker anywhere in this testing path, no additional spend, no Supabase schema/data changes, no customer details. eBay remains paused; sync is disabled, ingestion quarantine stays enforced, and unregistered webhook stays HTTP 503. Awin unchanged.

## Still required

A faithful complete-schema or owner-authorised clone test, true committed ownership-link follow-on erasure, identity alias/race permutations, full cross-store erasure implementation and processor/backup/legal retention verification, signed eBay provider notification testing and production permissions. No false `completed` receipt or 2xx acknowledgment is permitted.
