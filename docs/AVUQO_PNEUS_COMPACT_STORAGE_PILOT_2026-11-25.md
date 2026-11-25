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
