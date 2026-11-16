# eBay secondary-store orphaning safety gate | 16 November 2026

**Status:** candidate SQL only, **NOT applied** to production; £0 extra, no Docker.

## Verified live schema finding
Read-only Supabase `pg_constraint` inspection shows `analytics_events.offer_id`, `attribution_events.offer_id`, `user_feedback.offer_id` and `watch_events.offer_id` reference `offers.id` with **ON DELETE SET NULL**. The original eBay mapped-catalogue purge deletes an offer, which would silently strip the key from any surviving dependent records. That may make later account-scoped deletion unprovable. Other tables including `click_events` and several deal/availability tables use ON DELETE CASCADE. These relationships alone do not establish eBay ownership or authorise mass deletion.

## Production read-only inventory evidence
A live SQL read-only query on 16 November 2026 returned **zero** for fourteen targeted eBay-source/marker checks: four eBay catalogue tables, three direct offer-linked analytics/click/attribution checks, and marker scans on analytics, attribution, clicks, affiliate conversions, audit logs, creative assets and marketing assets. Counts of zero are not proof of absence of identity data in other JSON fields, orphaned rows, backups, CDN, object storage, application logs, or external processors. **No row samples or user identifiers were exported.**

## Proposed guarded SQL
`supabase/migrations/20261116203000_ebay_prevent_secondary_reference_orphaning.sql` defines a `BEFORE DELETE` trigger on `public.offers`. For **eBay-source offers only**, it rejects deletion if any of these four dependent tables still references the offer. Non-eBay offers are unaffected. The trigger neither deletes external data nor completes a receipt; an attempted partial purge fails and its lease/audit/deletion roll back in one SQL transaction. The design prevents destroying the remaining ownership mapping before a reviewed secondary erasure/retention decision.

The native GitHub PostgreSQL suite applies exact original versioned mapped purge, audit and one-item processor migrations with a **minimal synthetic** four-table ON DELETE SET NULL fixture, then confirms failure preserves all rows and pending task state. The test performs **synthetic-only** dependent-row cleanup inside a transaction to prove the original purge can proceed afterward, then rolls back everything. This fixture is not a production analytics erasure implementation.

## Unfinished release gates
Design a reviewed per-account identity linkage in the four secondary stores; distinguish legally retained aggregate/accounting/audit records, and provide per-store scoped erasure or irreversible anonymisation. Also inventory storage objects, CDN, application server logs, Supabase backups, external processors, metadata/JSON, unlinked historical rows and their retention controls. Test whole-schema data relationships and real provider signed notification end-to-end. eBay stays paused, sync off, import quarantined, webhook 503/unregistered, token not entered; Awin unchanged. Do not deploy this migration without review of non-eBay operations and actual FK semantics.
