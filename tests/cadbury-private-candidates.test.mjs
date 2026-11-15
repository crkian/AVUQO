import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("supabase/migrations/20261115210000_cadbury_private_candidates.sql");
const route=read("app/api/internal/awin-cadbury-private-reconcile/route.ts");
const v=JSON.parse(read("vercel.json"));
test("Cadbury requires latest bounded completed AUTO snapshot only, never historical uploads",()=>{
 for(const s of [
 "merchant_id='736' AND filename LIKE 'GENAWIN__48599__AUTO__%'",
 "ORDER BY created_at DESC LIMIT 1",
 "no_validated_auto_snapshot",
 "v_run.status<>'private_review'",
 "v_run.permission_status<>'unverified'",
 "v_run.total_count>2500",
 "v_run.review_count<>v_run.total_count",
 "v_run.excluded_count<>0",
 "v_session.completed_at IS NULL",
 "v_session.committed_count<>v_run.total_count",
 "v_unique_skus<>v_rows",
 "v_invalid>0"
 ])assert.ok(sql.includes(s),s);
});
test("private candidate matcher checks stock, source identity, GBP, tracking and stop",()=>{
 for(const s of [
 "pg_try_advisory_xact_lock(736,48599)",
 "global_emergency_stop","source_ingestion",
 "status='paused' AND sync_enabled=false",
 "joined_programme_observed",
 "r.metadata->>'feed_id'='48599'",
 "r.metadata->>'listing_kind'='physical_product'",
 "r.metadata->>'source_currency_explicit'='true'",
 "r.metadata->>'tracking_link_verified'='true'",
 "r.metadata->>'availability' IN",
 "v_key:='awin:736:48599:'||v_item.merchant_product_id",
 "sale_category_commission_exclusion_requires_check"
 ])assert.ok(sql.includes(s),s);
});
test("no merchant images, stale prices, product activation or public offers",()=>{
 assert.match(sql,/NULL,v_key/);
 assert.match(sql,/'draft'/);
 assert.match(sql,/'candidate'/);
 assert.match(sql,/ON CONFLICT \(source_id,source_offer_id\) DO NOTHING/);
 assert.doesNotMatch(sql,/INSERT INTO public\.(offers|published_deals|deal_scores|price_history)/i);
 assert.doesNotMatch(sql,/UPDATE public\.(offers|sources|published_deals|feed_import_records|product_matches)/i);
 assert.match(sql,/SECURITY INVOKER/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.reconcile_cadbury_private_candidates/);
 assert.match(sql,/TO service_role/);
});
test("daily post-import job retains all other feed and marketing schedules",()=>{
 assert.match(route,/request.headers.get\("authorization"\)/);
 assert.match(route,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.match(route,/db.rpc\("reconcile_cadbury_private_candidates"\)/);
 assert.deepEqual(v.crons.filter(x=>x.path==="/api/internal/awin-cadbury-private-reconcile"),
   [{path:"/api/internal/awin-cadbury-private-reconcile",schedule:"47 7 * * *"}]);
 for(const path of ["/api/internal/awin-feed-check","/api/internal/marketing",
   "/api/internal/awin-pilot-schedule/petlibro",
   "/api/internal/awin-pilot-schedule/mozillion",
   "/api/internal/awin-pilot-schedule/cadbury",
   "/api/internal/awin-petlibro-private-reconcile",
   "/api/internal/awin-mozillion-private-reconcile",
   "/api/internal/awin-pneus-private-import"])
    assert.ok(v.crons.some(x=>x.path===path),path);
});
