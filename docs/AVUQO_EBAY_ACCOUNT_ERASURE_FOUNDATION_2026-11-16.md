# eBay account-scoped erasure foundation | 16 November 2026

## Scope and observed evidence
The live Supabase database has **0** eBay source-linked `offers`, `source_ingestion_items`, `product_matches` and `price_history` rows, plus **0** private deletion receipts. Checked eBay-marker string matches in key analytics, click, attribution, conversion and audit metadata: **0**. This is an incomplete privacy inventory; external systems, historical backups, arbitrary JSON and retention obligations still need review.

## Code introduced
Versioned migration `supabase/migrations/20261116132000_ebay_account_scoped_erasure_foundation.sql`:
- Private `ebay_account_item_links` table, storing only HMAC account identity digests mapped to specific `offers.id` or `source_ingestion_items.id`, never raw seller identifiers. Trigger requires every linked row to belong to the **eBay** source.
- RLS on; revoke `public`/`anon`/`authenticated`/general service grants; `service_role` SELECT+INSERT only for future trusted eBay importer. Link lookup indexes; FK cascade removes stale link rows.
- **DBA-only** `public.ebay_purge_mapped_account_rows(notification_digest)`: locks an authenticated eBay deletion receipt; looks up mapped rows by any of the three recorded account digests; confirms eBay source isolation; deletes exact linked eBay price history, product match, offer and private ingestion rows in one database transaction. If a foreign key or cross-source check fails, transaction aborts. Reports row counts only. Not callable from webhook and service_role has no EXECUTE.
- Does not update receipt state to `completed`; does not purport to cover site attribution, analytics, unlinked rows, object storage, legal retention or backups.
- Contract tests validate scope isolation, no browser grants, no general service-role destructive execute and unchanged webhook HTTP 503.

## Critical limits and next action
This is a **foundation** for real erasure, not an operational compliance endpoint. There is no live eBay importer yet and no linked eBay seller rows. No user data was deleted by this migration. Need a reviewed **complete** privacy inventory and future importer that attaches an identity link transactionally and checks the existing suppression guard. Need genuine provider notification acceptance, idempotent full-store deletion and tombstones, legal exceptions, audits and operator recovery. Current webhook still returns 503 and must NOT be registered in eBay Developer until it can respond correctly to real verified events. Production keyset last seen disabled. No credentials should be committed.

For the next fresh chat, open `docs/AVUQO_ACTIVE_HANDOVER.md` before any other material; follow this runbook, `docs/AVUQO_EBAY_PRIVACY_INVENTORY_2026-11-16.md`, Awin board, feature tracker and live GitHub/Vercel/Supabase state. Continue Awin owner-only preflight separately; do not redo existing Petlibro, Cadbury, Craft Buddy, Mozillion, Tooled Up or tyres pipelines.
