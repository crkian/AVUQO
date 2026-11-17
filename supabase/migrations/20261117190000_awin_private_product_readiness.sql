-- Owner server-only counts for launch readiness; no product data, links or images exposed.
create or replace view public.awin_private_product_readiness
with (security_invoker=true) as
select
 merchant_id as advertiser_id,
 count(*)::bigint as private_rows,
 count(*) filter (where status='review')::bigint as review_rows,
 count(*) filter (where currency='GBP' and price>0)::bigint as gbp_priced_rows,
 count(*) filter (where metadata->>'tracking_link_verified'='true')::bigint as tracking_marked_rows,
 count(*) filter (where nullif(metadata->>'availability','') is not null)::bigint as stock_field_rows,
 count(*) filter (where image_url is not null)::bigint as primary_image_rows,
 count(*) filter (where metadata->>'source_image_rights_confirmed'='true')::bigint as image_rights_marked_rows,
 count(*) filter (where nullif(metadata->>'live_feed_verified_at','') is not null)::bigint as live_rechecked_rows,
 max(created_at) as latest_private_import_at
from public.feed_import_records
group by merchant_id;
revoke all on public.awin_private_product_readiness from public,anon,authenticated;
grant select on public.awin_private_product_readiness to service_role;
