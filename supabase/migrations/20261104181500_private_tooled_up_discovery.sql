-- Owner-only private catalogue discovery. SECURITY INVOKER preserves feed import RLS.
-- Both RPCs read staged product rows only; no public offers or image rights.
create index if not exists feed_import_records_large_brand_idx
 on public.feed_import_records(import_id,brand) where status='review';
create index if not exists feed_import_records_large_department_idx
 on public.feed_import_records(import_id,(split_part(metadata->>'merchant_category_path',' > ',1))) where status='review';

create or replace function public.private_tooled_up_facets(p_import_id uuid)
 returns jsonb language sql stable security invoker set search_path=''
as $$
 with permitted as (
  select r.brand,split_part(r.metadata->>'merchant_category_path',' > ',1) as department
  from public.feed_import_records r join public.feed_import_runs f on f.id=r.import_id
  where r.import_id=p_import_id and r.status='review'
    and f.merchant_id='496' and f.status='private_review'
 ),
 brand_counts as (
  select brand,count(*) n from permitted where nullif(btrim(brand),'') is not null group by brand
 ),
 dept_counts as (
  select department,count(*) n from permitted where nullif(btrim(department),'') is not null group by department
 )
 select jsonb_build_object(
  'brands',coalesce((select jsonb_agg(jsonb_build_object('value',brand,'count',n) order by n desc,brand) from brand_counts),'[]'::jsonb),
  'departments',coalesce((select jsonb_agg(jsonb_build_object('value',department,'count',n) order by n desc,department) from dept_counts),'[]'::jsonb),
  'count',(select count(*) from permitted))
$$;
revoke all on function public.private_tooled_up_facets(uuid) from public,anon;
grant execute on function public.private_tooled_up_facets(uuid) to authenticated;

create or replace function public.private_tooled_up_search(
 p_import_id uuid,
 p_brand text default null,
 p_department text default null,
 p_query text default null,
 p_sort text default 'name',
 p_page integer default 1
) returns table (
 id uuid,title text,brand text,category text,price numeric,currency text,
 image_url text,merchant_product_id text,category_path text,availability text,
 model text,ean text,matching_total bigint
) language sql stable security invoker set search_path=''
as $$
 with permitted as (
  select r.id,r.title,r.brand,r.category,r.price,r.currency,r.image_url,
   r.merchant_product_id,r.metadata->>'merchant_category_path' category_path,
   r.metadata->>'availability' availability,r.metadata->>'model' model,
   r.metadata->>'ean' ean
  from public.feed_import_records r
  join public.feed_import_runs f on f.id=r.import_id
  where r.import_id=p_import_id and r.status='review'
    and f.merchant_id='496' and f.status='private_review'
    and (nullif(p_brand,'') is null or r.brand=p_brand)
    and (nullif(p_department,'') is null or split_part(r.metadata->>'merchant_category_path',' > ',1)=p_department)
    and (nullif(p_query,'') is null
       or position(lower(left(p_query,80)) in lower(r.title))>0
       or position(lower(left(p_query,80)) in lower(r.merchant_product_id))>0
       or position(lower(left(p_query,80)) in lower(coalesce(r.metadata->>'ean','')))>0)

 )
 select permitted.*,count(*) over() as matching_total
 from permitted
 order by
  case when p_sort='price_asc' then permitted.price end asc nulls last,
  case when p_sort='price_desc' then permitted.price end desc nulls last,
  case when p_sort='brand' then permitted.brand end asc nulls last,
  permitted.title asc,permitted.id asc
 limit 48 offset (greatest(1,least(coalesce(p_page,1),5000))-1)*48
$$;
revoke all on function public.private_tooled_up_search(uuid,text,text,text,text,integer) from public,anon;
grant execute on function public.private_tooled_up_search(uuid,text,text,text,text,integer) to authenticated;
