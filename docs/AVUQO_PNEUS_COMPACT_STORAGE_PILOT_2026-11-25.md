# Pneus Online compact storage pilot — 25 November 2026

Status: read-only production preflight and proposed shadow architecture; not implemented or deployed. No changes to data, retention, cron, source rights or publication. Production main verified at 2b7f55d708ab91df50692d6c8a056bf3edb19485.

## Why Pneus first

22 completed jobs for Awin 15236:26513 committed 435,189 rows, all excluded from private review eligibility. Last two complete runs contained 19,735 and 19,711 rows, sharing 19,648 exact merchant SKU matches; 87 added and 63 absent. Only 2,180 overlaps agreed on price, currency and title. No assertion of full row equality or valid GBP prices. Existing adapter refuses publication when currency is missing. All 22 jobs have object metadata entries; actual bytes, decompressed SHA-256 and replay have not been independently checked. Private bucket has 30 objects and 356.4 MiB recorded metadata size across suppliers.

## Proposed reusable model (names provisional, no DDL)

- Reuse awin_bulk_import_jobs and immutable private snapshot bucket. Retain exact source scope, parser version, digest basis (Pneus hashes decompressed bytes), authenticated observation time, validation and durable checkpoints.
- Current SKU projection keyed by provider, advertiser, feed and exact merchant SKU; keep variant, GTIN/EAN, price/currency evidence, availability, permissions, content reference and latest complete membership. Never use name similarity or merchant SKU alone across feeds.
- Separate deterministic source-content fingerprint (description, images, attributes, identity) from price/stock/terms observation. Hash a canonical versioned encoding with explicit nulls and exact values; exclude operational timestamps from content hash but retain them as evidence. Verify rights independently of hash. Preserve current snapshot membership even if content is unchanged. Do not infer a price reduction from an unknown currency.
- Compact observation ledger records actual changes and freshness/check receipts; unchanged fields may reference existing content only when provenance and current membership remain provable. Full source is recoverable subject to programme retention rights.
- Shadow build first: do not change existing readers/writers, expiry or permissions. Bounded batches with exclusive lease, idempotent replay, digest verification, invalid/duplicate row refusal. Atomic current pointer only after complete validated snapshot; partial or failed import must not mark unseen SKUs absent.
- Reuse existing snapshot path rules: Pneus uses pneus-online/15236/26513/{sha256}.csv.gz, other Awin helpers use awin/{advertiser}/{feed}/{sha256}.{format}. Do not confuse compressed-byte digest with decompressed-byte digest.

## Release-blocking checks

1. Fetch authorised archived bytes privately; confirm exact digest, complete replay counts, unique SKUs and original source identity. Object metadata alone does not prove recovery.
2. Compare both current and previous full snapshot membership, complete source fields, exact variants and prices (including unknown currency) against legacy private rows; test added, absent, unchanged, revised, invalid and duplicate IDs.
3. Confirm no rights escalation or public offer from quarantined rows. Preserve exact evidence for current shopping approval, renewal, detail, price history, tyres, Watch, conversion, owner reviews, source audit and checkpoints.
4. Audit direct and indirect references: 25 routine text matches and awin_private_product_readiness view found; eBay account item link FK cascades from source_ingestion_items. Text matches are a lower bound, not a proof of safe deletion. Include TypeScript, dynamic SQL, policies, triggers, audit/erasure and external jobs.
5. Rehearse concurrency, stale lease, interrupted import, revoked permission, byte mismatch, failed restore, and rollback on isolated fixtures; compare storage, worker throughput and query latency; no production retention until explicit reviewed acceptance.
6. After tested parity and approved policy, classify superseded payloads for archival. Never delete rows merely because a snapshot exists. No VACUUM FULL or index removal in this pilot. Preserve eBay deletion obligations separately; private archival is not an exemption.

## Reproducible read-only preflight

Run statements separately against the correct project with bounded statement timeout; no write operations. The following SELECTs were executed individually against production, not as a packaged script. Run before and after pilot.

