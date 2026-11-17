# AVUQO eBay durable signed notification acceptance | 17 November 2026

**Candidate code only. Default status: OFF / HTTP 503. No production SQL installation, eBay portal registration or deletion-complete claim.**

## End-to-end integration

This continues the existing owner Control Tower `/control-centre/ebay-privacy`, production-safe eBay route `/api/ebay/account-deletion`, HMAC-only private receipt ledger, and the nine outstanding privacy migrations. It is NOT a parallel backend.

1. eBay GET verification remains tied to the canonical HTTPS URL and appropriately configured owner-created token.
2. POST rejects absent production credentials, oversized/malformed JSON, invalid eBay signature, wrong topic and missing notification identity before touching the database.
3. A cryptographically verified notice enters `journalVerifiedEbayDeletion`, which durably inserts a domain-separated HMAC-only receipt or checks exact equality for an idempotent duplicate. No raw eBay personal identifiers are stored by this journal.
4. **Pending** `20261116181000_ebay_erasure_work_journal.sql` installs an AFTER INSERT trigger that seeds all seven distinct review work items in the **same PostgreSQL transaction** as the receipt. If queue insert fails, the transaction rolls back; the receiver must not acknowledge. It also backfills unresolved receipts.
5. Added restricted, read-only boolean RPC `public.ebay_receipt_queue_ready(text)` to that same unapplied migration. Only service_role can execute it. It requires the exact receipt digest, active/unresolved receipt state, exactly seven rows and membership of each mandatory surface. No account/receipt data is returned; the RPC cannot perform erasure or transition state.
6. `hasDurableEbayErasureQueue` independently checks that RPC under the same HMAC domain. Errors, missing grant/migration, missing rows, invalid identity or stale state return **false**.
7. Only if **both** `EBAY_DELETION_ACCEPTANCE_APPROVED=true` and `EBAY_PRIVACY_OPERATIONS_CERTIFIED=true`, canonical endpoint and token are configured, signature verification succeeds, receipt insertion is durable or verified duplicate, and RPC verifies seven work items does POST respond with **HTTP 202 Accepted**. This means the notice was accepted for processing, **not** that all account erasure and legal retention have been completed.
8. With either switch absent (the production default), missing queue, missing RPC, failed journal, missing provider signature or incomplete release review, POST remains **HTTP 503** (or a validation error), with no false successful acknowledgement. No public UI toggles these environment controls.

## Production and legal gates still required

- Four historical foundations: function-body hashes verified (seven), seven structural checks pass. Exact whole-object constraints/defaults/grants/sequence ownership comparison and faithful isolated production schema replay remain outstanding.
- Nine privacy candidate migrations still not applied to production. The new RPC is appended to the **first pending migration**, not introduced as a second competing version or applied to live Supabase.
- Account-accurate processing of mapped catalogue, indirect identifiers, shopper analytics/attribution, stored media, CDN/application logs, backups/restoration and external processors; documented lawful retention exceptions and reviewer/worker monitoring are not completed simply because a queue exists.
- Approved eBay Marketplace Account Deletion subscription and signed provider tests, calibrated retries, duplicate/outage/recovery and privacy outcomes. A real 2xx acknowledgement requires operational/legal review.
- eBay Browse production API and EPN rights and any on-site eBay checkout permissions are independent approvals. An EPN link is not permission to transact as seller of record or operate dropshipping.
- Existing AVUQO warm-premium storefront, Control Centre, Awin isolation, marketing/scoring and broader commerce model remain intact.

## Tests and architecture

Versioned SQL: `supabase/migrations/20261116181000_ebay_erasure_work_journal.sql`; server code: `lib/ebay/deletion-journal.ts`; API: `app/api/ebay/account-deletion/route.ts`; runtime tests: `tests/ebay-portal-registration-runtime.test.mjs`, `tests/ebay-erasure-work-journal.test.mjs`; existing chronological 13- and nine-only native PostgreSQL CI rehearsals exercise the updated pending migration.

**Release rules:** keep eBay paused and provider portal unregistered; never turn either approval flag on as a shortcut. Do not upload secrets to public GitHub. No live production DDL/DML, provider 2xx activation, Awin changes, Docker or additional spend as part of this candidate.
