import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectTooledUpProgrammeCurrency} from "../lib/awin/tooled-up-programme-currency.ts";
const publisher="3135746",token="a".repeat(20);
const fake=(data,status=200)=>async()=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json"}});
test("joined 496 GBP is evidence for programme only, never a published price/feed",async()=>{
 const v=await inspectTooledUpProgrammeCurrency(publisher,token,fake([{id:496,currencyCode:"GBP"}]));
 assert.equal(v.currency_verified,true);
 assert.equal(v.programme_currency,"GBP");
 assert.equal(v.advertiser_id,"496");
 for(const key of ["feed_identity_verified","feed_data_currency_verified","image_rights_verified","ready_to_stage","public_offer_approved"])assert.equal(v[key],false,key);
 assert.equal(v.no_database_writes,true);
});
test("non-GBP must not be inferred or coerced",async()=>{
 for(const currencyCode of ["EUR","USD"]){
  const v=await inspectTooledUpProgrammeCurrency(publisher,token,fake([{id:496,currencyCode}]));
  assert.equal(v.currency_verified,false);
  assert.equal(v.programme_currency,currencyCode);
 }
});
test("missing, ambiguous, invalid and non-joined records fail closed",async()=>{
 for(const rows of [
  [],[{id:496,currencyCode:"GBP"},{id:496,currencyCode:"GBP"}],
  [{id:"496",currencyCode:"GBP"}],[{id:496,currencyCode:"gbp"}],
  [{id:496,currencyCode:""}],[{id:498,currencyCode:"GBP"}]
 ]){
  await assert.rejects(()=>inspectTooledUpProgrammeCurrency(publisher,token,fake(rows)));
 }
 await assert.rejects(()=>inspectTooledUpProgrammeCurrency(publisher,token,fake({id:496,currencyCode:"GBP"})));
 await assert.rejects(()=>inspectTooledUpProgrammeCurrency(publisher,token,fake([],403)));
 await assert.rejects(()=>inspectTooledUpProgrammeCurrency("invalid",token,fake([])));
 await assert.rejects(()=>inspectTooledUpProgrammeCurrency(publisher,"bad",fake([])));
});
test("private route must require bearer secret, paused joined source and never perform writes",()=>{
 const p=readFileSync(new URL("../app/api/internal/awin-tooled-up-currency/route.ts",import.meta.url),"utf8");
 assert.match(p,/export async function POST/);
 assert.match(p,/process\.env\.CRON_SECRET/);
 assert.match(p,/request\.headers\.get\("authorization"\)/);
 assert.match(p,/source\.status!=="paused"/);
 assert.match(p,/source\.sync_enabled!==false/);
 assert.match(p,/joinedInSource\(source\.metadata,"496"\)/);
 assert.match(p,/no_database_writes:true/);
 assert.doesNotMatch(p,/\.insert\(|\.upsert\(|\.update\(|\.delete\(/);
 assert.match(p,/Cache-Control/);
});
