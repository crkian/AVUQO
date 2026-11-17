import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fetchAwinLiveFeedInventory} from "../lib/awin/live-feed-inventory.ts";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const header="Advertiser ID,Advertiser Name,Primary Region,Membership Status,Datafeed Format,Feed ID,Feed Name,Language,Vertical,Last Imported,Last Checked,No of products,URL\n";
const cadbury="736,Cadbury Gifts Direct,GB,active,Awin,48599,Cadbury Feed,English,,2026-11-17 10:20:00,2026-11-17 10:00:00,1367,https://productdata.awin.com/datafeed/download/apikey/private-secret\n";
test("automatic feed discovery uses separate Awin datafeed key and redacts signed URLs",async()=>{
 const old={key:process.env.AWIN_DATAFEED_API_KEY,pub:process.env.AWIN_PUBLISHER_ID,fetch:globalThis.fetch};
 try{
  process.env.AWIN_PUBLISHER_ID="123456";
  process.env.AWIN_DATAFEED_API_KEY="synthetic-test-key-123";
  let calls=0;
  globalThis.fetch=async(url,options)=>{
   calls++;
   assert.match(String(url),/^https:\/\/ui\.awin\.com\/productdata-darwin-download\/publisher\/123456\/synthetic-test-key-123\/1\/feedList$/);
   assert.equal(options.redirect,"error");
   assert.equal(options.cache,"no-store");
   return new Response(header+cadbury,{status:200,headers:{"content-type":"text/csv"}});
  };
  const result=await fetchAwinLiveFeedInventory(new Set(["736"]));
  assert.equal(calls,1);
  assert.equal(result.feeds.length,1);
  assert.equal(result.feeds[0].advertiserId,"736");
  assert.equal(result.feeds[0].products,1367);
  assert.doesNotMatch(JSON.stringify(result),/private-secret|synthetic-test-key/);
 }finally{
  globalThis.fetch=old.fetch;
  if(old.key===undefined)delete process.env.AWIN_DATAFEED_API_KEY;else process.env.AWIN_DATAFEED_API_KEY=old.key;
  if(old.pub===undefined)delete process.env.AWIN_PUBLISHER_ID;else process.env.AWIN_PUBLISHER_ID=old.pub;
 }
});
test("missing datafeed credentials and invalid publisher IDs fail before calling provider",async()=>{
 const old={key:process.env.AWIN_DATAFEED_API_KEY,pub:process.env.AWIN_PUBLISHER_ID,fetch:globalThis.fetch};
 try{
  let calls=0;
  globalThis.fetch=async()=>{calls++;throw Error("must not fetch")};
  delete process.env.AWIN_DATAFEED_API_KEY;
  process.env.AWIN_PUBLISHER_ID="12345";
  await assert.rejects(()=>fetchAwinLiveFeedInventory(new Set(["736"])),/credentials/);
  process.env.AWIN_DATAFEED_API_KEY="synthetic-test-key";
  process.env.AWIN_PUBLISHER_ID="not-a-publisher";
  await assert.rejects(()=>fetchAwinLiveFeedInventory(new Set(["736"])),/credentials/);
  assert.equal(calls,0);
 }finally{
  globalThis.fetch=old.fetch;
  if(old.key===undefined)delete process.env.AWIN_DATAFEED_API_KEY;else process.env.AWIN_DATAFEED_API_KEY=old.key;
  if(old.pub===undefined)delete process.env.AWIN_PUBLISHER_ID;else process.env.AWIN_PUBLISHER_ID=old.pub;
 }
});
test("unjoined advertisers do not leak into automatic results and no signed URLs are returned",async()=>{
 const old={key:process.env.AWIN_DATAFEED_API_KEY,pub:process.env.AWIN_PUBLISHER_ID,fetch:globalThis.fetch};
 try{
  process.env.AWIN_PUBLISHER_ID="12345";process.env.AWIN_DATAFEED_API_KEY="synthetic-test-key-123";
  globalThis.fetch=async()=>new Response(header+cadbury+
   "987,Not Joined,GB,active,Awin,1001,Feed,English,,2026-11-17,2026-11-17,33,https://secret.invalid/key\n");
  const result=await fetchAwinLiveFeedInventory(new Set(["736"]));
  assert.equal(result.feeds.length,1);
  assert.equal(result.activeOutsideJoined,1);
  assert.doesNotMatch(JSON.stringify(result),/secret.invalid|private-secret/);
 }finally{
  globalThis.fetch=old.fetch;
  if(old.key===undefined)delete process.env.AWIN_DATAFEED_API_KEY;else process.env.AWIN_DATAFEED_API_KEY=old.key;
  if(old.pub===undefined)delete process.env.AWIN_PUBLISHER_ID;else process.env.AWIN_PUBLISHER_ID=old.pub;
 }
});
test("live feed-list endpoint authenticates owner before source access and is read-only",()=>{
 const route=read("app/api/control-centre/awin-live-feed-list/route.ts");
 const client=read("app/control-centre/feed-list-audit/FeedAuditForm.tsx");
 const cron=read("app/api/internal/awin-feed-check/route.ts");
 const vercel=JSON.parse(read("vercel.json"));
 assert.ok(route.indexOf("db.auth.getUser()")<route.indexOf('db.from("user_roles")'));
 assert.ok(route.indexOf('role?.role!=="owner"')<route.indexOf("createAdminClient()"));
 assert.match(route,/joined_programme_observed===true/);
 assert.match(route,/fetchAwinLiveFeedInventory/);
 assert.match(route,/private, no-store/);
 assert.doesNotMatch(route,/\.update\(|\.insert\(|\.upsert\(|console\.log|console\.error/);
 assert.match(client,/Discover available feeds automatically/);
 assert.match(cron,/AWIN_FEED_MONITOR_ENABLED/);
 assert.ok(vercel.crons.some(x=>x.path==="/api/internal/awin-feed-check"));
});
