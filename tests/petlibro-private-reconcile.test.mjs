import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const migration=readFileSync("supabase/migrations/20261115193000_petlibro_private_candidate_reconciliation.sql","utf8");
const route=readFileSync("app/api/internal/awin-petlibro-private-reconcile/route.ts","utf8");
const vercel=JSON.parse(readFileSync("vercel.json","utf8"));

test("reconciles only the newest bounded, completed, still-unverified Petlibro private feed",()=>{
 assert.match(migration,/WHERE merchant_id='77952' AND filename LIKE 'GENAWIN__103580__AUTO__%'/);
 assert.match(migration,/ORDER BY created_at DESC LIMIT 1/);
 assert.match(migration,/v_run\.status<>'private_review'/);
 assert.match(migration,/v_run\.permission_status<>'unverified'/);
 assert.match(migration,/v_run\.total_count>500/);
 assert.match(migration,/v_run\.excluded_count<>0/);
 assert.match(migration,/v_row_count<>v_run\.total_count/);
 assert.match(migration,/source_ingestion/);
 assert.match(migration,/global_emergency_stop/);
 assert.match(migration,/status='paused' AND sync_enabled=false/);
 assert.match(migration,/pg_try_advisory_xact_lock\(77952, 103580\)/);
});

test("rejects ambiguous paired SKUs, models and prices; never merges on shared GTIN",()=>{
 for(const token of ["rows<>2","feed_rows<>1","health_rows<>1",
  "titles<>1","prices<>1","currencies<>1","gtins<>1","models>1",
  "tracking_link_verified","source_offer_id","v_sku.sku"])
  assert.ok(migration.includes(token),token);
 assert.match(migration,/v_key:='awin:77952:103580:'\|\|v_sku\.sku/);
 assert.doesNotMatch(migration,/canonical_key\s*=\s*.*gtin/i);
 assert.match(migration,/duplicate_gtin_values_for_review/);
});

test("writes only draft products and candidate mappings; never publishes prices",()=>{
 assert.match(migration,/INSERT INTO public\.products/);
 assert.match(migration,/NULL,v_key/);
 assert.match(migration,/INSERT INTO public\.product_matches/);
 assert.match(migration,/'candidate'/);
 assert.match(migration,/'draft'/);
 assert.doesNotMatch(migration,/INSERT INTO public\.(offers|published_deals|awin_offer_release_reviews|deal_scores)/i);
 assert.doesNotMatch(migration,/UPDATE public\.(offers|published_deals|sources|feed_import_records)/i);
 assert.match(migration,/ON CONFLICT \(source_id,source_offer_id\) DO NOTHING/);
 assert.match(migration,/publication_authorised',false/);
});

test("service-role-only cron keeps feed refreshes, monitors and public controls unchanged",()=>{
 assert.match(migration,/SECURITY INVOKER/);
 assert.match(migration,/REVOKE ALL ON FUNCTION public\.reconcile_petlibro_private_candidates\(\)/);
 assert.match(migration,/FROM PUBLIC, anon, authenticated/);
 assert.match(migration,/GRANT EXECUTE ON FUNCTION public\.reconcile_petlibro_private_candidates\(\)/);
 assert.match(migration,/TO service_role/);
 assert.match(route,/process\.env\.CRON_SECRET/);
 assert.match(route,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.match(route,/db\.rpc\("reconcile_petlibro_private_candidates"\)/);
 assert.doesNotMatch(route,/\.from\(|\.insert\(|\.upsert\(|\.update\(|fetch\(/);
 assert.ok(vercel.crons.some(c=>c.path==="/api/internal/awin-petlibro-private-reconcile"&&c.schedule==="27 7 * * *"));
 for(const p of ["/api/internal/awin-pilot-schedule/petlibro",
  "/api/internal/awin-pilot-schedule/mozillion",
  "/api/internal/awin-pilot-schedule/cadbury",
  "/api/internal/awin-feed-check","/api/internal/marketing"])
  assert.ok(vercel.crons.some(c=>c.path===p),p);
});
