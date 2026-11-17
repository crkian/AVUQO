import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {probeAwinEnhancedFeed} from "../lib/awin/private-feed-probe.ts";

const code=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Awin live probe rejects an invalid ID and missing credentials before any request",async()=>{
 const original=globalThis.fetch;
 const oldPublisher=process.env.AWIN_PUBLISHER_ID;
 const oldToken=process.env.AWIN_ACCESS_TOKEN;
 try{
  let called=0;
  globalThis.fetch=async()=>{called++;throw new Error("must not fetch")};
  delete process.env.AWIN_PUBLISHER_ID;
  delete process.env.AWIN_ACCESS_TOKEN;
  assert.equal(await probeAwinEnhancedFeed("736"),"unavailable");
  assert.equal(await probeAwinEnhancedFeed("../etc/passwd"),"unavailable");
  assert.equal(called,0);
 }finally{
  globalThis.fetch=original;
  if(oldPublisher===undefined)delete process.env.AWIN_PUBLISHER_ID;else process.env.AWIN_PUBLISHER_ID=oldPublisher;
  if(oldToken===undefined)delete process.env.AWIN_ACCESS_TOKEN;else process.env.AWIN_ACCESS_TOKEN=oldToken;
 }
});
test("Awin live probe reads a bounded enhanced feed with selected advertiser and stores nothing",async()=>{
 const old={fetch:globalThis.fetch,publisher:process.env.AWIN_PUBLISHER_ID,
  token:process.env.AWIN_ACCESS_TOKEN,locale:process.env.AWIN_LOCALE};
 try{
  process.env.AWIN_PUBLISHER_ID="12345";process.env.AWIN_ACCESS_TOKEN="synthetic-test-only";
  process.env.AWIN_LOCALE="en_GB";
  let calls=0;
  globalThis.fetch=async(url,config)=>{
   calls++;
   assert.match(String(url),/^https:\/\/api\.awin\.com\/publishers\/12345\/awinfeeds\/download\/736-retail-en_GB\.jsonl$/);
   assert.equal(config.method,"GET");
   assert.equal(config.cache,"no-store");
   assert.equal(config.headers.Authorization,"Bearer synthetic-test-only");
   return new Response(JSON.stringify({id:"synthetic-offer",title:"Synthetic tea tin",
    price:3.5,merchant_id:"736"})+"\n",{status:200});
  };
  assert.equal(await probeAwinEnhancedFeed("736"),"available");
  assert.equal(calls,1);
  globalThis.fetch=async()=>new Response("",{status:200});
  assert.equal(await probeAwinEnhancedFeed("736"),"empty");
  globalThis.fetch=async()=>new Response("not authorised",{status:403});
  assert.equal(await probeAwinEnhancedFeed("736"),"unavailable");
 }finally{
  globalThis.fetch=old.fetch;
  for(const [key,value] of [["AWIN_PUBLISHER_ID",old.publisher],
   ["AWIN_ACCESS_TOKEN",old.token],["AWIN_LOCALE",old.locale]]){
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
 }
});
test("Awin probe is owner authenticated, joined-only, does not mutate, and never publishes",()=>{
 const a=code("app/control-centre/awin-programmes/actions.ts");
 const page=code("app/control-centre/awin-programmes/page.tsx");
 assert.match(a,/await requireControlCentreAccess\(\)/);
 assert.match(a,/role!=="owner"/);
 assert.match(a,/joinedInSource\(data\.metadata,id\)/);
 assert.match(a,/probeAwinEnhancedFeed\(id\)/);
 assert.match(page,/action=\{probeJoinedAwinMerchant\}/);
 assert.match(page,/Check live feed access \(no import\)/);
 assert.doesNotMatch(a,/\.update\(|\.insert\(|\.upsert\(|record_awin_owner_release/);
 assert.doesNotMatch(a,/AWIN_ACCESS_TOKEN|console\.log/);
 const connector=code("lib/awin/private-feed-probe.ts");
 assert.match(connector,/return found\?"available":"empty"/);
});
