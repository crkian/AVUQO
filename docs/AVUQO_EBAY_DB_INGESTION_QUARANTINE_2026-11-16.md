# eBay database ingestion quarantine | 16 November 2026

**Purpose:** The earlier TypeScript suppression helper is not wired to any eBay importer. Until an approved atomic importer exists, writes to eBay items must be blocked at the database layer, not merely through a helper's usage convention.

## Implementation
- `supabase/migrations/20261116141000_ebay_ingestion_quarantine.sql` defines trigger guards on `offers`, `source_ingestion_items`, `product_matches` and `price_history`. New and updated rows are rejected if the **old or new** source belongs to connector `ebay`.
- `sources` trigger rejects eBay unpause, `sync_enabled=true` and attempts to relabel an eBay source to a different connector. Other merchant/source imports remain untouched.
- The trigger functions have no general direct EXECUTE grant. This quarantine is deliberate and **must not be removed simply to import an item**. A later replacement must prove an atomic ownership link, transactionally enforce deletion suppression, current data rights, limited product identity, price freshness and automatic withdrawal.
- `tests/ebay-ingestion-quarantine.test.mjs` checks the four write surfaces, old/new source checks, activation gate and continued deletion POST HTTP 503.
- No eBay access credentials, Browse approval, deletion token or user data is changed.

## Limitations, not compliance completion
This is **prohibition** of future eBay inserts, **not** deletion of any account data, eBay notification subscription, Browse access approval or merchant publication. The owner screenshot last showed eBay production keyset disabled. No live eBay offers were present at last independent Supabase check. The privacy receiver still answers 503 to signed deletion POST, because full erasure, retention, object-storage and partner data review, real signed test and idempotent completion remain unresolved.

## Next chat and release gates
Start with `docs/AVUQO_ACTIVE_HANDOVER.md`, this file, the [eBay privacy inventory](AVUQO_EBAY_PRIVACY_INVENTORY_2026-11-16.md), [partial erasure foundation](AVUQO_EBAY_ACCOUNT_ERASURE_FOUNDATION_2026-11-16.md) and the [Awin completion board](AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md). Check main, PRs, actual Vercel READY SHA, Supabase migration and grants.
Finish real account data retention/erasure and atomic eBay listing admission before removing quarantine. Never treat this DB hard-stop as an operational deletion receiver. Awin's existing private importers and merchant programme rollout continue separately and unchanged.