```sql
select advertiser_id, feed_id, state, count(*) as jobs,
 sum(validated_total) as validated_rows, sum(committed_rows) as committed_rows
from public.awin_bulk_import_jobs
group by 1,2,3;

select r.created_at,r.total_count,r.status,r.review_count,r.excluded_count,
 j.state as job_state,(o.id is not null) as object_metadata_present
from public.feed_import_runs r
left join public.awin_bulk_import_jobs j on j.private_import_id=r.id
left join storage.objects o on o.bucket_id='awin-bulk-private-snapshots'
 and o.name=j.snapshot_object_key
where r.merchant_id='15236'
order by r.created_at desc limit 25;

with runs as materialized (
 select id, row_number() over(order by created_at desc,id) rn
 from public.feed_import_runs
 where merchant_id='15236' and status='private_review'
 order by created_at desc,id limit 2
), a as materialized (
 select merchant_product_id,price,currency,title
 from public.feed_import_records where import_id=(select id from runs where rn=1)
), b as materialized (
 select merchant_product_id,price,currency,title
 from public.feed_import_records where import_id=(select id from runs where rn=2)
)
select (select count(*) from a) latest_rows,
 (select count(*) from b) previous_rows,
 count(*) filter(where a.merchant_product_id is not null and b.merchant_product_id is not null) overlapping_skus,
 count(*) filter(where a.merchant_product_id is not null and b.merchant_product_id is null) added_skus,
 count(*) filter(where a.merchant_product_id is null and b.merchant_product_id is not null) absent_skus,
 count(*) filter(where a.merchant_product_id is not null and b.merchant_product_id is not null
 and (a.price,a.currency,a.title) is not distinct from (b.price,b.currency,b.title)) unchanged_price_currency_title
from a full join b using(merchant_product_id);
```

Overlap query assumes unique non-null SKU per snapshot (existing worker validates); verify uniqueness before using as acceptance evidence for future feeds. No exact overall savings quantified. Autovacuum defaults currently 50 + 0.2 scale factor; audit workload before tuning. Keep all existing indexes pending benchmark.

Next implementation: isolated shadow projection and replay tests against authorised data with no production cutover.

## Offline replay candidate

- Added an isolated offline gzip replay and compact hash projection for exact Awin 15236:26513, reusing the existing CSV parser and private tyre adapter. Verify decompressed SHA-256 and complete count, reject duplicate/cross-advertiser SKUs, separate content/terms/stock changes and reconstruct normalized private rows. Missing currency remains excluded; no publication path. Seven synthetic tests authored and added to quality CI, execution pending. No production worker, DB, retention, permissions or branch changes; actual archived bytes and legacy parity remain unverified. Next: authorised replay and durable shadow projection before any cutover.


## 25 November 2026 | Private snapshot recovery and infrastructure cost candidate

- Prior b3970188 Vercel READY, build and native PostgreSQL passed; lint stopped on outdated portfolio rotation source assertion, skipping shadow tests. Reconciled assertions with durable attempt journal and gated canonical release; independent recovery/rotation CI job added, results pending.
- Owner-only same-origin POST for latest or previous completed Pneus 15236:26513 snapshot; fixed journal/object binding, current source permission and global controls, decompressed digest and count checks, bounded normalized row parity with only decimal transport normalization. Returns aggregate counts only; no writes, publication, schedule or retention changes. Actual authenticated replay still pending; historic adapter drift must fail parity.
- Dated infrastructure audit: database 1,825.2 MiB, private/object metadata size 356.4 MiB, 85,002 products and 13,450 active offer records (not public counts), Supabase Pro confirmed, 24 configured cron entries. Added owner register Infrastructure & Cost Intelligence section and future usage/cost alert requirements (70/85/95%); actual billing, provisioned disk, transfer, and Vercel plan unverified. No plan upgrade or new branches.


## 25 November 2026 | Compact pooled catalogue ledger candidate

- Prior 532b55bf production READY, independent recovery/rotation tests, app build and native PostgreSQL passed. Full lint stopped at old Cadbury assertion expecting currency literal in worker; actual normalizer/provenance tests now verify inferred currency stays explicitly unverified/private before separate gates. No importer behavior change.
- Read-only comparison of latest two complete Pneus imports (08:46 GMT 25 Nov / 19:46 GMT 24 Nov): 19,735/19,711 rows, 19,648 overlap; 19,645 equal normalized content fingerprints, 2,179 equal commercial fingerprints, 2,179 both equal. SQL MD5 is an audit proxy, not archive integrity or exact recoverable disk measurement. New offline two-snapshot pooled ledger JSON round-trip retains per-snapshot membership, source timestamp, exact normalized content and observations; corruption and duplicate-key tests. CI pending.
- Owner register and six handovers updated. Actual owner-authorized snapshot byte replay remains unverified. No migration, live storage changes, retention, publication, cron or new branches. Persistent transaction/lease and safe restore acceptance remain outstanding.


## 25 November 2026 | Private compact database foundation installed (13:32 GMT)

- Exact rehearsed SQL recovered from Git blob 252b01eafb3037057bbacc067877bf70a13ea691. Supabase migration 20261125133220_avuqo_compact_shadow_foundation applied successfully. Reversible pre-install and post-install fixtures passed. Four empty tables in avuqo_compact_shadow, RLS enabled on all, schema usage and membership SELECT denied to anon, authenticated and service_role. Advisor flags intentional RLS without policies; keep dormant. Structural seal is not digest verification or permission to retain/delete legacy evidence.
- Live database contents 1,889.7 MiB, 85,022 products and 14,010 active offer records at 13:32:36 GMT (not public counts); new empty foundation 196,608 bytes. No actual supplier payloads copied, no existing data deleted, no public reader, worker or retention changes.
- Previous 4a288e3c application build, compact tests and native PostgreSQL passed; full lint still fails at historical three-branch retirement proof. Do not remove branch safety checks. Next: authenticated archive recovery and parity, restricted transactional writer and lease/concurrency rehearsal, then measured incremental imports; all supplier scope remains mandatory.


