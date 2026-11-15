-- Strict, service-role-only, idempotent Mozillion handset candidate reconciliation.
-- No rights grants, source activation, offer/price publication or product images.
CREATE OR REPLACE FUNCTION public.reconcile_mozillion_private_handset_candidates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $private_mozillion$
DECLARE
 v_source_id uuid;
 v_source_count integer;
 v_run record;
 v_session record;
 v_row_count integer;
 v_distinct_skus integer;
 v_bad_rows integer;
 v_product_id uuid;
 v_product_count integer;
 v_product record;
 v_source_offer_id text;
 v_old_product_id uuid;
 v_inserted_id uuid;
 v_new_products integer := 0;
 v_reused_products integer := 0;
 v_new_matches integer := 0;
 v_existing_matches integer := 0;
 v_disappeared_from_latest integer := 0;
 v_brand_new integer;
 v_good_as_new integer;
 v_item record;
 v_key text;
 v_slug text;
 v_condition text;
BEGIN
 -- No two runs may insert the same merchant SKU concurrently.
 IF NOT pg_try_advisory_xact_lock(31539,74135) THEN
  RETURN jsonb_build_object('status','already_running','private_only',true);
 END IF;
 IF NOT EXISTS(
   SELECT 1 FROM public.system_controls
   WHERE control_key='source_ingestion' AND enabled=true)
   OR NOT EXISTS(
   SELECT 1 FROM public.system_controls
   WHERE control_key='global_emergency_stop' AND enabled=false) THEN
  RAISE EXCEPTION 'Private Mozillion candidate reconciliation stopped by controls';
 END IF;

 SELECT count(*),min(id::text)::uuid INTO v_source_count,v_source_id
 FROM public.sources
 WHERE connector_key='awin' AND status='paused' AND sync_enabled=false;
 IF v_source_count<>1 THEN
  RAISE EXCEPTION 'Require one paused Awin source before Mozillion reconciliation';
 END IF;
 IF NOT EXISTS(
  SELECT 1 FROM public.sources s,
   jsonb_array_elements(coalesce(s.metadata->'awin_advertisers','[]'::jsonb)) a
  WHERE s.id=v_source_id AND a->>'advertiser_id'='31539'
   AND a->>'joined_programme_observed'='true'
 ) THEN
  RAISE EXCEPTION 'Mozillion joined-membership observation missing';
 END IF;

 -- If a new snapshot is importing or invalid, never fall back to an older one.
 SELECT id,filename,status,permission_status,total_count,review_count,excluded_count
 INTO v_run
 FROM public.feed_import_runs
 WHERE merchant_id='31539' AND filename LIKE 'GENAWIN__74135__AUTO__%'
 ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN
  RETURN jsonb_build_object('status','no_auto_snapshot','private_only',true);
 END IF;
 IF v_run.status<>'private_review' OR v_run.permission_status<>'unverified'
   OR v_run.total_count IS NULL OR v_run.total_count<1 OR v_run.total_count>500
   OR v_run.excluded_count<>0 OR v_run.review_count<>v_run.total_count THEN
  RAISE EXCEPTION 'Newest Mozillion private feed is incomplete or not reviewable';
 END IF;
 SELECT committed_count,completed_at,source_digest
 INTO v_session FROM public.large_feed_import_sessions WHERE import_id=v_run.id;
 IF NOT FOUND OR v_session.completed_at IS NULL
   OR v_session.source_digest IS NULL OR
   v_session.committed_count<>v_run.total_count THEN
  RAISE EXCEPTION 'Newest Mozillion snapshot has no completed digest-matched import session';
 END IF;

 -- All rows must be physical SIM-free handsets, NEVER contracts or eSIMs.
 -- Missing GTIN/MPN is deliberate: only exact merchant SKU identifies a
 -- draft; do not merge different handset grades or retailers by text/GTIN.
 SELECT count(*)::integer,
  count(distinct r.merchant_product_id)::integer,
  count(*) FILTER (WHERE
   (
    r.merchant_id='31539' AND r.status='review'
    AND r.review_decision IN ('pending','checked')
    AND r.price>0 AND r.currency='GBP'
    AND r.merchant_product_id ~ '^[0-9]{1,20}$'
    AND length(btrim(r.title)) BETWEEN 6 AND 180
    AND r.metadata->>'feed_id'='74135'
    AND r.metadata->>'listing_kind'='physical_product'
    AND r.metadata->>'tracking_link_verified'='true'
    AND r.metadata->>'source_currency_explicit'='true'
    AND r.metadata->>'availability'='1'
    AND (
     (r.brand='Apple' AND r.title LIKE 'Apple iPhone %') OR
     (r.brand='Samsung' AND r.title LIKE 'Samsung Galaxy %') OR
     (r.brand='Google' AND r.title LIKE 'Google Pixel %') OR
     (r.brand='TCL' AND r.title LIKE 'TCL %')
    )
    AND (
      (r.title ~* ' Brand New$' AND r.title !~* ' Good as New$') OR
      (r.title ~* ' Good as New$' AND r.title !~* ' Brand New$')
    )
   ) IS NOT TRUE)::integer
 INTO v_row_count,v_distinct_skus,v_bad_rows
 FROM public.feed_import_records r WHERE r.import_id=v_run.id;
 IF v_row_count<>v_run.total_count OR v_distinct_skus<>v_row_count
   OR v_bad_rows>0 THEN
  RAISE EXCEPTION 'Mozillion private inventory has missing, duplicate or non-handset identities';
 END IF;

 SELECT count(*) FILTER (WHERE title ~* ' Brand New$')::integer,
        count(*) FILTER (WHERE title ~* ' Good as New$')::integer
 INTO v_brand_new,v_good_as_new
 FROM public.feed_import_records WHERE import_id=v_run.id;

 FOR v_item IN
  SELECT id,merchant_product_id,title,brand,metadata
  FROM public.feed_import_records WHERE import_id=v_run.id
  ORDER BY merchant_product_id
 LOOP
  v_key:='awin:31539:74135:'||v_item.merchant_product_id;
  v_condition:=CASE WHEN v_item.title ~* ' Brand New$'
   THEN 'brand_new' ELSE 'good_as_new' END;
  SELECT count(*),min(id::text)::uuid INTO v_product_count,v_product_id
  FROM public.products WHERE canonical_key=v_key;
  IF v_product_count>1 THEN
   RAISE EXCEPTION 'Conflicting Mozillion canonical keys';
  END IF;
  IF v_product_count=0 THEN
   v_slug:='mozillion-'||left(trim(both '-' from
      regexp_replace(lower(v_item.title),'[^a-z0-9]+','-','g')),98)
      ||'-'||left(md5(v_item.merchant_product_id),10);
   INSERT INTO public.products(
    slug,canonical_title,brand,product_type,status,
    primary_image_url,canonical_key,metadata)
   VALUES(
    v_slug,v_item.title,v_item.brand,'product','draft',
    NULL,v_key,jsonb_build_object(
      'origin','mozillion_private_handset_auto_candidate',
      'advertiser_id','31539','feed_id','74135',
      'merchant_product_id',v_item.merchant_product_id,
      'merchant_condition',v_condition,
      'source_import_id',v_run.id,
      'cross_retailer_matching','unverified_no_gtin_or_mpn',
      'price_permission','unverified',
      'image_rights','unverified',
      'publication_authorised',false))
   RETURNING id INTO v_product_id;
   v_new_products:=v_new_products+1;
  ELSE
   SELECT status,canonical_title,brand,metadata
   INTO v_product FROM public.products WHERE id=v_product_id;
   IF v_product.status<>'draft' OR
     v_product.canonical_title IS DISTINCT FROM v_item.title OR
     v_product.brand IS DISTINCT FROM v_item.brand OR
     v_product.metadata->>'merchant_condition' IS DISTINCT FROM v_condition OR
     v_product.metadata->>'merchant_product_id' IS DISTINCT FROM v_item.merchant_product_id THEN
    RAISE EXCEPTION 'Mozillion supplier SKU changed title, condition or brand; owner review required';
   END IF;
   v_reused_products:=v_reused_products+1;
  END IF;

  -- Source-offer IDs are merchant and feed scoped. Existing candidate or
  -- approved mappings are NOT modified by this automatic path.
  v_source_offer_id:='31539:74135:'||v_item.merchant_product_id;
  v_inserted_id:=NULL;
  INSERT INTO public.product_matches(
   source_id,source_offer_id,product_id,match_method,confidence,status,evidence)
  VALUES(
   v_source_id,v_source_offer_id,v_product_id,'private_merchant_sku_handset',80,
   'candidate',jsonb_build_object(
    'source_import_id',v_run.id,
    'source_row_id',v_item.id,
    'merchant_product_id',v_item.merchant_product_id,
    'condition',v_condition,
    'cross_retailer_match_approved',false,
    'feed_price_current_verified',false,
    'publication_authorised',false))
  ON CONFLICT (source_id,source_offer_id) DO NOTHING
  RETURNING id INTO v_inserted_id;
  IF v_inserted_id IS NULL THEN
   SELECT product_id INTO v_old_product_id
   FROM public.product_matches
   WHERE source_id=v_source_id AND source_offer_id=v_source_offer_id;
   IF v_old_product_id IS DISTINCT FROM v_product_id THEN
    RAISE EXCEPTION 'Existing Mozillion merchant SKU linked to another product';
   END IF;
   v_existing_matches:=v_existing_matches+1;
  ELSE
   v_new_matches:=v_new_matches+1;
  END IF;
 END LOOP;

 -- Do not remove old drafts or display stale prices. Report products absent
 -- from the newest feed so a future offer-withdrawal worker can act.
 SELECT count(*)::integer INTO v_disappeared_from_latest
 FROM public.product_matches m
 WHERE m.source_id=v_source_id AND m.source_offer_id LIKE '31539:74135:%'
   AND NOT EXISTS(
    SELECT 1 FROM public.feed_import_records r
    WHERE r.import_id=v_run.id
      AND m.source_offer_id='31539:74135:'||r.merchant_product_id
   );
 RETURN jsonb_build_object(
  'status','private_candidates_reconciled','private_only',true,
  'no_publication',true,
  'source_import_id',v_run.id,
  'source_rows',v_row_count,
  'logical_handsets',v_distinct_skus,
  'brand_new_listings',v_brand_new,
  'good_as_new_listings',v_good_as_new,
  'new_draft_products',v_new_products,
  'reused_draft_products',v_reused_products,
  'new_candidate_links',v_new_matches,
  'reused_candidate_links',v_existing_matches,
  'older_supplier_ids_absent_from_latest',v_disappeared_from_latest);
END;
$private_mozillion$;

REVOKE ALL ON FUNCTION public.reconcile_mozillion_private_handset_candidates()
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_mozillion_private_handset_candidates()
 TO service_role;
