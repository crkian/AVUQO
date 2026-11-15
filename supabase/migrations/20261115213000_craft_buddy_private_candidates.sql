-- Craft Buddy 45747:F1356, Google retail, PRIVATE product identity candidates.
-- Do not create active products/offers, price observations, images or public
-- marketing; IP/brand rights and account-specific permissions remain pending.
CREATE OR REPLACE FUNCTION public.reconcile_craft_buddy_private_candidates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $craft_buddy$
DECLARE
 v_source_id uuid;
 v_source_count integer;
 v_run record;
 v_session record;
 v_rows integer;
 v_unique_ids integer;
 v_reviews integer;
 v_exclusions integer;
 v_invalid integer;
 v_conflicting_products integer;
 v_conflicting_links integer;
 v_unresolved integer;
 v_new_products integer := 0;
 v_new_links integer := 0;
 v_disappeared integer := 0;
 v_licensed_brand_titles integer := 0;
BEGIN
 -- One writer per exact (advertiser,feed); a retry is safe.
 IF NOT pg_try_advisory_xact_lock(45747,1356) THEN
   RETURN jsonb_build_object('status','already_running','private_only',true);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.system_controls
   WHERE control_key='source_ingestion' AND enabled=true)
   OR NOT EXISTS (SELECT 1 FROM public.system_controls
   WHERE control_key='global_emergency_stop' AND enabled=false) THEN
   RAISE EXCEPTION 'Craft Buddy private candidates blocked by emergency/ingestion controls';
 END IF;
 SELECT count(*)::integer,min(id::text)::uuid INTO v_source_count,v_source_id
 FROM public.sources
 WHERE connector_key='awin' AND status='paused' AND sync_enabled=false;
 IF v_source_count<>1 THEN
   RAISE EXCEPTION 'Craft Buddy private reconciliation requires one paused Awin source';
 END IF;
 IF NOT EXISTS(
   SELECT 1 FROM public.sources s,
     jsonb_array_elements(coalesce(s.metadata->'awin_advertisers','[]'::jsonb)) a
   WHERE s.id=v_source_id AND a->>'advertiser_id'='45747'
     AND a->>'joined_programme_observed'='true'
 ) THEN RAISE EXCEPTION 'Craft Buddy joined-programme evidence absent'; END IF;

 -- Select newest attempted AUTO snapshot, not an older successful manual
 -- October upload. A failed/incomplete newest run must NEVER cause fallback.
 SELECT id,filename,status,permission_status,total_count,review_count,
        excluded_count,created_at
 INTO v_run
 FROM public.feed_import_runs
 WHERE merchant_id='45747' AND filename LIKE 'GENAWIN__F1356__AUTO__%'
 ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN RETURN jsonb_build_object(
   'status','no_auto_snapshot','private_only',true,
   'new_draft_products',0,'new_candidate_links',0,'no_publication',true);
 END IF;
 IF v_run.created_at < now() - interval '72 hours' THEN
   RETURN jsonb_build_object('status','stale_auto_snapshot',
     'private_only',true,'new_draft_products',0,
     'new_candidate_links',0,'no_publication',true);
 END IF;
 IF v_run.status<>'private_review'
   OR v_run.permission_status<>'unverified'
   OR v_run.total_count IS NULL
   OR v_run.total_count<1 OR v_run.total_count>5000
   OR v_run.review_count<1 OR v_run.excluded_count<0
   OR v_run.review_count+v_run.excluded_count<>v_run.total_count THEN
   RAISE EXCEPTION 'Latest Craft Buddy AUTO feed not complete and privately reviewable';
 END IF;
 SELECT committed_count,review_count,excluded_count,completed_at,source_digest
 INTO v_session
 FROM public.large_feed_import_sessions WHERE import_id=v_run.id;
 IF NOT FOUND OR v_session.completed_at IS NULL
   OR v_session.source_digest IS NULL
   OR v_session.committed_count<>v_run.total_count
   OR v_session.review_count<>v_run.review_count
   OR v_session.excluded_count<>v_run.excluded_count THEN
   RAISE EXCEPTION 'Craft Buddy AUTO session digest and row counts are not complete';
 END IF;

 -- Every row must belong to this exact Google feed. Excluded rows are kept
 -- out of drafts; 2026-10-28 historical data had 66 out-of-stock entries.
 -- Do not reject an entire snapshot solely because safe exclusions exist.
 SELECT count(*)::integer,
   count(distinct r.merchant_product_id)::integer,
   count(*) FILTER(WHERE r.status='review')::integer,
   count(*) FILTER(WHERE r.status='excluded')::integer,
   count(*) FILTER(WHERE (
      r.merchant_id='45747'
      AND r.merchant_product_id IS NOT NULL
      AND length(btrim(r.merchant_product_id)) BETWEEN 1 AND 250
      AND r.metadata->>'source_format'='google-retail'
      AND r.metadata->>'feed_id'='F1356'
      AND r.metadata->>'listing_kind'='physical_product'
      AND r.metadata->>'price_observation_kind'='private_import'
      AND r.metadata->>'permission_status'='unverified'
      AND r.metadata->>'source_image_rights_confirmed'='false'
      AND r.metadata->>'canonical_category_approved'='false'
      AND (
        (r.status='review'
          AND r.review_decision IN ('pending','checked')
          AND cardinality(r.reasons)=0
          AND length(btrim(r.title)) BETWEEN 4 AND 500
          AND r.price>0 AND r.currency='GBP'
          AND r.metadata->>'source_currency_explicit'='true'
          AND r.metadata->>'tracking_link_verified'='true'
          AND lower(coalesce(r.metadata->>'availability',''))
            IN ('in stock','in_stock','1','available')
        )
        OR (r.status='excluded' AND cardinality(r.reasons)>0)
      )
   ) IS NOT TRUE)::integer
 INTO v_rows,v_unique_ids,v_reviews,v_exclusions,v_invalid
 FROM public.feed_import_records r WHERE r.import_id=v_run.id;
 IF v_rows<>v_run.total_count
    OR v_unique_ids<>v_rows
    OR v_reviews<>v_run.review_count
    OR v_exclusions<>v_run.excluded_count
    OR v_invalid<>0 THEN
   RAISE EXCEPTION 'Craft Buddy import has duplicate IDs, mismatched counts or unsafe records';
 END IF;

 -- SKU is the sole product identity. Do not merge by title, image, GTIN,
 -- licensed character name or apparent brand, which may all repeat.
 SELECT count(*)::integer INTO v_conflicting_products
 FROM public.feed_import_records r
 JOIN public.products p
   ON p.canonical_key='awin:45747:F1356:'||r.merchant_product_id
 WHERE r.import_id=v_run.id AND r.status='review'
  AND (p.status<>'draft'
    OR p.canonical_title IS DISTINCT FROM r.title
    OR coalesce(p.brand,'') IS DISTINCT FROM r.brand
    OR p.metadata->>'merchant_product_id' IS DISTINCT FROM r.merchant_product_id
    OR p.metadata->>'feed_id' IS DISTINCT FROM 'F1356');
 IF v_conflicting_products<>0 THEN
   RAISE EXCEPTION 'Existing Craft Buddy SKU changed title/brand or left draft; owner review needed';
 END IF;

 -- Bulk insertion, not 1,300 sequential lookups/transactions. A slug
 -- collision will remain unresolved and fail the whole transaction below.
 INSERT INTO public.products(
  slug,canonical_title,brand,status,product_type,
  primary_image_url,canonical_key,metadata)
 SELECT 'craft-buddy-' ||
  left(trim(both '-' from
       regexp_replace(lower(r.title),'[^a-z0-9]+','-','g')),88) ||
       '-' || left(md5(r.merchant_product_id),14),
  r.title,nullif(r.brand,''),'draft','product',NULL,
  'awin:45747:F1356:'||r.merchant_product_id,
  jsonb_build_object(
   'origin','craft_buddy_private_google_auto_candidate',
   'advertiser_id','45747','feed_id','F1356',
   'merchant_product_id',r.merchant_product_id,
   'source_import_id',v_run.id,
   'license_and_character_art_review_required',true,
   'trademark_logo_permission','unverified',
   'image_rights','unverified',
   'price_freshness_for_publication','unverified',
   'publication_authorised',false)
 FROM public.feed_import_records r
 WHERE r.import_id=v_run.id AND r.status='review'
   AND NOT EXISTS(
     SELECT 1 FROM public.products p
     WHERE p.canonical_key='awin:45747:F1356:'||r.merchant_product_id)
 ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS v_new_products = ROW_COUNT;

 SELECT count(*)::integer INTO v_unresolved
 FROM public.feed_import_records r
 LEFT JOIN public.products p
   ON p.canonical_key='awin:45747:F1356:'||r.merchant_product_id
 WHERE r.import_id=v_run.id AND r.status='review'
   AND (p.id IS NULL OR p.status<>'draft'
     OR p.canonical_title IS DISTINCT FROM r.title
     OR coalesce(p.brand,'') IS DISTINCT FROM r.brand
     OR p.metadata->>'merchant_product_id' IS DISTINCT FROM r.merchant_product_id);
 IF v_unresolved<>0 THEN
   RAISE EXCEPTION 'Craft Buddy draft product identity could not be resolved safely';
 END IF;

 -- A match previously attached to another product must never be rewritten.
 SELECT count(*)::integer INTO v_conflicting_links
 FROM public.feed_import_records r
 JOIN public.products p
  ON p.canonical_key='awin:45747:F1356:'||r.merchant_product_id
 JOIN public.product_matches m
  ON m.source_id=v_source_id
    AND m.source_offer_id='45747:F1356:'||r.merchant_product_id
 WHERE r.import_id=v_run.id AND r.status='review'
   AND m.product_id IS DISTINCT FROM p.id;
 IF v_conflicting_links<>0 THEN
   RAISE EXCEPTION 'Craft Buddy source offer is linked to another product';
 END IF;

 INSERT INTO public.product_matches(
  source_id,source_offer_id,product_id,match_method,
  confidence,status,evidence)
 SELECT v_source_id,'45747:F1356:'||r.merchant_product_id,
   p.id,'private_exact_craft_buddy_sku',80,'candidate',
   jsonb_build_object(
     'source_import_id',v_run.id,'source_row_id',r.id,
     'merchant_product_id',r.merchant_product_id,
     'licensed_character_art_review_required',true,
     'public_product_image_approved',false,
     'price_and_tracking_publication_approved',false,
     'category_review_required',true)
 FROM public.feed_import_records r
 JOIN public.products p
  ON p.canonical_key='awin:45747:F1356:'||r.merchant_product_id
 WHERE r.import_id=v_run.id AND r.status='review'
 ON CONFLICT (source_id,source_offer_id) DO NOTHING;
 GET DIAGNOSTICS v_new_links = ROW_COUNT;

 SELECT count(*)::integer INTO v_unresolved
 FROM public.feed_import_records r
 JOIN public.products p ON p.canonical_key=
  'awin:45747:F1356:'||r.merchant_product_id
 LEFT JOIN public.product_matches m ON m.source_id=v_source_id
  AND m.source_offer_id='45747:F1356:'||r.merchant_product_id
 WHERE r.import_id=v_run.id AND r.status='review'
   AND (m.id IS NULL OR m.product_id IS DISTINCT FROM p.id);
 IF v_unresolved<>0 THEN
   RAISE EXCEPTION 'Craft Buddy source links unresolved; transaction rolled back';
 END IF;

 -- Reporting only: old IDs no longer present in reviewable new snapshot
 -- will need withdrawal if public offers ever become eligible. Do not
 -- auto-activate, update or delete product/offer records here.
 SELECT count(*)::integer INTO v_disappeared
 FROM public.product_matches m
 WHERE m.source_id=v_source_id
   AND m.source_offer_id LIKE '45747:F1356:%'
   AND NOT EXISTS (
     SELECT 1 FROM public.feed_import_records r
     WHERE r.import_id=v_run.id AND r.status='review'
       AND m.source_offer_id='45747:F1356:'||r.merchant_product_id);

 SELECT count(*) FILTER(WHERE title ~*
   '(Harry Potter|Disney|Marvel|Star Wars|Paddington|DC Comics)')::integer
 INTO v_licensed_brand_titles
 FROM public.feed_import_records
 WHERE import_id=v_run.id AND status='review';

 RETURN jsonb_build_object(
  'status','private_candidates_reconciled','private_only',true,
  'no_publication',true,'source_import_id',v_run.id,
  'source_rows',v_rows,'reviewable_rows',v_reviews,
  'excluded_rows',v_exclusions,
  'new_draft_products',v_new_products,
  'reused_draft_products',v_reviews-v_new_products,
  'new_candidate_links',v_new_links,
  'reused_candidate_links',v_reviews-v_new_links,
  'licensed_character_title_mentions_for_review',v_licensed_brand_titles,
  'older_supplier_ids_absent_or_excluded_from_latest',v_disappeared);
END;
$craft_buddy$;

REVOKE ALL ON FUNCTION public.reconcile_craft_buddy_private_candidates()
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_craft_buddy_private_candidates()
 TO service_role;
