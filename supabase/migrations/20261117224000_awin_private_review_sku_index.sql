-- Hot path for 1,500-row Tooled Up exact SKU batch recheck.
-- Prior indexes were (import_id,merchant_product_id) only. The authenticated
-- batch matches advertiser 496 and SKU across historical import runs, causing
-- repeated table scans and PostgREST timeouts under live load.
create index if not exists feed_import_records_merchant_sku_review_idx
 on public.feed_import_records(merchant_id,merchant_product_id)
 where status='review' and reviewed_at is null;
comment on index public.feed_import_records_merchant_sku_review_idx is
 'Accelerates exact authenticated Awin SKU rechecks; no permissions or publication changes.';
