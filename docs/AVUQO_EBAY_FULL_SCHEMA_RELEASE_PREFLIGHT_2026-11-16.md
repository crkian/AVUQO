# eBay production read-only release preflight | 16 November 2026

**£0 extra | No Docker | No production mutations | eBay NO-GO**

This milestone adds a **single query, read-only** structural diagnostic in `scripts/ebay-full-schema-readonly-preflight.sql`. An authorised DBA can execute the query on live Supabase without installing a migration. It queries PostgreSQL catalogs, source configuration and private object metadata, but does not read personal deletion receipts or seller information and does not alter any data.

## What it checks

Twelve distinct gates: (1) source paused/sync off, (2) all eleven foundational source/catalogue and review tables exist, (3) four validated secondary `offer_id -> offers.id` foreign keys still have `ON DELETE SET NULL`, (4) work journal exists, (5) private audited partial-erasure table exists, (6) all six required versioned DBA-only functions exist, (7) original orphan guard is enabled, (8) independent FK-drift guard is enabled, (9) queue row-level security is enabled, (10) the queue cannot be read or updated by application roles, (11) the private one-item purge runner has no application-role EXECUTE grants, (12) **provider release approval is ALWAYS BLOCK regardless of other results**, since database readiness never certifies eBay's notification, lawful retention or processor obligations.

**Live production read-only execution, 16 November 2026:** source quarantine, eleven foundational relations, four validated foreign keys and existing partial audit table returned `PASS`. The journal, six-function completion, guards, queue RLS, private journal grants and executor grant gate returned `BLOCK` because the candidate migrations remain unapplied. The provider release gate returned `BLOCK` intentionally. No private records or user data were copied to the repo.

**Do not install migrations just to turn this report green.** It is only one engineering safety gate, not compliance or operational approval. Migration application needs separate full-schema and legal/security review; external processors, storage, CDN, backups and actual eBay signature testing remain outstanding.

## CI evidence

GitHub's existing Docker-free native PostgreSQL runner applies exact candidate privacy migrations to its isolated disposable Unix-socket database. `scripts/test-ebay-full-schema-readonly-preflight.sh` uses only that local database and requires 11 structural **PASS** rows while the twelfth, `provider_release_authorised`, stays **BLOCK**. Unexpected check IDs, missing counts or privilege exposures fail CI. The read-only SQL is structurally checked by `tests/ebay-full-schema-readonly-preflight.test.mjs`.

These are real SQL/database privilege tests on a **synthetic partial schema**, not on a full clone of AVUQO's production database. Passing native CI plus the production preflight does not authorise deployment, activate eBay or settle deletion retention.

## Operational next gates

1. Validate exact candidate migration compatibility against all live production constraints, not just this foundational table list, while keeping changes in a reviewed isolated environment.
2. Define lawful account-specific treatment of AVUQO shopper activity, attribution, uploaded objects, cache/CDN logs, back-ups and external processors; retain separate evidence.
3. Document migration install and rollback, owner approval and protected operator workflow, then separately review any live DDL.
4. Prove genuine signed provider notification acceptance and durable idempotent deletion processing, with no false 2xx acknowledgement.
5. Only after those gates, configure the secure verification token and save the production HTTPS deletion endpoint in eBay Developer Portal.

AVUQO stays a hands-off comparison/affiliate marketplace with retailer-owned fulfilment, **not** a dropshipper. Source paused, sync disabled, import quarantined, callback HTTP 503 and unregistered. Awin unchanged.
