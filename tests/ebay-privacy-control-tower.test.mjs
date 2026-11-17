import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ebayPrivacyReadiness,EBAY_WORK_SURFACES} from "../lib/ebay/privacy-control-tower.ts";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const present=(value=0)=>({value,error:false});
const missing=()=>({value:null,error:true});
function signals({
 source={status:"paused",syncEnabled:false,error:false},
 receipts=present(),links=present(),queue=present(),
 token=false,endpoint=false,
 browse={environment:"sandbox",credentialsConfigured:false,productionFlag:false,campaignConfigured:false}
}={}){
 const catalogue=Object.fromEntries([
  "offers","source_ingestion_items","price_history","product_matches"
 ].map(k=>[k,present()]));
 const workByState=Object.fromEntries([
  "pending","leased","awaiting_evidence","blocked"
 ].map(k=>[k,queue]));
 const workBySurface=Object.fromEntries(
  EBAY_WORK_SURFACES.map(([key])=>[key,queue])
 );
 return {source,receipts,links,catalogue,workByState,workBySurface,
 verificationTokenConfigured:token,endpointUrlMatches:endpoint,browse};
}
test("even perfect zero-count technical signals NEVER self-authorize eBay",()=>{
 const r=ebayPrivacyReadiness(signals({token:true,endpoint:true}));
 assert.equal(r.sourceQuarantined,true);
 assert.equal(r.countsKnown,true);
 assert.equal(r.journalReadable,true);
 assert.equal(r.registrationReady,false);
 assert.equal(r.completionAuthorised,false);
 assert.ok(r.blockers.some(x=>x.includes("lawful retention")));
 assert.ok(r.blockers.some(x=>x.includes("provider-signed")));
});
test("missing journal is not an empty queue and must fail closed",()=>{
 const r=ebayPrivacyReadiness(signals({queue:missing()}));
 assert.equal(r.journalReadable,false);
 assert.equal(r.countsKnown,false);
 assert.equal(r.activeWork,null);
 assert.equal(r.registrationReady,false);
 assert.ok(r.blockers.some(x=>x.includes("journal unapplied")));
});
test("source enabled or query errors never count as quarantined",()=>{
 for(const source of [
  {status:"active",syncEnabled:true,error:false},
  {status:"paused",syncEnabled:true,error:false},
  {status:null,syncEnabled:null,error:true}
 ]){
  const r=ebayPrivacyReadiness(signals({source,token:true,endpoint:true}));
  assert.equal(r.sourceQuarantined,false);
  assert.equal(r.registrationReady,false);
 }
});
test("unknown or negative counts are never treated as clean evidence",()=>{
 for(const value of [-1,1.5,NaN]){
  const s=signals();s.receipts=present(value);
  assert.equal(ebayPrivacyReadiness(s).countsKnown,false);
 }
});
test("read-only admin DB calls occur only after verified owner access",()=>{
 const page=read("app/control-centre/ebay-privacy/page.tsx");
 const server=read("lib/ebay/privacy-control-tower-server.ts");
 assert.ok(page.indexOf("await requireControlCentreAccess()")<
  page.indexOf("await loadEbayPrivacyControlTower()"));
 assert.match(page,/await connection\(\)/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(server,/import "server-only"/);
 assert.match(server,/createAdminClient\(\)/);
 assert.match(server,/count:"exact",head:true/);
 assert.match(server,/error:Boolean\(error\)\|\|count===null/);
 assert.match(server,/ebay_erasure_work_items/);
 assert.doesNotMatch(server,/\.insert\(|\.upsert\(|\.update\(|\.delete\(|\.rpc\(|\.storage\./);
 for(const forbidden of ["notification_digest","identity_digest","session_id","raw_data","metadata"])
  assert.ok(!server.includes('select("'+forbidden),forbidden);
 assert.doesNotMatch(page,/use client|onClick=|<form|submit/i);
 assert.match(page,/DO NOT save the verification token/);
 assert.match(page,/No data is changed/);
});
test("all seven mandatory deletion surfaces remain visible with cautious wording",()=>{
 const page=read("app/control-centre/ebay-privacy/page.tsx");
 assert.equal(EBAY_WORK_SURFACES.length,7);
 assert.match(page,/EBAY_WORK_SURFACES\.map/);
 assert.match(page,/not an empty queue/);
 assert.match(page,/No automatic activation/);
 assert.match(page,/separately authorised commerce integration/);
 const retailers=read("app/control-centre/retailers/page.tsx");
 assert.match(retailers,/href="\/control-centre\/ebay-privacy"/);
});

test("Control Tower never treats zero counts or a Browse flag as operational approval",()=>{
 const productionBrowse={environment:"production",credentialsConfigured:true,
  productionFlag:true,campaignConfigured:true};
 const zero=ebayPrivacyReadiness(signals({token:true,endpoint:true,browse:productionBrowse}));
 assert.equal(zero.browseConfigurationPresent,true);
 assert.equal(zero.queueAggregateComplete,false);
 assert.equal(zero.registrationReady,false);
 assert.equal(zero.completionAuthorised,false);
 const withReceipt=signals({token:true,endpoint:true,browse:productionBrowse,receipts:present(1),queue:present(1)});
 const aligned=ebayPrivacyReadiness(withReceipt);
 assert.equal(aligned.queueAggregateComplete,true);
 assert.equal(aligned.registrationReady,false);
 assert.equal(aligned.completionAuthorised,false);
 withReceipt.workBySurface.external_processors=missing();
 assert.equal(ebayPrivacyReadiness(withReceipt).queueAggregateComplete,false);
});
test("owner eBay dashboard shows actual Browse and privacy gates without private key values",()=>{
 const page=read("app/control-centre/ebay-privacy/page.tsx");
 const server=read("lib/ebay/privacy-control-tower-server.ts");
 assert.match(server,/ebayPilotReadiness/);
 assert.match(page,/eBay production buying and notification readiness/);
 assert.match(page,/readiness\.queueAggregateComplete/);
 assert.match(page,/readiness\.browseConfigurationPresent/);
 assert.match(page,/NOT AUTHORISED/);
 assert.match(page,/affiliate referrals and future separately authorised embedded checkout or dropshipping/);
 assert.doesNotMatch(page,/EBAY_CLIENT_SECRET|EBAY_DELETION_HMAC_SECRET/);
});
