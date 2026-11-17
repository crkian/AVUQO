import test from "node:test";
import assert from "node:assert/strict";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";

const header=["data_feed_id","merchant_id","merchant_product_id",
 "product_name","search_price","aw_deep_link","stock_status"];
const link="https://www.awin1.com/pclick.php?m=736&a=3135746&p=123";
const row=["48599","736","CD100","Synthetic UK chocolate box","12.95",link,"in stock"];

test("exact Cadbury UK feed without currency can be normalized for private GBP review",()=>{
 const result=normalizePilotAwinFeed("736","48599",header,[row]);
 assert.equal(result.currencySource,"cadbury_uk_programme_gbp");
 assert.equal(result.header.at(-1),"currency");
 assert.equal(result.rows[0].at(-1),"GBP");
 assert.equal(header.includes("currency"),false);
});

test("Cadbury fallback rejects other merchants, feed IDs and ambiguous source schema",()=>{
 for(const pair of [["735","48599"],["736","48598"]]){
  assert.notEqual(normalizePilotAwinFeed(pair[0],pair[1],header,[row]).currencySource,
   "cadbury_uk_programme_gbp");
 }
 assert.throws(()=>normalizePilotAwinFeed("736","48599",header,[
  ["48599","735",...row.slice(2)]
 ]),/cadbury_uk_feed_identity_mismatch/);
 assert.throws(()=>normalizePilotAwinFeed("736","48599",header,[
  ["48598","736",...row.slice(2)]
 ]),/cadbury_uk_feed_identity_mismatch/);
 assert.throws(()=>normalizePilotAwinFeed("736","48599",
  [...header,"merchant_id"],[[...row,"736"]]),/cadbury_uk_schema_mismatch/);
});

test("explicit currency is never replaced by inferred GBP",()=>{
 const withCurrency=[...header,"currency"];
 const sourceRow=[...row,"USD"];
 const result=normalizePilotAwinFeed("736","48599",withCurrency,[sourceRow]);
 assert.equal(result.currencySource,"feed_column");
 assert.equal(result.rows[0].at(-1),"USD");
});

test("GBP private staging must not activate publication",()=>{
 const fs=await import("node:fs");
 const worker=fs.readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 assert.match(worker,/cadbury_uk_programme_gbp/);
 assert.match(worker,/permission_status:"unverified"/);
 assert.match(worker,/source\.status!=="paused"\|\|source\.sync_enabled!==false/);
 assert.match(worker,/no_publication:true/);
});
