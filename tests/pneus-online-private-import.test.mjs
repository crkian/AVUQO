import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {readFileSync} from "node:fs";
import {pneusPrivateSourceGate,locatePneusFeed,validatePneusIdentity,pneusPrivateObjectKey,
 pneusPrivateHeader,preparePneusPrivateBatch}
 from "../lib/awin/pneus-online-private.ts";

const programme={advertiser_id:"15236",joined_programme_observed:true,
 feed_permission_confirmed:false,approval_evidence_ref:"",valid_until:""};
const source={status:"paused",sync_enabled:false,metadata:{awin_advertisers:[programme]}};
const authorized={...source,metadata:{awin_advertisers:[
 {...programme,feed_permission_confirmed:true,approval_evidence_ref:"OWNER_APPROVAL_REFERENCE_2026"}]}};
test("unconfirmed joined feed cannot be downloaded or staged",()=>{
 assert.equal(pneusPrivateSourceGate(source),"feed_permission_unconfirmed");
 assert.equal(pneusPrivateSourceGate({...authorized,status:"active"}),"source_not_paused");
 assert.equal(pneusPrivateSourceGate({...authorized,sync_enabled:true}),"source_not_paused");
 assert.equal(pneusPrivateSourceGate({...authorized,metadata:{awin_advertisers:[]}}),"programme_not_joined");
 assert.equal(pneusPrivateSourceGate({...authorized,metadata:{awin_advertisers:[
  {...programme,feed_permission_confirmed:true,approval_evidence_ref:""}]}}),"approval_evidence_missing");
 assert.equal(pneusPrivateSourceGate({...authorized,metadata:{awin_advertisers:[
  {...programme,feed_permission_confirmed:true,approval_evidence_ref:"REF-VALID-003",valid_until:"2020-01-01"}]}}),"approval_expired");
 assert.equal(pneusPrivateSourceGate(authorized),"ready");
});
test("Awin feed inventory must match exactly one active seller and feed ID",()=>{
 const header=["Advertiser ID","Membership Status","Feed ID","Datafeed Format","URL"];
 const row=["15236","active","26513","Awin","https://example.invalid/not-a-real-feed"];
 assert.equal(locatePneusFeed(header,[row]),row[4]);
 assert.throws(()=>locatePneusFeed(header,[[...row.slice(0,2),"26514",...row.slice(3)]]));
 assert.throws(()=>locatePneusFeed(header,[row,row]));
 assert.throws(()=>locatePneusFeed(header,[[...row.slice(0,3),"Google",row[4]]]));
 assert.throws(()=>locatePneusFeed(header,[[...row.slice(0,1),"pending",...row.slice(2)]]));
});
test("cross-advertiser and duplicate merchant product IDs fail closed",()=>{
 const header=["merchant_id","merchant_product_id","product_name","search_price","currency"];
 const seen=new Set();
 validatePneusIdentity(header,["15236","retailer-sku-1","Tyre A","99.00","GBP"],seen);
 assert.throws(()=>validatePneusIdentity(header,["15236","retailer-sku-1","Tyre A","99.00","GBP"],seen));
 assert.throws(()=>validatePneusIdentity(header,["12715","retailer-sku-2","Tyre B","99.00","GBP"],seen));
 assert.throws(()=>validatePneusIdentity(header,["15236","sku-3","Tyre C"],seen));
});
test("content-addressed private snapshot path has no user-supplied host or source URL",()=>{
 const digest="a".repeat(64);
 assert.equal(pneusPrivateObjectKey(digest),"pneus-online/15236/26513/"+digest+".csv.gz");
 assert.throws(()=>pneusPrivateObjectKey("https://example.com/foo"));
});

test("large authenticated Pneus feed has resumable execution time and stage-only failure diagnostics",()=>{
 const code=readFileSync("app/api/internal/awin-pneus-private-import/route.ts","utf8");
 assert.match(code,/export const maxDuration=300/);
 for(const stage of ["source_gate","job_lookup","resume_snapshot","credentials","capture_snapshot"])
  assert.ok(code.includes('stage="'+stage+'"'),stage);
 assert.match(code,/diagnostic_stage:stage,no_publication:true,private_only:true/);
 assert.match(code,/pneusPrivateSourceGate/);
 assert.match(code,/validatePneusIdentity/);
 assert.doesNotMatch(code,/console\.(log|warn|error)\(.*(downloadUrl|key|publisher|bytes)/);
});

const leanHeader=["merchant_id","merchant_product_id","product_name","search_price",
 "aw_deep_link","in_stock"];
const privateRow=["15236","pneus-tyre-1","Synthetic private tyre","89.99",
 "https://www.awin1.com/pclick.php?m=15236&a=3135746&p=123","1"];
test("Pneus source without currency is archived only as excluded private evidence",()=>{
 assert.deepEqual(pneusPrivateHeader(leanHeader),{sourceCurrencyExplicit:false});
 const [row]=preparePneusPrivateBatch("15236","26513",leanHeader,[privateRow]);
 assert.equal(row.status,"excluded");
 assert.equal(row.currency,"");
 assert.ok(row.reasons.includes("explicit_currency_missing"));
 assert.equal(row.metadata.source_currency_explicit,false);
 assert.equal(row.metadata.price_observation_kind,"private_unverified_currency");
 assert.equal(row.metadata.tyre_fitment_verified,false);
 assert.equal(row.metadata.release_approved,false);
 assert.equal(row.metadata.canonical_category_approved,false);
 const code=readFileSync("app/api/internal/awin-pneus-private-import/route.ts","utf8");
 assert.match(code,/preparePneusPrivateBatch\(PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,header,batch\)/);
 assert.match(code,/if\(!sourceCurrencyExplicit&&excluded!==count\)/);
 assert.match(code,/no_publication:true/);
});
test("Pneus exact advertiser and explicit currency cannot be forged",()=>{
 const withCurrency=[...leanHeader,"currency"];
 const [verified]=preparePneusPrivateBatch("15236","26513",withCurrency,[[...privateRow,"GBP"]]);
 assert.equal(verified.currency,"GBP");
 assert.equal(verified.metadata.source_currency_explicit,true);
 const [notGbp]=preparePneusPrivateBatch("15236","26513",withCurrency,[[...privateRow,"EUR"]]);
 assert.equal(notGbp.status,"excluded");
 assert.ok(notGbp.reasons.includes("unexpected_currency"));
 assert.throws(()=>preparePneusPrivateBatch("12715","26513",leanHeader,[privateRow]),/pneus_exact_feed_required/);
 assert.throws(()=>preparePneusPrivateBatch("15236","26513",leanHeader,[[...privateRow.slice(0,1),"bad","title","80",privateRow[4],"1"]].map(r=>r.map((v,i)=>i===0?"9999":v))),/Cross-advertiser/);
 assert.throws(()=>pneusPrivateHeader(["merchant_id","merchant_id",...leanHeader.slice(2)]),/pneus_invalid_column_layout/);
});
