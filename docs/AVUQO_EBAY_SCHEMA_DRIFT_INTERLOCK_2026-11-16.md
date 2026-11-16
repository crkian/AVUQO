# eBay mapped deletion schema-drift interlock | 16 November 2026

**Status:** candidate migration; **do not apply to production** until reviewed against the full live schema. No new paid service, no Docker, no production data changes.

## Why this is a material safety gate

The real AVUQO Supabase database has four **validated** foreign keys from `analytics_events.offer_id`, `attribution_events.offer_id`, `user_feedback.offer_id`, and `watch_events.offer_id` to `offers.id`, each using `ON DELETE SET NULL`. This relationship can orphan privacy-relevant shopper and attribution context when an eBay account's mapped offer is removed. Existing candidate migration `20261116203000_ebay_prevent_secondary_reference_orphaning.sql` blocks eBay offer deletion when linked shopper records exist, but a future schema migration could change the foreign keys or disable the original guard without updating eBay's operational assumptions.

## Implemented independent safeguard

`supabase/migrations/20261116224000_ebay_secondary_schema_drift_interlock.sql` adds a second `BEFORE DELETE` offer trigger, applicable **only to eBay-source offers**. It checks that all four *exact* one-column foreign keys still point from `offer_id` to `offers.id`, are validated and use `ON DELETE SET NULL`. It also confirms the existing orphan-protection trigger is still present and enabled in normal mode. A mismatch raises an exception and the real bounded mapped partial-erasure processor's claim, source-scoped deletions and audit roll back atomically.

The trigger does **not** delete, anonymise, mark a receipt completed, acknowledge a provider notification, install a worker, change source status or grant any application execution privileges. It is one additional fail-closed constraint and does not independently prove full privacy compliance. A malicious DBA/superuser who can disable both triggers is outside this control's threat model; migration and privileged access review remain mandatory.

## Real native PostgreSQL regression evidence

The existing £0 Ubuntu GitHub Actions PostgreSQL job executes the **exact versioned original** mapped catalogue purge, audited wrapper, queue and executor, plus both the old and new offer guards, on a local synthetic schema. The new `tests/fixtures/ebay-local-schema-drift-erasure-acceptance.sql` explicitly:

1. Proves a valid, unconstrained synthetic eBay mapped offer still purges and moves work only to `awaiting_evidence`.
2. Drops the synthetic analytics foreign key and proves the real erasure processor rejects the structural drift, preserving the offer, work attempt and audit.
3. Changes attribution's action to `ON DELETE CASCADE` and proves the same atomic rejection.
4. Disables the original orphan guard, then proves the independent interlock blocks deletion even with no existing shopper records.
5. Deletes a **non-eBay** offer under a temporary drift scenario, ensuring source isolation.
6. Rolls back every synthetic schema or data mutation and confirms four foreign keys and the original trigger are intact afterward.

These tests are real SQL on a **minimal synthetic schema**, not a full production clone. The original production audited purge is used as an unmodified versioned migration. The tests do not represent external processor, CDN, backup or legal-retention evidence.

## Remaining release blockers

The current production Supabase erasure-work journal and all newer worker/guard migrations remain **unapplied**. eBay is paused, synchronisation disabled and ingestion quarantined; deletion webhook remains deliberately HTTP 503 and unregistered. Complete account-specific retention/erasure coverage across the seven surfaces, signed genuine provider notification handling, evidence policies, full-schema acceptance and operational approval are still required before the Developer Portal subscription can be saved. Awin remains unchanged and AVUQO never directly supplies or fulfils goods.
