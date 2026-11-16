# eBay Privacy Control Tower: live owner-only operational dashboard

**Date:** 16 November 2026. **Budget:** £0 additional. **Docker:** none. **Production Supabase schema/data writes:** none.

## Delivered

New owner-only dynamic route `/control-centre/ebay-privacy` with linked entry in `/control-centre/retailers`. It requires `requireControlCentreAccess()` *before* any service-key database interaction. Search engines are told not to index it. It is a fully read-only page with no action endpoints, submission forms or provider-activation buttons.

Server-only evidence loader `lib/ebay/privacy-control-tower-server.ts` uses Supabase administrative **count-only HEAD** requests to obtain:
- eBay source status and whether sync is off.
- Count of private receipts and exact account ownership links, **never their HMAC digests**.
- eBay-source-scoped offers, ingestion items, price history and product matches.
- State counts for pending, leased, awaiting evidence and blocked work.
- Per-surface work counts for mapped catalogue, indirect identifiers, analytics/attribution, storage/media, application/CDN logs, backups/restoration and external processors.

The owner-only UI reports only aggregate counts and configuration *booleans*, never IDs, credentials, tokens, account identifiers, metadata, JSON payloads, logs or personal rows. When a table is not deployed (the current live erasure-work journal) or a query fails, the evidence shows **Unavailable**; it is NEVER interpreted as an empty queue or compliance success.

`lib/ebay/privacy-control-tower.ts` is a deterministic, easily unit-tested fail-closed policy. It computes whether source quarantine is known and whether read-only counts are available, but hard-blocks `registrationReady` and `completionAuthorised` even if technical counts are all zero and portal configuration booleans are present. Full lawful erasure/retention review, genuinely signed provider acknowledgement semantics, third-party processors, backups and real eBay approval are still mandatory independent external gates.

The new static and actual policy runtime tests run in GitHub CI alongside the full existing native PostgreSQL synthetic queue/erasure tests and general lint/build/security checks.

## What this DOES NOT do

No eBay API is called. No worker or scheduler is started. No provider callback is acknowledged 2xx. No eBay source changes state. No production Supabase migrations or data writes happen. No verification token is generated or saved, no subscription is registered, and no Awin work is modified.

## Real operational state verified read-only

A live Supabase read-only query on 16 November 2026 confirmed: eBay source `paused`, `sync_enabled=false`, zero receipt and ownership link rows, and `public.ebay_erasure_work_items` **not present** in production. Production callback remains intentionally HTTP 503. This is a live operational observation, not evidence of full erasure.

## Required next substantial gates

1. Finish the complete versioned private erasure policy/workflow, distinguishing eBay account data from separately owned AVUQO shopper activity and lawful retention.
2. Test exact all-store and referential integrity against full schema, including storage, logs, backups and outside processor retention/erasure evidence.
3. Install and verify the reviewed Supabase migrations in a safe release process, then implement bounded private worker and documented exceptions.
4. Validate real eBay-signed provider notifications, retries, durable acknowledgement semantics and correct developer application permissions.
5. Only then configure the verification token and HTTPS endpoint and register the eBay deletion notification subscription. Do not interpret a count of zero as approval.

AVUQO remains an automated multi-retailer price-comparison and bargain discovery platform. It does not hold merchant stock, dropship, or fulfil orders. Purchases go through the authorised retailer or marketplace. Awin remains independent and untouched.
