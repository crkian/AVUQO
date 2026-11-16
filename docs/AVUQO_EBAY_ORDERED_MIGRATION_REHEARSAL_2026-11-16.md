# Ordered eBay privacy migration installation rehearsal

**16 November 2026 | £0 incremental cost | Docker-free | Production Supabase UNCHANGED**

## Why this milestone matters

The existing native PostgreSQL regression suite exercises exact production SQL and concurrency correctly, but applies some eBay migrations in a convenient test order rather than their actual timestamp order. A successful test therefore did **not** prove that the migrations would install cleanly in chronological sequence in a fresh database.

This release adds an independent, throwaway PostgreSQL migration rehearsal. It does not activate eBay or imply that full GDPR deletion has been demonstrated.

## What is now built

- `tests/fixtures/ebay-migration-replay-manifest.txt` holds all twelve exact privacy-related versioned migrations in their actual strictly increasing filename order, from `20261116132000` through `20261116224000`.
- `scripts/test-ebay-ordered-migration-replay.sh` runs **only** as local OS user `postgres`, with `PGHOST=/var/run/postgresql`, `PGDATABASE=avuqo_ebay_ci_synthetic`, no remote connection variables. It creates a separate, fixed-name local disposable database; if that database already exists the creation fails, and it **never** drops a database it did not create.
- It installs only synthetic baseline schema, the four test-only secondary FK relationships and **all twelve original, unmodified versioned candidate migrations** using `psql -1 -v ON_ERROR_STOP=1`, a single atomic transaction.
- The unchanged live-compatible `scripts/ebay-full-schema-readonly-preflight.sql` then must show **11 structural PASS** and **provider_release_authorised BLOCK**, with a full unique twelve-check report.
- `tests/fixtures/ebay-ordered-replay-invariants.sql` requires no created deletion receipts, seller links, work queue records or audit records, and verifies paused source status and preservation of unrelated retailer data.
- After the checks the script drops only its disposable database. On failure, cleanup occurs through an EXIT trap.
- Static contracts in `tests/ebay-ordered-migration-replay.test.mjs` pin the migration list, local isolation, atomic transaction requirement, twelve release gates and no data side effects. Existing race, permissions, account-specific purge and live-compatible read-only preflight suites remain unchanged.

## What this test does and does not prove

A passing replay proves that, against the **minimum synthetic PostgreSQL schema plus the real production SQL**, the exact twelve migrations install in timestamp order and produce the expected structural grant/guard state. It is an important installation-order proof.

It **does not** prove compatibility with every real AVUQO production table, index, retention rule, existing migration history, provider contract, policy, ownership data, external processors, backups, logs or object storage. It cannot authorise applying SQL to production or changing the deliberately HTTP 503 deletion endpoint.

## Operations and security NO-GO

Live eBay source stays `paused`, `sync_enabled=false`, imports quarantined; provider subscription unregistered, verification token not entered. All erasure-journal/worker/guard candidate migrations remain unapplied to production. Awin continues independently. AVUQO does not supply or fulfil inventory.

Next release gate: cross-check actual Supabase migration history and full-production referential relationships with this chronological plan, and obtain an explicit reviewed, reversible DDL installation plan before **any** live migration.
