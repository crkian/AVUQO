-- Read-only eBay privacy inventory report for DBA review.
-- This report is a heuristic: zero eBay markers does NOT prove zero retained
-- eBay user identifiers, complete deletion, remote erasure or backup coverage.
-- No raw user or account data is returned.
create function public.ebay_privacy_inventory_counts()
returns table(surface text, total_rows bigint, ebay_marker_rows bigint, evidence_kind text)
language sql stable security definer set search_path = ''
as $$
 select 'ebay_deletion_receipts'::text, count(*)::bigint,count(*)::bigint,'private receipt count'::text from public.ebay_deletion_receipts
 union all
 select 'ebay_account_item_links',count(*),count(*),'private account-linked rows' from public.ebay_account_item_links
 union all
 select 'ebay_partial_erasure_audit',count(*),count(*),'partial erasure audit' from public.ebay_partial_erasure_audit
 union all
 select 'offers',count(*),count(*) filter (where s.connector_key='ebay'),'exact source id' from public.offers o left join public.sources s on s.id=o.source_id
 union all
 select 'source_ingestion_items',count(*),count(*) filter (where s.connector_key='ebay'),'exact source id' from public.source_ingestion_items i left join public.sources s on s.id=i.source_id
 union all
 select 'product_matches',count(*),count(*) filter (where s.connector_key='ebay'),'exact source id' from public.product_matches m left join public.sources s on s.id=m.source_id
 union all
 select 'price_history',count(*),count(*) filter (where s.connector_key='ebay'),'exact source id' from public.price_history h left join public.sources s on s.id=h.source_id
 union all
 select 'analytics_events',count(*),count(*) filter (where properties::text ilike '%ebay%' or page_path ilike '%ebay%'),'text marker heuristic' from public.analytics_events
 union all
 select 'click_events',count(*),count(*) filter (where metadata::text ilike '%ebay%' or page_path ilike '%ebay%'),'text marker heuristic' from public.click_events
 union all
 select 'attribution_events',count(*),count(*) filter (where metadata::text ilike '%ebay%'),'text marker heuristic' from public.attribution_events
 union all
 select 'affiliate_conversions',count(*),count(*) filter (where raw_data::text ilike '%ebay%' or merchant_name ilike '%ebay%'),'text marker heuristic' from public.affiliate_conversions
 union all
 select 'audit_logs',count(*),count(*) filter (where coalesce(before_data::text,'') ilike '%ebay%' or coalesce(after_data::text,'') ilike '%ebay%' or coalesce(reason,'') ilike '%ebay%'),'text marker heuristic' from public.audit_logs
 union all
 select 'products',count(*),count(*) filter (where metadata::text ilike '%ebay%' or coalesce(canonical_url,'') ilike '%ebay%'),'text marker heuristic' from public.products
 union all
 select 'creative_assets',count(*),count(*) filter (where coalesce(asset_url,'') ilike '%ebay%' or coalesce(source_image_url,'') ilike '%ebay%'),'text marker heuristic' from public.creative_assets
 union all
 select 'marketing_assets',count(*),count(*) filter (where coalesce(public_url,'') ilike '%ebay%'),'text marker heuristic' from public.marketing_assets
 union all
 select 'feed_import_records',count(*),count(*) filter (where metadata::text ilike '%ebay%' or coalesce(image_url,'') ilike '%ebay%'),'text marker heuristic' from public.feed_import_records
 union all
 select 'pipeline_events',count(*),count(*) filter (where data::text ilike '%ebay%' or message ilike '%ebay%'),'text marker heuristic' from public.pipeline_events
 union all
 select 'storage.objects',count(*),count(*) filter (where name ilike '%ebay%' or metadata::text ilike '%ebay%'),'storage object marker heuristic' from storage.objects
 union all
 select 'storage.buckets',count(*),count(*) filter (where name ilike '%ebay%'),'bucket naming heuristic' from storage.buckets
$$;
revoke all on function public.ebay_privacy_inventory_counts()
 from public,anon,authenticated,service_role;
comment on function public.ebay_privacy_inventory_counts() is
'Private DBA-only read-only inventory: exact eBay source counts plus heuristic text markers; NEVER proof of complete user-data erasure or external/backup coverage.';
