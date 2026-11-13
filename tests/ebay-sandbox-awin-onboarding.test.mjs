import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ebayPilotReadiness,normalizeEbayUkResults} from "../lib/ebay/private-uk-browse.ts";

const code=path=>readFileSync(path,"utf8");
const keys=["EBAY_SANDBOX_CLIENT_ID","EBAY_SANDBOX_CLIENT_SECRET","EBAY_CLIENT_ID","EBAY_CLIENT_SECRET",
 "EBAY_BROWSE_ENVIRONMENT","EBAY_BROWSE_PRODUCTION_APPROVED","EBAY_EPN_CAMPAIGN_ID"];
function withKeys(vars,fn){
 const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{for(const k of keys)delete process.env[k];for(const [k,v] of Object.entries(vars))process.env[k]=v;return fn();}
 finally{for(const k of keys){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];}}
}
test("sandbox keyset is isolated from Production credentials and not a publishing approval",()=>{
 withKeys({EBAY_SANDBOX_CLIENT_ID:"sandbox-app-id",EBAY_SANDBOX_CLIENT_SECRET:"sandbox-secret",
  EBAY_EPN_CAMPAIGN_ID:"1234567890"},()=>{
  const readiness=ebayPilotReadiness();
  assert.equal(readiness.environment,"sandbox");
  assert.equal(readiness.ready,true);
  assert.equal(readiness.productionApproved,false);
  assert.equal(readiness.campaignConfigured,true);
 });
 withKeys({EBAY_CLIENT_ID:"prod-app-id",EBAY_CLIENT_SECRET:"prod-secret"},()=>{
  const readiness=ebayPilotReadiness();
  assert.equal(readiness.environment,"sandbox");
  assert.equal(readiness.ready,false);
  assert.equal(readiness.credentialsConfigured,false);
 });
});
test("production Browse remains blocked unless both keyset and explicit provider approval exist",()=>{
 withKeys({EBAY_CLIENT_ID:"prod",EBAY_CLIENT_SECRET:"secret",EBAY_BROWSE_ENVIRONMENT:"production"},()=>{
  const readiness=ebayPilotReadiness();
  assert.equal(readiness.environment,"production");
  assert.equal(readiness.ready,false);
  assert.equal(readiness.productionApproved,false);
 });
 withKeys({EBAY_CLIENT_ID:"prod",EBAY_CLIENT_SECRET:"secret",EBAY_BROWSE_ENVIRONMENT:"production",
  EBAY_BROWSE_PRODUCTION_APPROVED:"true"},()=>{
  assert.equal(ebayPilotReadiness().ready,true);
 });
 withKeys({EBAY_BROWSE_ENVIRONMENT:"production",EBAY_BROWSE_PRODUCTION_APPROVED:"true"},()=>{
  assert.equal(ebayPilotReadiness().ready,false);
 });
});
test("eBay affiliate URL cannot be spoofed by unrelated hosts or malformed campaign IDs",()=>{
 const rows=[
 "https://www.ebay.co.uk/itm/123?campid=1234567890",
 "https://evil.com/?next=ebay.co.uk&campid=1234567890",
 "https://www.ebay.co.uk.attacker.invalid/itm/123?campid=1234567890",
 "https://www.ebay.co.uk/itm/123?campid=wrong",
 "http://www.ebay.co.uk/itm/123?campid=1234567890"
 ];
 const input={itemSummaries:rows.map((itemAffiliateWebUrl,i)=>({
  itemId:"v1|"+i+"|0",title:"Example listing",itemAffiliateWebUrl,
  price:{value:"12.99",currency:"GBP"},itemLocation:{country:"GB"}
 }))};
 assert.deepEqual(normalizeEbayUkResults(input,true).map(x=>x.hasAffiliateTracking),[true,false,false,false,false]);
 assert.ok(normalizeEbayUkResults(input,false).every(x=>!x.hasAffiliateTracking));
});
test("OAuth and Browse endpoints share exactly one selected eBay environment",()=>{
 const lib=code("lib/ebay/private-uk-browse.ts");
 assert.match(lib,/https:\/\/api\.sandbox\.ebay\.com/);
 assert.match(lib,/https:\/\/api\.ebay\.com/);
 assert.match(lib,/EBAY_BROWSE_ENVIRONMENT/);
 assert.match(lib,/EBAY_BROWSE_PRODUCTION_APPROVED/);
 assert.match(lib,/EBAY_SANDBOX_CLIENT_SECRET/);
 assert.match(lib,/client_credentials/);
 assert.match(lib,/EBAY_GB/);
 assert.match(lib,/itemLocationCountry:GB/);
 assert.match(lib,/redirect:"error"/);
 assert.match(lib,/cache:"no-store"/);
 assert.doesNotMatch(lib,/NEXT_PUBLIC_|\.insert\(|\.upsert\(/);
});
test("Awin and eBay retailer control panel is private, review-only and links existing import tools",()=>{
 const page=code("app/control-centre/retailers/page.tsx");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf("createAdminClient()"));
 for(const route of ["/preview/ebay","/control-centre/feed-imports","/control-centre/product-readiness",
  "/control-centre/source-readiness"])assert.ok(page.includes(route),route);
 for(const text of ["joinedInSource","feed_permission_confirmed","robots:{index:false,follow:false}"]){
  assert.ok(page.includes(text),text);
 }
 assert.doesNotMatch(page,/\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
 const ui=code("app/preview/ebay/page.tsx");
 assert.ok(ui.indexOf("requireControlCentreAccess()")<ui.indexOf("ebayUkPrivateSearch(q)"));
 assert.match(ui,/Sandbox results are test data/);
 assert.match(ui,/EBAY_BROWSE_PRODUCTION_APPROVED=true/);
 assert.match(code("lib/control-centre/workspaces.ts"),/\/control-centre\/retailers/);
});
