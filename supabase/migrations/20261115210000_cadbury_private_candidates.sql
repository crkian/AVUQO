-- Only newest validated Cadbury 736:48599 Awin physical-item snapshot is eligible.
-- Historical owner-uploaded rows and unverified feed prices NEVER become live.
CREATE OR REPLACE FUNCTION public.reconcile_cadbury_private_candidates()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public
AS $cadbury$
DECLARE
 v_source_id uuid;
 v_count integer;
 v_run record;
 v_session record;
 v_rows integer;
 v_unique_skus integer;
 v_invalid integer;
 v_new integer:=0;
 v_existing integer:=0;
 v_new_links integer:=0;
 v_existing_links integer:=0;
 v_product_id uuid;
 v_product_count integer;
 v_prior record;
 v_inserted uuid;
 v_link_product uuid;
 v_item record;
 v_key text;
 v_slug text;
BEGIN
 IF NOT pg_try_advisory_xact_lock(736,48599) THEN
   RETURN jsonb_build_object('status','already_running','private_only',true);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.system_controls
               WHERE control_key='source_ingestion' AND enabled=true)
    OR NOT EXISTS(SELECT 1 FROM public.system_controls
                  WHERE control_key='global_emergency_stop' AND enabled=false) THEN
   RAISE EXCEPTION 'Cadbury candidate reconciliation stopped by source controls';
 END IF;
 SELECT count(*),min(id::text)::uuid INTO v_count,v_source_id
 FROM public.sources WHERE connector_key='awin'
   AND status='paused' AND sync_enabled=false;
 IF v_count<>1 THEN RAISE EXCEPTION 'Expected one paused Awin source'; END IF;
 IF NOT EXISTS(
   SELECT 1 FROM public.sources s,
    jsonb_array_elements(coalesce(s.metadata->'awin_advertisers','[]'::jsonb)) j
   WHERE s.id=v_source_id AND j->>'advertiser_id'='736'
     AND j->>'joined_programme_observed'='true'
 ) THEN RAISE EXCEPTION 'Cadbury joined-programme observation missing'; END IF;

 -- Do not use the earlier 1,367-row manually uploaded snapshot: it lacks
 -- source tracking/currency/stock evidence and isn't an AUTO import.
 SELECT id,filename,status,permission_status,total_count,review_count,excluded_count
 INTO v_run FROM public.feed_import_runs
 WHERE merchant_id='736' AND filename LIKE 'GENAWIN__48599__AUTO__%'
 ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN RETURN jsonb_build_object(
   'status','no_validated_auto_snapshot','private_only',true,
   'no_publication',true);
 END IF;
 IF v_run.status<>'private_review'
   OR v_run.permission_status<>'unverified'
   OR v_run.total_count IS NULL OR v_run.total_count<1 OR v_run.total_count>2500
   OR v_run.review_count<>v_run.total_count OR v_run.excluded_count<>0 THEN
   RAISE EXCEPTION 'Newest Cadbury auto import is incomplete or unsupported';
 END IF;
 SELECT committed_count,completed_at,source_digest
 INTO v_session FROM public.large_feed_import_sessions
 WHERE import_id=v_run.id;
 IF NOT FOUND OR v_session.completed_at IS NULL
   OR v_session.source_digest IS NULL
   OR v_session.committed_count<>v_run.total_count THEN
   RAISE EXCEPTION 'Cadbury import session is incomplete';
 END IF;

 -- Supplier's ID is the sole stable identity. Never merge multi-packs,
 -- individual bars, hamper sizes or variants by title or barcode.
 SELECT count(*)::integer,count(distinct merchant_product_id)::integer,
        count(*) FILTER (WHERE NOT (
          r.merchant_id='736'
          AND r.status='review'
          AND r.review_decision IN ('pending','checked')
          AND r.price>0 AND r.currency='GBP'
          AND length(btrim(r.merchant_product_id)) BETWEEN 2 AND 120
          AND length(btrim(r.title)) BETWEEN 5 AND 220
          AND r.metadata->>'feed_id'='48599'
          AND r.metadata->>'listing_kind'='physical_product'
          AND r.metadata->>'tracking_link_verified'='true'
          AND r.metadata->>'source_currency_explicit'='true'
          AND r.metadata->>'availability' IN ('in_stock','1','available')
        ) IS NOT TRUE)::integer
 INTO v_rows,v_unique_skus,v_invalid
 FROM public.feed_import_records r WHERE r.import_id=v_run.id;
 IF v_rows<>v_run.total_count OR v_unique_skus<>v_rows OR v_invalid>0 THEN
   RAISE EXCEPTION 'Cadbury supplier identities, stock, GBP or tracking failed';
 END IF;

 FOR v_item IN SELECT id,merchant_product_id,title
  FROM public.feed_import_records
  WHERE import_id=v_run.id ORDER BY merchant_product_id
 LOOP
   v_key:='awin:736:48599:'||v_item.merchant_product_id;
   SELECT count(*),min(id::text)::uuid INTO v_product_count,v_product_id
   FROM public.products WHERE canonical_key=v_key;
   IF v_product_count>1 THEN RAISE EXCEPTION 'Ambiguous Cadbury canonical identity'; END IF;
   IF v_product_count=0 THEN
     v_slug:='cadbury-gifts-'||left(trim(both '-' from
       regexp_replace(lower(v_item.title),'[^a-z0-9]+','-','g')),100)
       ||'-'||left(md5(v_item.merchant_product_id),10);
     INSERT INTO public.products(
       slug,canonical_title,brand,status,product_type,
       primary_image_url,canonical_key,metadata)
     VALUES(
       v_slug,v_item.title,NULL,'draft','product',
       NULL,v_key,jsonb_build_object(
        'origin','cadbury_private_auto_candidate',
        'merchant_id','736','feed_id','48599',
        'merchant_product_id',v_item.merchant_product_id,
        'source_import_id',v_run.id,
        'price_evidence','private_snapshot_not_public',
        'image_rights','not_attested',
        'category_classification','review_required',
        'sale_category_commission_eligible','unverified_excluded_when_sale',
        'publication_authorised',false))
     RETURNING id INTO v_product_id;
     v_new:=v_new+1;
   ELSE
     SELECT status,canonical_title,metadata INTO v_prior
     FROM public.products WHERE id=v_product_id;
     IF v_prior.status<>'draft' OR
       v_prior.canonical_title IS DISTINCT FROM v_item.title OR
       v_prior.metadata->>'merchant_product_id' IS DISTINCT FROM v_item.merchant_product_id THEN
       RAISE EXCEPTION 'Cadbury product title or source identity changed; manual review';
     END IF;
     v_existing:=v_existing+1;
   END IF;
   v_inserted:=NULL;
   INSERT INTO public.product_matches(
    source_id,source_offer_id,product_id,match_method,confidence,status,evidence)
   VALUES(
    v_source_id,'736:48599:'||v_item.merchant_product_id,
    v_product_id,'private_merchant_sku_exact',80,'candidate',
    jsonb_build_object(
      'source_import_id',v_run.id,'source_row_id',v_item.id,
      'merchant_product_id',v_item.merchant_product_id,
      'sale_category_commission_exclusion_requires_check',true,
      'price_and_tracking_publication_approved',false,
      'source_category_requires_review',true))
   ON CONFLICT (source_id,source_offer_id) DO NOTHING
   RETURNING id INTO v_inserted;
   IF v_inserted IS NULL THEN
     SELECT product_id INTO v_link_product
     FROM public.product_matches
     WHERE source_id=v_source_id
       AND source_offer_id='736:48599:'||v_item.merchant_product_id;
     IF v_link_product IS DISTINCT FROM v_product_id THEN
       RAISE EXCEPTION 'Cadbury existing supplier ID mapped to different product';
     END IF;
     v_existing_links:=v_existing_links+1;
   ELSE
     v_new_links:=v_new_links+1;
   END IF;
 END LOOP;
 RETURN jsonb_build_object(
  'status','private_candidates_reconciled','private_only',true,
  'no_publication',true,'source_import_id',v_run.id,
  'source_rows',v_rows,'new_draft_products',v_new,
  'reused_draft_products',v_existing,
  'new_candidate_links',v_new_links,
  'reused_candidate_links',v_existing_links);
END;
$cadbury$;

REVOKE ALL ON FUNCTION public.reconcile_cadbury_private_candidates()
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_cadbury_private_candidates()
 TO service_role;
