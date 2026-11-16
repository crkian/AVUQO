# AVUQO eBay privacy inventory: audited production surfaces, 16 November 2026

## Purpose and interpretation
This audit is an **evidence inventory**, not a claim that eBay account deletion has been completed. A database search for the literal word `ebay` does not locate arbitrary seller/user IDs that lack that word. Identifiers may be found in unrelated payloads, in provider account systems and historical backups even if marker counts are zero. Do not return a successful eBay account-deletion webhook response on this evidence.

## Exact production Supabase baseline
Project `tfoukwcruaamrtgxzshh`, read-only SQL, no raw identifiers fetched:

| Surface | Total rows observed | eBay-linked / marker matches | Evidence |
|---|---:|---:|---|
| `ebay_deletion_receipts` | 0 | 0 | Private journal count |
| `ebay_account_item_links` | 0 | 0 | Private account-mapping count |
| `ebay_partial_erasure_audit` | 0 | 0 | Private partial-erasure history |
| `offers` and `source_ingestion_items` | not needed for zero-eBay conclusion | 0 each | Exact `sources.connector_key='ebay'` |
| `product_matches` and `price_history` | not needed for zero-eBay conclusion | 0 each | Exact eBay source ID from prior audit |
| `affiliate_conversions` | 0 | 0 | Raw-data/merchant string marker |
| `analytics_events` | 0 | 0 | Properties/page-path string marker |
| `attribution_events` | 0 | 0 | Metadata string marker |
| `audit_logs` | 0 | 0 | Before/after/reason marker |
| `click_events` | 7 | 0 | Metadata/page-path string marker |
| `creative_assets` | 0 | 0 | Asset/image URL marker |
| `feed_import_records` | 122,538 | 0 | Metadata/image URL marker |
| `marketing_assets` | 0 | 0 | Public URL marker |
| `pipeline_events` | 8 | 0 | Data/message string marker |
| `products` | 262 | 0 | Metadata/canonical URL marker |
| `storage.objects` | 0 | 0 | Object name and metadata marker |
| `storage.buckets` | 3 | 0 | Bucket name marker |

Supabase buckets: `awin-bulk-private-snapshots` (private), `marketing-media` (private), and `marketing-media-approved` (public). **Objects listed: zero**, not evidence about previous object versions, S3 multipart/lifecycle artifacts or external media buckets. No object was deleted.

## Repeatable operational check
Versioned SQL migration `supabase/migrations/20261116162000_ebay_privacy_inventory_counts.sql` adds DBA-only `public.ebay_privacy_inventory_counts()`, returning aggregate `surface`, `total_rows`, `ebay_marker_rows`, and `evidence_kind`. It includes all named databases and live storage surfaces above, explicitly distinguishes exact source-linked counts from heuristic `ebay` markers, returns no underlying records, and has no public/anon/authenticated/service-role EXECUTE rights. Run as database owner:

```sql
select * from public.ebay_privacy_inventory_counts() order by surface;
```

Do **not** use marker-count zero as a standalone green light for webhook registration or legal-compliance completion.

## Remaining coverage gaps and accountable next action

1. **Direct eBay identifiers with no textual `ebay` marker:** Full JSON/value review by approved private audit with trusted seller/user account mappings, and evidence of any historical cleanup.
2. **Remote & historical data:** Vercel logs, CDN or API logs, partner/provider records, external media, backups/snapshots, storage historical versions and retention periods cannot be proved by this SQL.
3. **Data lineage:** Existing source, product, editorial, marketing, analytics and affiliate conversion entities may have user-identity references not modelled by `ebay_account_item_links` (which is currently empty). Full legal retention and processor inventory is required.
4. **Operational erasure:** Only DBA-only partial mapped-row purge exists. No automatic idempotent full-store processing, no documented lawful exceptions, no tested retention deadlines, and no completed eBay notifications.
5. **Future ingestion:** Production DB quarantine must stay active until atomic account ownership mapping and suppression across **all** eBay ingestion paths is reviewed and tested.
6. **Provider activation:** No enabled production eBay keyset per last screenshot, no production OAuth/deletion HMAC/challenge environment values, no actual eBay signed-notification E2E, and no approved Browse access. Webhook POST still deliberately 503 and is not registered.

**Awin independence:** The 19-programme rollout and private Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up and tyre feeds remain unchanged. Do not conflate Awin offer staging with eBay deletion work.

## Next-chat resume protocol
Read `docs/AVUQO_ACTIVE_HANDOVER.md`, this audit, `docs/AVUQO_EBAY_AWIN_EXACT_RESUME_2026-11-16.md`, the feature tracker MD+JSON and Awin completion board. Verify the exact production Vercel SHA and Supabase migrations. Every substantive change and failure must update the master handover and related JSON/trackers before handing off.
