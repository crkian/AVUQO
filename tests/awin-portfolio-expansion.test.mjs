import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";
import {approvedAwinDownloadUrl} from "../lib/awin/approved-feed-url.ts";
import {toFreshVerifiedAwinRaw} from "../lib/awin/private-live-canonical-stage.ts";

const importer=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
const gateway=readFileSync("app/api/control-centre/awin-run-now/route.ts","utf8");
const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx","utf8");
test("added accepted PlayPress and Petlibro retailer feeds are exact-bound and owner runnable",()=>{
 for(const pair of ["101445:F5142","101445:96428","77952:109051","77952:109652","77952:119210"])
  assert.ok(importer.includes(pair),pair);
 for(const task of ["playpress_google","playpress_standard","petlibro_sale","petlibro_hero","petlibro_standard"]){
  assert.ok(gateway.includes(task+':'),task);
  assert.ok(ui.includes('"'+task+'"'),task);
 }
 assert.match(importer,/from\("affiliate_programs"\)/);
 assert.match(importer,/membership_status!=="accepted"/);
 assert.match(importer,/approvedAwinDownloadUrl\(feedRow\[idx\("URL"\)\]\?\?"",key,feed,publisher\)/);
 assert.match(importer,/privateStagingAllowed/);
 assert.doesNotMatch(ui,/signed_download_url|AWIN_DATAFEED_API_KEY|CRON_SECRET/);
});
test("new Google-format PlayPress feed validates exact merchant, GBP and own publisher link",()=>{
 const header=["advertiser_id","id","title","price","availability","aw_deep_link","brand"];
 const row=["101445","SKU-101","Synthetic Educational Puzzle","19.95 GBP","in stock",
  "https://www.awin1.com/pclick.php?m=101445&a=3135746&p=sku","PlayPress"];
 const outcome=normalizePilotAwinFeed("101445","F5142",header,[row]);
 assert.equal(outcome.currencySource,"feed_column");
 assert.deepEqual(outcome.header,header);
 assert.deepEqual(outcome.rows,[row]);
 assert.throws(()=>normalizePilotAwinFeed("101445","F5142",header,[["999999",...row.slice(1)]]),/google_retail_advertiser_mismatch/);
});
test("accepted PlayPress exact fresh feed may only enter private held canonical offers",()=>{
 const digest="a".repeat(64);
 const observed=new Date().toISOString();
 const raw={id:"id",import_id:"import",merchant_product_id:"T-101",
  title:"Synthetic Educational Puzzle",price:"19.95",currency:"GBP",brand:"PlayPress",
  category:"Toys",status:"review",metadata:{
   feed_id:"F5142",live_feed_digest:digest,live_feed_verified_at:observed,
   live_feed_verification:"exact_authenticated_feed_digest_rechecked",
   verified_awin_deep_link:"https://www.awin1.com/pclick.php?m=101445&a=3135746&p=sku",
   tracking_link_verified:true,availability:"in stock",listing_kind:"physical_product"}};
 const result=toFreshVerifiedAwinRaw(raw,"101445","F5142",digest);
 assert.ok(result);
 assert.equal(result.category,"toys-games");
 assert.equal(result.raw.catalogue_classification.basis,"source_category");
 assert.equal(result.merchantName,"PlayPress Toys UK");
 assert.equal(toFreshVerifiedAwinRaw({...raw,currency:"USD"},"101445","F5142",digest),null);
});
test("publisher-hosted Google URLs can never cross publisher or feed binding",()=>{
 const key="b".repeat(32);
 const url=`https://ui.awin.com/productdata-darwin-download/publisher/3135746/${key}/1/feed/F5142.csv.gz`;
 assert.equal(approvedAwinDownloadUrl(url,key,"F5142","3135746"),url);
 assert.throws(()=>approvedAwinDownloadUrl(url,key,"F5142","999999"));
 assert.throws(()=>approvedAwinDownloadUrl(url,key,"F5143","3135746"));
});

test("Craft Buddy second standard feed binds every row to exact identity and preserves explicit currency",()=>{
 const header=["data_feed_id","merchant_id","merchant_product_id","product_name","search_price","currency","aw_deep_link"];
 const row=["109997","45747","SKU","Synthetic kit","12.99","GBP","https://www.awin1.com/pclick.php?m=45747&a=3135746&p=123"];
 assert.deepEqual(normalizePilotAwinFeed("45747","109997",header,[row]).rows,[row]);
 assert.throws(()=>normalizePilotAwinFeed("45747","109997",header,[["999999",...row.slice(1)]]),/identity_mismatch/);
 assert.match(importer,/advertiser==="45747"&&feed==="109997"/);
});
