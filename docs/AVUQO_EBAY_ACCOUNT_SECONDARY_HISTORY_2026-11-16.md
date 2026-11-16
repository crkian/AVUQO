# AVUQO eBay account-specific secondary-history review | 16 November 2026

**Mode:** Advanced marketplace comparison and approved retailer/affiliate purchase journeys. AVUQO does **not** directly supply inventory, buy stock to fulfil orders, or operate dropshipping. Automation is for listings, verified price/deal discovery, referrals, freshness, moderation and privacy tasks, not merchant-of-record stock fulfilment.

## Why this step is needed

Real live Supabase schema inspection previously identified four `ON DELETE SET NULL` dependencies from `analytics_events`, `attribution_events`, `user_feedback`, `watch_events` to `offers`. The staged guard from PR #258 prevents a partial eBay purge silently losing the offer relationship while these records remain. These rows can also belong to independent AVUQO shoppers and cannot be assumed to be eBay seller records that should all be deleted.

## Implemented candidate

`supabase/migrations/20261116211000_ebay_secondary_account_reference_counts.sql` adds the DBA-only `public.ebay_secondary_account_reference_counts(receipt_id)` function. Given one existing, unfinished deletion receipt, it matches the receipt's three exact HMAC account identity aliases against `ebay_account_item_links` and verifies that the linked offers belong to the eBay source. It returns **only six aggregate values**, never IDs, paths, sessions, names or payloads:

- Count of distinct mapped eBay offers.
- Counts of offer-linked analytics, attribution, feedback and watch rows.
- Boolean showing whether any of those four secondary categories need review.

The function **never deletes, updates, detaches, anonymises, marks receipt completed, acknowledges eBay or reaches another provider**. Its zero counts apply to the exact currently linked offers only. They are not proof of complete erasure, no historical or orphaned data, no retained data elsewhere, or compliance. The function is revoked from `public`, `anon`, `authenticated` and `service_role` and is only for DBA-controlled review.

## Native PostgreSQL acceptance

The existing public-repository GitHub Actions Ubuntu PostgreSQL job applies the exact candidate SQL to its isolated synthetic database along with the original production eBay receipt, ownership link and source safety migrations. It creates an eBay account with two identity aliases pointing to **one** offer, unrelated eBay and non-eBay offers, and separate records in all four secondary tables. The checks require one mapped eBay offer, one row in each secondary category, and no unrelated-data inclusion. A separate receipt without a linked offer returns zeros, with an explicit warning in the runbook that zeros are not full erasure. All receipts and rows are rolled back; no live customer data is copied.

## Production restrictions

This migration, the journal, erasure executor and dependency guard are **not applied to production**. No schedule or automated worker is enabled. eBay source remains paused, synchronisation off, ingestion quarantined and unregistered deletion webhook HTTP 503. eBay Developer Portal token/endpoint remain unconfigured, and eBay Buy/Order API capabilities must not be assumed approved. Awin continues independently.

## Next actual completion gates

Create a lawful per-store ownership and retention decision for analytics and attribution records without deleting unrelated shopper history; resolve watch/feedback records under separate user-rights rules. Then test exact scoped secondary deletion/anonymisation, full schema/dependency constraints, logs, object storage, backups and processors; run end-to-end genuine signed eBay webhook tests and only then release the provider subscription. Do not infer that AVUQO is exempt from eBay deletion notifications merely because its commercial model is affiliate/referral.

No Docker and no additional paid services.
