import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const migration=read("supabase/migrations/20261115213000_craft_buddy_private_candidates.sql");
const route=read("app/api/internal/awin-craft-buddy-private-reconcile/route.ts");
const worker=read("app/api/internal/awin-auto-import/route.ts");
const config=JSON.parse(read("vercel.json"));
test("only newest fresh, complete 45747:F1356 AUTO feed with SHA session is considered",()=>{
 for(const needle of [
  "merchant_id='45747' AND filename LIKE 'GENAWIN__F1356__AUTO__%'",
  "ORDER BY created_at DESC LIMIT 1","no_auto_snapshot",
  "interval '72 hours'","stale_auto_snapshot",
  "v_run.status<>'private_review'",
  "v_run.permission_status<>'unverified'",
  "v_run.total_count>5000","v_run.review_count<1",
  "v_run.review_count+v_run.excluded_count<>v_run.total_count",
  "v_session.completed_at IS NULL",
  "v_session.source_digest IS NULL",
  "v_session.committed_count<>v_run.total_count",
  "v_session.excluded_count<>v_run.excluded_count"
 ])assert.ok(migration.includes(needle),needle);
});
test("reject wrong merchant, duplicate IDs, missing GBP/stock/tracking; keep excluded safely out",()=>{
 for(const needle of [
  "pg_try_advisory_xact_lock(45747,1356)",
  "global_emergency_stop","source_ingestion",
  "status='paused' AND sync_enabled=false",
  "joined_programme_observed",
  "r.metadata->>'source_format'='google-retail'",
  "r.metadata->>'feed_id'='F1356'",
  "r.metadata->>'listing_kind'='physical_product'",
  "r.metadata->>'source_currency_explicit'='true'",
  "r.metadata->>'tracking_link_verified'='true'",
  "r.metadata->>'source_image_rights_confirmed'='false'",
  "r.metadata->>'permission_status'='unverified'",
  "r.currency='GBP'",
  "v_unique_ids<>v_rows",
  "r.status='excluded' AND cardinality(r.reasons)>0",
  "v_exclusions<>v_run.excluded_count"
 ])assert.ok(migration.includes(needle),needle);
 assert.match(migration,/WHERE r.import_id=v_run.id AND r.status='review'/);
});
test("set-based idempotent SKU drafts never promote licensed images or private prices",()=>{
 assert.match(migration,/INSERT INTO public.products/);
 assert.match(migration,/INSERT INTO public.product_matches/);
 assert.match(migration,/'awin:45747:F1356:'\|\|r.merchant_product_id/);
 assert.match(migration,/ON CONFLICT DO NOTHING/);
 assert.match(migration,/ON CONFLICT \(source_id,source_offer_id\) DO NOTHING/);
 assert.match(migration,/license_and_character_art_review_required',true/);
 assert.match(migration,/primary_image_url,canonical_key,metadata/);
 assert.match(migration,/NULL,/);
 assert.match(migration,/'draft'/);
 assert.match(migration,/'candidate'/);
 assert.doesNotMatch(migration,/INSERT INTO public\.(offers|published_deals|deal_scores|price_history|awin_offer_release_reviews)/i);
 assert.doesNotMatch(migration,/UPDATE public\.(products|product_matches|offers|sources|feed_import_records)/i);
 assert.match(migration,/SECURITY INVOKER/);
 assert.match(migration,/REVOKE ALL ON FUNCTION public\.reconcile_craft_buddy_private_candidates/);
 assert.match(migration,/TO service_role/);
});
test("fixed protected daily post-import cron retains existing feeds and marketing",()=>{
 assert.match(route,/request.headers.get\("authorization"\)/);
 assert.match(route,/process\.env\.AWIN_AUTO_IMPORT_ENABLED/);
 assert.match(route,/db.rpc\("reconcile_craft_buddy_private_candidates"\)/);
 assert.doesNotMatch(route,/\.insert\(|\.update\(|\.upsert\(|fetch\(/);
 assert.deepEqual(config.crons.filter(c=>c.path==="/api/internal/awin-craft-buddy-private-reconcile"),
  [{path:"/api/internal/awin-craft-buddy-private-reconcile",schedule:"57 7 * * *"}]);
 for(const p of [
  "/api/internal/awin-pilot-schedule/craftbuddy",
  "/api/internal/awin-cadbury-private-reconcile",
  "/api/internal/awin-mozillion-private-reconcile",
  "/api/internal/awin-petlibro-private-reconcile",
  "/api/internal/awin-feed-check",
  "/api/internal/awin-pneus-private-import",
  "/api/internal/marketing"
 ])assert.ok(config.crons.some(c=>c.path===p),p);
 assert.match(worker,/"45747:F1356"/);
});
