# AVUQO | eBay privacy inventory and future re-import suppression · 16 Nov 2026

## Evidence captured on production Supabase
Project `tfoukwcruaamrtgxzshh`, read-only checks: source-linked eBay offers **0**, source-ingestion items **0**, price_history **0**, product_matches **0**, deletion receipts **0**. Scans of raw/metadata fields in `offers`, `source_ingestion_items`, `click_events`, `attribution_events`, `analytics_events`, `affiliate_conversions` and `audit_logs` yielded **0 eBay string matches**. These checks are NOT a full inventory of all historical, backup, storage, partner and future API-held records. No raw user data was read back in this audit.

## New code (not yet a compliance-complete receiver)
- `lib/ebay/deletion-identity.ts` shares *exactly* the existing journal's domain-separated HMAC-SHA256 hashing for `userId`, `username`, `eiasToken`, preserving all existing receipt hashes.
- `lib/ebay/deletion-suppression.ts` reads the non-public `ebay_deletion_receipts` table as server service role and returns `suppressed` for **any** matching identifier digest, including pending receipts. Missing secret, no valid identifiers, database failure or unexpected response returns `unavailable`, **not** `clear`. This must be called from a future actual eBay account-identified importer before persisting data; it is **not yet wired** because no eBay Browse/Feed importer exists in production.
- `lib/ebay/deletion-journal.ts` now reuses shared digests, maintaining duplicate matching.
- Unit contract tests cover matching domains, multi-identifier checking, safe failures and RLS grants.

## Remaining hard gates
Existing webhook still deliberately responds HTTP 503 even to valid signed notifications. Merely storing HMAC receipts, or detecting that current eBay source data count is zero, **does not mean the eBay privacy instruction was executed**. No deletion processor or legal-retention policy, no complete per-table/backup erasure audit, no live eBay signature verification test, no production OAuth/verification/HMAC credentials configured, and no eBay Developer subscription. Owner screenshot showed production keyset **disabled**. Do not click Save on an incomplete endpoint and do not claim individual eBay products live.

**Exact next engineering stage:** design and test authenticated deletion/suppression in the *actual* future eBay importer: purge or anonymise every matching retained eBay account identifier across source rows, catalog offers, analytics, conversion and storage according to a documented legal-retention matrix; prevent reimport on every ingestion and backfill path; atomically finish receipts, retry and audit without raw identifiers. Only then consider 2xx and owner registration. Independently confirm eBay Buy/Browse approval. Preserve current Awin Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private work and owner preflight as separate lane.

## New chat restart
Always begin with `docs/AVUQO_ACTIVE_HANDOVER.md`, this inventory, `docs/AVUQO_EBAY_AWIN_EXACT_RESUME_2026-11-16.md`, Awin completion board and tracker; check actual GitHub main, Vercel READY app SHA and Supabase state before any claim. Update both MD+JSON handovers and branch tracker, status, changelog after each significant outcome.