## 25 November 2026 | Dormant compact transaction guard installed (13:42 GMT)

- Migration 20261125134246_avuqo_compact_shadow_transaction_guard applied; pre/post reversible synthetic rehearsal passed. Deferred commit trigger rejects unsealed snapshots, SHA-256 payload pooling reuses identical input, private rights and exact source journal binding functions installed, digest-scoped transaction advisory lock. No API role execute grants. Concurrency lock behavior and full rights gate not independently exercised by the fixture. All four shadow tables empty; no live data copied, deleted, or publication changed.
- Latest live measurement: 1,898.6 MiB database, 85,033 product records, 14,117 active offer records at 13:42:57 GMT. Not confirmed public counts. Prior a412e102 Vercel READY, app build and compact tests passed; historical branch retirement check still failed. No new branches or plan change.
- Remaining: exact normalized batch append/seal, caller-side canonical replay and actual archive bytes/legacy parity, concurrent and rights-revocation tests, restricted integration, measured storage benefits before any retention. The database gate only validates journal metadata, not actual archive bytes.


## 25 November 2026 | Dormant exact compact batch writer installed (13:55 GMT)

- Migration 20261125135527_avuqo_compact_shadow_batch_writer applied; pre/post helper rehearsal passed exact normalized row reconstruction, inferred currency and release flag rejection, missing legacy identity and no API execution grants. Bounded 250-row append and final parity seal installed, not yet exercised end-to-end. All four shadow tables empty. No live supplier copy, retention, worker or publication changes.
- Live database contents 1,933.3 MiB, 85,033 products, 14,225 active offer records at 13:55:37 GMT; not confirmed public counts. Prior e2c8ea8a production READY, build and dedicated compact tests passed; historical branch-retirement regression outstanding.
- Next: actual archive-byte replay, canonical batch export, full rollback-only writer rehearsal and concurrency/rights tests, restricted production integration, measured storage savings before any retention. No new branches or hosting upgrades.


## 25 November 2026 | Full legacy transaction rehearsal passed; scheduled archive recovery candidate

- Full 19,735-row latest Pneus legacy database rehearsal passed begin, bounded append, mismatch rejection, seal and complete rollback; all shadow tables remain empty. This replay used normalized legacy rows, not compressed source bytes or canonical JS serialization. Physical DB contents reached 2,006.4 MiB at 14:04 GMT after rehearsal (85,033 products / 14,265 active offer records, not public counts); allocation growth is not savings. Do not repeat full production rehearsals unnecessarily.
- Shared read-only fixed-scope archive verifier now used by existing owner POST and daily 14:23 UTC server cron candidate (25th cron entry). Existing CRON_SECRET, automatic importer flag, current source rights, emergency stop and exact journal/digest checks; aggregate runtime diagnostics only, no database writes, no upstream fetch, no retention. One latest archive per invocation; no durable lease or result journal yet. Deployment/test and actual archive parity pending. Prior f1e1c880 READY; compact/app build passed; historical branch proof failure remains.
- No existing records deleted, no production storage cutover, no publication, no new branches. Next: review actual runtime audit, durable journal/lease, canonical batch integration and concurrency, then measured incremental storage and full supplier scope.


## 25 November 2026 | Canonical writer transport and historical proof maintenance

- Prior 0575ec46 production READY; dedicated compact, application build and native PostgreSQL passed. First 14:23 UTC scheduled archive audit not due at 14:17; no runtime result yet. Pure canonical replay-to-SQL transport now checks payload hashes and SKU/timestamp shape, limits batches to 250 rows and 4 MiB, individual payload 256 KiB. Offline test covers exact SHA-256 domain and batch boundary. No live writer connection, no retention.
- Historical retirement regression traced to changed lib/connectors/awin.ts (frozen b04751fd -> current 0e55b809). Reviewed diff: stricter explicit GBP, positive price and exact identity, bounded read, redirect rejection and safe numeric-only upstream errors. Preserve exact frozen blob in docs/evidence; test current safety separately. Actual retirement workflow and frozen allowed refs unchanged; it still refuses deletion on changed current-main proof. All three ref lookups returned 404; no branch changes made. CI pending.
- All six handover files and owner register updated. Next: inspect actual archived-file verification logs, durable journal and restricted transaction integration. No database writes or public shopping changes.

