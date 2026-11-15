import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(p,"utf8");
const migration=read("supabase/migrations/20261115194500_mozillion_private_handset_candidates.sql");
const route=read("app/api/internal/awin-mozillion-private-reconcile/route.ts");
const config=JSON.parse(read("vercel.json"));

test("only newest complete Mozillion SIM-free auto snapshot is eligible",()=>{
 for(const fragment of [
  "merchant_id='31539' AND filename LIKE 'GENAWIN__74135__AUTO__%'",
  "ORDER BY created_at DESC LIMIT 1",
  "v_run.status<>'private_review'",
  "v_run.permission_status<>'unverified'",
  "v_run.total_count>500",
  "v_run.excluded_count<>0",
  "v_session.completed_at IS NULL",
  "v_session.committed_count<>v_run.total_count",
  "v_distinct_skus<>v_row_count",
  "v_bad_rows>0",
  "source_ingestion",
  "global_emergency_stop",
  "status='paused' AND sync_enabled=false",
  "pg_try_advisory_xact_lock(31539,74135)"
 ])assert.ok(migration.includes(fragment),fragment);
});
test("handset stock, price, currency, identity and grade boundaries are fail-closed",()=>{
 for(const fragment of [
  "r.metadata->>'feed_id'='74135'",
  "r.metadata->>'listing_kind'='physical_product'",
  "r.metadata->>'tracking_link_verified'='true'",
  "r.metadata->>'source_currency_explicit'='true'",
  "r.metadata->>'availability'='1'",
  "r.merchant_product_id ~ '^[0-9]{1,20}$'",
  "Apple iPhone %",
  "Samsung Galaxy %",
  "Google Pixel %",
  "TCL %",
  " Brand New$",
  " Good as New$",
  "merchant_condition",
  "cross_retailer_matching",
  "owner review required"
 ])assert.ok(migration.includes(fragment),fragment);
 assert.match(migration,/v_key:='awin:31539:74135:'\|\|v_item.merchant_product_id/);
 assert.doesNotMatch(migration,/canonical_key\s*[:=]+\s*.*gtin/i);
});
test("only drafts and candidate links; never public offers or image/price copies",()=>{
 assert.match(migration,/INSERT INTO public.products/);
 assert.match(migration,/'draft'/);
 assert.match(migration,/'candidate'/);
 assert.match(migration,/primary_image_url,canonical_key,metadata/);
 assert.match(migration,/NULL,v_key/);
 assert.match(migration,/ON CONFLICT \(source_id,source_offer_id\) DO NOTHING/);
 assert.match(migration,/older_supplier_ids_absent_from_latest/);
 assert.doesNotMatch(migration,/INSERT INTO public\.(offers|published_deals|awin_offer_release_reviews|deal_scores|price_history)/i);
 assert.doesNotMatch(migration,/UPDATE public\.(sources|offers|published_deals|product_matches|feed_import_records)/i);
 assert.doesNotMatch(migration,/price\s*[,=]\s*v_item\.price/i);
});
test("scheduled 07:37 UTC job is cron secret protected, service role only",()=>{
 assert.match(route,/request.headers.get\("authorization"\)/);
 assert.match(route,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.match(route,/db.rpc\("reconcile_mozillion_private_handset_candidates"\)/);
 assert.doesNotMatch(route,/\.insert\(|\.upsert\(|\.update\(|fetch\(/);
 assert.match(migration,/SECURITY INVOKER/);
 assert.match(migration,/REVOKE ALL ON FUNCTION public.reconcile_mozillion_private_handset_candidates/);
 assert.match(migration,/FROM PUBLIC, anon, authenticated/);
 assert.match(migration,/TO service_role/);
 assert.deepEqual(config.crons.filter(c=>c.path==="/api/internal/awin-mozillion-private-reconcile"),
  [{path:"/api/internal/awin-mozillion-private-reconcile",schedule:"37 7 * * *"}]);
 for(const path of [
  "/api/internal/awin-petlibro-private-reconcile",
  "/api/internal/awin-pilot-schedule/petlibro",
  "/api/internal/awin-pilot-schedule/mozillion",
  "/api/internal/awin-pilot-schedule/cadbury",
  "/api/internal/awin-feed-check",
  "/api/internal/marketing",
  "/api/internal/awin-pneus-private-import"
 ])assert.ok(config.crons.some(x=>x.path===path),path);
});
