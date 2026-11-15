-- Service-role-only, idempotent private Petlibro catalogue reconciliation.
-- This migration does NOT grant rights, approve review records, enable any
-- merchant, publish prices, or insert into offers/published_deals.
CREATE OR REPLACE FUNCTION public.reconcile_petlibro_private_candidates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $private_petlibro$
DECLARE
 v_source_id uuid;
 v_source_count integer;
 v_run record;
 v_row_count integer;
 v_group_count integer;
 v_bad_groups integer;
 v_product_id uuid;
 v_found integer;
 v_status text;
 v_existing_key text;
 v_source_offer_id text;
 v_old_product_id uuid;
 v_inserted_id uuid;
 v_new_products integer := 0;
 v_new_matches integer := 0;
 v_existing_products integer := 0;
 v_existing_matches integer := 0;
 v_gtin_collisions integer;
 v_sku record;
 v_item record;
 v_slug text;
 v_key text;
BEGIN
 -- Reject concurrent invocations so there can never be two insertors for
 -- one stable SKU identity. If busy, the next cron run can retry safely.
 IF NOT pg_try_advisory_xact_lock(77952, 103580) THEN
  RETURN jsonb_build_object('status','already_running','private_only',true);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.system_controls
              WHERE control_key='source_ingestion' AND enabled=true)
    OR NOT EXISTS(SELECT 1 FROM public.system_controls
              WHERE control_key='global_emergency_stop' AND enabled=false) THEN
   RAISE EXCEPTION 'Private Petlibro reconciliation blocked by global stop or ingestion controls';
 END IF;
 SELECT count(*),min(id::text)::uuid INTO v_source_count,v_source_id
 FROM public.sources
 WHERE connector_key='awin' AND status='paused' AND sync_enabled=false;
 IF v_source_count<>1 THEN
   RAISE EXCEPTION 'Petlibro private reconciliation requires one paused Awin source';
 END IF;
 IF NOT EXISTS(
  SELECT 1 FROM public.sources s, jsonb_array_elements(coalesce(s.metadata->'awin_advertisers','[]'::jsonb)) a
  WHERE s.id=v_source_id AND a->>'advertiser_id'='77952'
    AND a->>'joined_programme_observed'='true'
 ) THEN
   RAISE EXCEPTION 'Joined Petlibro programme observation absent';
 END IF;

 -- Examine the NEWEST auto snapshot, even if it is still importing.
 -- Never silently fall back to an older successful price snapshot.
 SELECT id,merchant_id,filename,status,permission_status,total_count,review_count,excluded_count
 INTO v_run FROM public.feed_import_runs
 WHERE merchant_id='77952' AND filename LIKE 'GENAWIN__103580__AUTO__%'
 ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN
   RETURN jsonb_build_object('status','no_auto_snapshot','private_only',true);
 END IF;
 IF v_run.status<>'private_review' OR v_run.permission_status<>'unverified'
    OR v_run.total_count IS NULL OR v_run.total_count<1 OR v_run.total_count>500
    OR v_run.excluded_count<>0 OR v_run.review_count<>v_run.total_count THEN
   RAISE EXCEPTION 'Newest Petlibro snapshot is not complete, unverified and privately reviewable';
 END IF;
 SELECT count(*) INTO v_row_count FROM public.feed_import_records r WHERE r.import_id=v_run.id;
 IF v_row_count<>v_run.total_count THEN
   RAISE EXCEPTION 'Petlibro snapshot count mismatch';
 END IF;

 WITH pairs AS (
  SELECT regexp_replace(r.merchant_product_id,'_(feed|health)$','') AS sku,
   count(*) AS rows,
   count(*) FILTER (WHERE right(r.merchant_product_id,5)='_feed') AS feed_rows,
   count(*) FILTER (WHERE right(r.merchant_product_id,7)='_health') AS health_rows,
   count(distinct r.title) AS titles,
   count(distinct r.price) AS prices,
   count(distinct r.currency) AS currencies,
   count(distinct r.brand) AS brands,
   count(distinct r.metadata->>'gtin') AS gtins,
   count(distinct r.metadata->>'model') AS models,
   bool_and(r.price>0 AND r.currency='GBP' AND r.status='review'
     AND r.review_decision IN ('pending','checked')
     AND r.metadata->>'tracking_link_verified'='true'
     AND length(btrim(r.title))>2 AND length(btrim(r.merchant_product_id))>7
     AND length(btrim(coalesce(r.metadata->>'gtin','')))>5) AS valid
  FROM public.feed_import_records r
  WHERE r.import_id=v_run.id
  GROUP BY 1
 )
 SELECT count(*)::integer,
  count(*) FILTER (WHERE sku IS NULL OR length(btrim(sku))=0 OR
   rows<>2 OR feed_rows<>1 OR health_rows<>1
   OR titles<>1 OR prices<>1 OR currencies<>1 OR brands<>1 OR gtins<>1
   OR models>1 OR valid IS DISTINCT FROM true)::integer
 INTO v_group_count,v_bad_groups
 FROM pairs;
 IF v_bad_groups>0 OR v_group_count*2<>v_row_count THEN
   RAISE EXCEPTION 'Petlibro private product identity pairing is ambiguous';
 END IF;

 -- Record barcode collisions for diagnostics only; GTIN must never merge
 -- distinct supplier SKUs. Bundle and standalone GTINs can overlap.
 WITH groups AS (
  SELECT regexp_replace(merchant_product_id,'_(feed|health)$','') AS sku,
    max(metadata->>'gtin') AS gtin
  FROM public.feed_import_records WHERE import_id=v_run.id GROUP BY 1
 ), duplicates AS (
  SELECT gtin FROM groups GROUP BY gtin HAVING count(*)>1
 )
 SELECT count(*)::integer INTO v_gtin_collisions FROM duplicates;

 FOR v_sku IN
  SELECT regexp_replace(merchant_product_id,'_(feed|health)$','') AS sku,
   max(title) AS title,max(metadata->>'gtin') AS gtin
  FROM public.feed_import_records
  WHERE import_id=v_run.id
  GROUP BY 1 ORDER BY 1
 LOOP
   -- Include the complete supplier SKU in canonical_key, not the GTIN.
   -- The SKU may contain spaces, '&' and '*', so never derive it from
   -- a prettified slug.
   v_key:='awin:77952:103580:'||v_sku.sku;
   SELECT count(*),min(id::text)::uuid INTO v_found,v_product_id
   FROM public.products WHERE canonical_key=v_key;
   IF v_found>1 THEN RAISE EXCEPTION 'Duplicate canonical Petlibro key'; END IF;
   IF v_found=0 THEN
     SELECT count(*),min(id::text)::uuid INTO v_found,v_product_id
     FROM public.products
     WHERE status='draft' AND lower(brand)='petlibro'
       AND lower(canonical_title)=lower(v_sku.title);
     IF v_found>1 THEN
       RAISE EXCEPTION 'Multiple existing draft products share a Petlibro title';
     END IF;
     IF v_found=1 THEN
       SELECT canonical_key INTO v_existing_key
       FROM public.products WHERE id=v_product_id;
       IF v_existing_key IS NOT NULL AND v_existing_key<>v_key THEN
         RAISE EXCEPTION 'Petlibro draft title conflicts with another canonical key';
       END IF;
       UPDATE public.products SET canonical_key=v_key,
         metadata=metadata||jsonb_build_object(
          'petlibro_private_sku',v_sku.sku,
          'petlibro_identity_source','awin:77952:103580',
          'publication_authorised',false)
       WHERE id=v_product_id AND status='draft' AND canonical_key IS NULL;
       v_existing_products:=v_existing_products+1;
     ELSE
       v_slug:='petlibro-'||left(trim(both '-' from
         regexp_replace(lower(v_sku.title),'[^a-z0-9]+','-','g')),110)
         ||'-'||left(md5(v_sku.sku),8);
       INSERT INTO public.products
        (slug,canonical_title,brand,status,product_type,
         primary_image_url,canonical_key,metadata)
       VALUES
        (v_slug,v_sku.title,'Petlibro','draft','product',
         NULL,v_key,jsonb_build_object(
          'origin','petlibro_private_automatic_candidate',
          'merchant_id','77952','feed_id','103580',
          'supplier_sku',v_sku.sku,'source_import_id',v_run.id,
          'source_price_state','not_approved_for_public_use',
          'image_rights','not_automatically_attested',
          'publication_authorised',false))
       RETURNING id INTO v_product_id;
       v_new_products:=v_new_products+1;
     END IF;
   ELSE
     SELECT status INTO v_status FROM public.products WHERE id=v_product_id;
     IF v_status<>'draft' THEN
       RAISE EXCEPTION 'Existing Petlibro canonical product requires human review';
     END IF;
     v_existing_products:=v_existing_products+1;
   END IF;
   -- Two source records per private product identity. Existing mappings
   -- remain unchanged; never downgrade an owner-approved match.
   FOR v_item IN
     SELECT merchant_product_id,id
     FROM public.feed_import_records
     WHERE import_id=v_run.id
       AND regexp_replace(merchant_product_id,'_(feed|health)$','')=v_sku.sku
   LOOP
     v_source_offer_id:='77952:103580:'||v_item.merchant_product_id;
     v_inserted_id:=NULL;
     INSERT INTO public.product_matches
       (source_id,source_offer_id,product_id,match_method,confidence,status,evidence)
     VALUES
       (v_source_id,v_source_offer_id,v_product_id,'private_supplier_sku_pair',
        85,'candidate',jsonb_build_object(
          'source_import_id',v_run.id,'source_row_id',v_item.id,
          'supplier_sku',v_sku.sku,
          'review_required',true,'publication_authorised',false,
          'feed_timestamp_validated',false))
     ON CONFLICT (source_id,source_offer_id) DO NOTHING
     RETURNING id INTO v_inserted_id;
     IF v_inserted_id IS NULL THEN
       SELECT product_id INTO v_old_product_id
       FROM public.product_matches
       WHERE source_id=v_source_id AND source_offer_id=v_source_offer_id;
       IF v_old_product_id IS DISTINCT FROM v_product_id THEN
         RAISE EXCEPTION 'Existing Petlibro SKU is linked to a different product';
       END IF;
       v_existing_matches:=v_existing_matches+1;
     ELSE
       v_new_matches:=v_new_matches+1;
     END IF;
   END LOOP;
 END LOOP;
 RETURN jsonb_build_object(
  'status','private_candidates_reconciled','private_only',true,
  'no_publication',true,'source_import_id',v_run.id,
  'source_rows',v_row_count,'logical_products',v_group_count,
  'reused_products',v_existing_products,'new_draft_products',v_new_products,
  'existing_source_links',v_existing_matches,
  'new_candidate_links',v_new_matches,
  'duplicate_gtin_values_for_review',v_gtin_collisions);
END;
$private_petlibro$;

-- This is a service-role-only RPC, not a public publication endpoint.
REVOKE ALL ON FUNCTION public.reconcile_petlibro_private_candidates()
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_petlibro_private_candidates()
 TO service_role;
