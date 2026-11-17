-- AVUQO same-day affiliate catalogue release readiness (READ ONLY)
-- 2026-11-17. Aggregate data only. This script must NOT activate sources,
-- modify approval statuses, materialise offers, or treat demo content as live.
-- Run from a privileged read-only SQL context. No direct personal records.
with imported as (
  select r.id,r.merchant_name,r.permission_status,r.status,
    (select count(*) from public.feed_import_records f where f.import_id=r.id) staged_rows,
    (select count(*) from public.feed_import_records f where f.import_id=r.id and f.status='review') review_rows,
    (select count(*) from public.feed_import_records f where f.import_id=r.id and f.status='excluded') excluded_rows
  from public.feed_import_runs r
), merchant_summary as (
 select merchant_name, count(*) runs, sum(staged_rows) staged_rows,
 sum(review_rows) review_rows,sum(excluded_rows) excluded_rows,
 bool_and(permission_status='verified') as all_import_permissions_verified,
 string_agg(distinct permission_status,', ' order by permission_status) as permission_states
 from imported group by merchant_name
)
select merchant_name,runs,staged_rows,review_rows,excluded_rows,
 permission_states,
 case when not all_import_permissions_verified then 'BLOCK_IMPORT_RIGHTS_UNVERIFIED'
      else 'VERIFY_PRODUCT_LEVEL_RIGHTS_FRESHNESS_AND_OWNER_RELEASE'
 end as public_release_gate
from merchant_summary order by staged_rows desc;

-- Every approved-to-publish offer must have an independently validated merchant
-- programme, price and identity, and an explicit owner release. Counts here
-- are diagnostic, NOT approval decisions.
select coalesce(s.connector_key,'unmapped') source,
 o.status,count(*) offer_rows,
 count(*) filter(where o.affiliate_url is not null and o.affiliate_url<>'') with_affiliate_url,
 count(*) filter(where o.last_seen_at >= now()-interval '7 days') observed_last_7d,
 count(*) filter(where r.status='approved') owner_approved_reviews,
 count(*) filter(where p.status='active') active_products
from public.offers o
left join public.sources s on s.id=o.source_id
left join public.products p on p.id=o.product_id
left join public.awin_offer_release_reviews r on r.offer_id=o.id
group by 1,2 order by 1,2;

select connector_key,status,sync_enabled,credential_status,health_status
from public.sources
where connector_key in ('awin','ebay') order by connector_key;

select provider,status,count(*) programmes
from public.affiliate_programs
group by provider,status order by provider,status;

-- Publication GO requires separately evidenced merchant/product rights,
-- working authorised link, non-stale price, exact identity, owner approval,
-- and safe public presentation. It cannot be inferred from these aggregate
-- queries alone. eBay privacy release has an independent HARD NO-GO.
