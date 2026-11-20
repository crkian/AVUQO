-- PRIVATE ONLY. This is an owner-facing read-only exact EAN overlap diagnostic.
-- Supplier membership, EAN equality and a private feed import DO NOT authorise
-- public tyre price, GBP currency, vehicle fitment or ranking. No writes occur.
-- Read-only service_role functions; never grant these to Data API public users.

create or replace function public.private_tyre_ean13_check(p_code text)
returns boolean
language sql immutable strict
set search_path = public, pg_temp
as $$
 select case when p_code ~ '^[0-9]{13}$' then
   mod(10-mod((
     substring(p_code,1,1)::int+3*substring(p_code,2,1)::int+
     substring(p_code,3,1)::int+3*substring(p_code,4,1)::int+
     substring(p_code,5,1)::int+3*substring(p_code,6,1)::int+
     substring(p_code,7,1)::int+3*substring(p_code,8,1)::int+
     substring(p_code,9,1)::int+3*substring(p_code,10,1)::int+
     substring(p_code,11,1)::int+3*substring(p_code,12,1)::int
   ),10),10)=substring(p_code,13,1)::int
 else false end;
$$;

create or replace function public.owner_private_tyre_ean_overlap_summary()
returns jsonb
language sql stable
security invoker
set search_path = public, pg_temp
as $$
 with staged as materialized (
  select r.merchant_id,r.merchant_product_id,r.title,r.price,r.currency,
   coalesce(nullif(r.metadata->>'ean',''),nullif(r.metadata->>'gtin','')) as ean,
   r.metadata,r.created_at
  from public.feed_import_records r
  where r.merchant_id in ('12715','15236')
 ),
 valid_rows as (
  select distinct on (merchant_id,ean) merchant_id,ean,title,price,currency,metadata,created_at
  from staged where public.private_tyre_ean13_check(ean)
  order by merchant_id,ean,created_at desc
 ),
 matched as materialized (
  select u.ean,
   u.title uk_title,p.title pneus_title,
   u.currency uk_currency,p.currency pneus_currency,
   (u.price>0 and u.currency='GBP' and u.metadata->>'source_currency_explicit'='true') uk_gbp_proven,
   (p.price>0 and p.currency='GBP' and p.metadata->>'source_currency_explicit'='true') pneus_gbp_proven,
   (u.metadata->>'tyre_specs_verified'='true' and p.metadata->>'tyre_specs_verified'='true') specs_proven
  from valid_rows u join valid_rows p on u.ean=p.ean
  where u.merchant_id='12715' and p.merchant_id='15236'
 ),
 sample as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'ean',ean,'tyres_uk_title',left(uk_title,120),
    'pneus_title',left(pneus_title,120),
    'tyres_uk_explicit_gbp',uk_gbp_proven,
    'pneus_explicit_gbp',pneus_gbp_proven,
    'both_fitment_proven',specs_proven
   ) order by ean),'[]'::jsonb) as sample_rows
  from (select * from matched order by ean limit 8) examples
 )
 select jsonb_build_object(
  'matching_valid_ean13',count(*),
  'currency_qualified_pairs',count(*) filter(where uk_gbp_proven and pneus_gbp_proven),
  'specification_verified_pairs',count(*) filter(where specs_proven),
  'both_currency_and_spec_verified_pairs',count(*) filter(where uk_gbp_proven and pneus_gbp_proven and specs_proven),
  'tyres_uk_staged_rows',(select count(*) from staged where merchant_id='12715'),
  'pneus_staged_rows',(select count(*) from staged where merchant_id='15236'),
  'samples',(select sample_rows from sample),
  'provenance','private_exact_ean13_identifier_candidate_only',
  'public_price_release_authorised',false,
  'requirements','Explicit source GBP, independently verified width/profile/rim/load/speed, stock, fitting/delivery and each merchant public-release permission still required'
 )
 from matched;
$$;

revoke all on function public.private_tyre_ean13_check(text) from public,anon,authenticated;
grant execute on function public.private_tyre_ean13_check(text) to service_role;
revoke all on function public.owner_private_tyre_ean_overlap_summary() from public,anon,authenticated;
grant execute on function public.owner_private_tyre_ean_overlap_summary() to service_role;
