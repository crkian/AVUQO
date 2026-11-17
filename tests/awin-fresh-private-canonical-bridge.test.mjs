import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fromFreshPrivateAwinRecord} from "../lib/awin/fresh-private-canonical-row.ts";
const now=Date.parse("2026-11-17T09:43:00Z");
const tracked="https://www.awin1.com/pclick.php?m=736&a=3135746&p=SKU123";
const row={
 merchant_id:"736",merchant_product_id:"SKU123",title:"Synthetic Chocolate Selection",
 price:"12.95",currency:"GBP",status:"review",brand:"Cadbury",category:"Gifts",
 created_at:"2026-11-17T07:13:00Z",
 metadata:{feed_id:"48599",verified_awin_deep_link:tracked,tracking_link_verified:true,
   listing_kind:"physical_product",permission_status:"unverified",availability:"in stock",
   source_updated_at:"2026-11-17T07:12:00Z",model:"SKU123"}
};
const map=(x=row)=>fromFreshPrivateAwinRecord(x,"Cadbury Gifts Direct","736","48599",now);
test("fresh verified private feed may enter ONLY the held canonical pipeline",()=>{
 const offer=map();assert.ok(offer);
 assert.equal(offer.sourceRecordId,"736:SKU123");
 assert.equal(offer.merchantExternalId,"736");
 assert.equal(offer.price,12.95);
 assert.equal(offer.currency,"GBP");
 assert.equal(offer.affiliateUrl,tracked);
 assert.equal(offer.imageUrl,null);
 assert.equal(offer.deliveryCost,null);
 assert.equal(offer.stockStatus,"in_stock");
 assert.equal(offer.raw.delivery_included,"unverified");
});
test("historical prices, unknown stock and unverified URL never create candidates",()=>{
 const cases=[
  {...row,created_at:"2026-11-16T07:13:00Z"},
  {...row,metadata:{...row.metadata,source_updated_at:"2026-11-10T07:13:00Z"}},
  {...row,metadata:{...row.metadata,verified_awin_deep_link:tracked.replace("m=736","m=496")}},
  {...row,metadata:{...row.metadata,verified_awin_deep_link:null}},
  {...row,metadata:{...row.metadata,tracking_link_verified:false}},
  {...row,metadata:{...row.metadata,availability:"unknown"}},
  {...row,currency:"USD"},{...row,status:"excluded"},
  {...row,merchant_id:"496"},{...row,price:"0"},{...row,metadata:{...row.metadata,feed_id:"89987"}},
  {...row,metadata:{...row.metadata,listing_kind:"service_or_contract"}}
 ];
 for(const candidate of cases)assert.equal(map(candidate),null);
});
test("the scheduled bridge and shared scorer stay first-publication blocked",()=>{
 const cron=JSON.parse(readFileSync("vercel.json","utf8")).crons;
 assert.deepEqual(cron.filter(x=>x.path==="/api/internal/awin-fresh-private-canonical-bridge"),
  [{path:"/api/internal/awin-fresh-private-canonical-bridge",schedule:"43 9 * * *"}]);
 const route=readFileSync("app/api/internal/awin-fresh-private-canonical-bridge/route.ts","utf8");
 const pipeline=readFileSync("lib/pipeline/run.ts","utf8");
 const privateImporter=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 assert.match(route,/runDealIntelligencePipeline\(db/);
 assert.match(route,/source\.status!=="active"\|\|source\.sync_enabled!==true/);
 assert.match(route,/\.eq\("status","private_review"\)/);
 assert.match(route,/\.gte\("created_at",cutoff\)/);
 assert.match(route,/no_first_publication:true/);
 assert.match(route,/restricted\.test\(row\.title/);
 assert.match(pipeline,/awinVerifiedRows/);
 assert.match(pipeline,/\.from\("affiliate_programs"\)\.select\("metadata"\)/);
 assert.match(pipeline,/owner_joined_accepted_attestation/);
 assert.match(pipeline,/accepted programme evidence registry/);
 assert.match(pipeline,/raw\.merchantExternalId !== rightsContext\.advertiserId/);
 assert.match(pipeline,/sourceIngestionFailures\(currentSource, rightsContext\)/);
 assert.match(pipeline,/source\.connector_key!=="awin"\|\|renewExistingAwin/);
 assert.match(privateImporter,/sourceIngestionFailures\(source/);
 assert.match(privateImporter,/safelyPaused/);
 assert.match(privateImporter,/safelyActive/);
});
test("first owner release atomically activates only the approved exact private draft",()=>{
 const sql=readFileSync("supabase/migrations/20261117170000_awin_first_release_activate_exact_draft.sql","utf8");
 const route=readFileSync("app/api/control-centre/awin-first-release/route.ts","utf8");
 assert.match(sql,/p\.status in \('draft','active'\)/);
 assert.match(sql,/update public\.products set status='active'/);
 assert.match(sql,/where id=\(select product_id from public\.offers where id=p_offer_id\)/);
 assert.match(sql,/status='draft'/);
 assert.match(sql,/update public\.published_deals set status='published'/);
 assert.match(sql,/Owner role required for release/);
 assert.match(sql,/now\(\)-interval '48 hours'/);
 assert.match(route,/product\?\.status==="draft"/);
});

test("owner can run the same guarded held bridge now without adding a second scoring engine",()=>{
 const owner=readFileSync("app/api/control-centre/awin-run-now/route.ts","utf8");
 const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx","utf8");
 assert.match(owner,/const isBridge=task==="canonical_bridge"/);
 assert.match(owner,/bridgeFreshOffers\(new NextRequest\(url,\{method:"GET",headers:auth\}\)\)/);
 assert.match(owner,/role\?\.role!=="owner"/);
 assert.match(owner,/Same origin required/);
 assert.match(owner,/private-only-"\+task/);
 assert.match(ui,/"canonical","Fresh canonical offers"/);
 assert.match(ui,/slug==="canonical"\?\["bridge"\]/);
 assert.match(ui,/mode==="bridge"\?"Prepare held offers"/);
 assert.match(ui,/never public listings/);
});
