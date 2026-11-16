# eBay exact-account secondary history lease assessment | 16 November 2026

**Status: candidate SQL, not applied to production. £0 additional spend, no Docker.**

AVUQO's commercial model is automated retailer/marketplace comparison, bargain discovery and authorised outbound/retailer-managed purchase journeys. AVUQO does **not** directly supply stock, dropship goods, accept orders as stock seller or fulfil customer orders. Awin remains independent.

## What was implemented

`supabase/migrations/20261116214000_ebay_secondary_history_lease_disposition.sql` adds the DBA-only `public.ebay_assess_leased_secondary_history(receipt_id,attempt)`. It locks the exact `analytics_attribution` queue surface, rejects invalid/stale/expired leases and non-pending/non-processing receipts, and demands the eBay source remain paused with synchronisation disabled. It calls the existing original `ebay_secondary_account_reference_counts` function for exact HMAC-account-linked, eBay-source offers, counting the following linked secondary tables: `analytics_events`, `attribution_events`, `user_feedback`, `watch_events`.

If **any** linked secondary records exist, it sets the leased queue row to `blocked`, with reason `SECONDARY_REVIEW_REQUIRED`. It **does not delete, detach or anonymise** shopper-owned events and does not erase unrelated eBay/Awin records. If none are linked, it sets the row only to `awaiting_evidence`. A zero count is **not** verified absence of eBay account information in JSON, orphaned historical records, application logs, storage, external processors or backups. The receipt remains `pending_privacy_review`; no completion or eBay 2xx is enabled.

The lease check and outcome execute in one PostgreSQL transaction; invalid/stale calls leave the queue unchanged. `public`, `anon`, `authenticated` and `service_role` have no direct EXECUTE grant on this DBA-only routine. No worker or scheduler calls this function in production.

## Actual PostgreSQL test

The existing GitHub public-repository Ubuntu runner uses native PostgreSQL over a dedicated Unix socket, not Docker, and applies the exact committed versioned privacy migrations against a throwaway synthetic schema. `tests/fixtures/ebay-local-secondary-disposition-acceptance.sql` tests a synthetic eBay identity and mapped offer with one row in each secondary table, and a separate unlinked receipt. It requires a blocked disposition, current-attempt exclusivity, duplicate/stale rejection, preserved shopper rows, an awaiting-evidence (not verified) unlinked case, unchanged pending receipts and full rollback with no remaining synthetic rows.

## Activation gates remain

Production Supabase work-journal, executor, reference guard, secondary account counter and this reviewer function are **still unapplied**. Production callback remains HTTP 503/unregistered; eBay source stays paused/sync disabled/imports quarantined. To enable subscription, the actual policy for user-generated feedback, sessions, analytics and lawful retention must be settled and implemented; full-schema, storage/CDN/log, backup, processor and genuine signed eBay-provider acceptance tests remain necessary. This candidate is a safe review outcome, **not completed account erasure**.
