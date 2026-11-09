import test from "node:test";
import assert from "node:assert/strict";
import {pneusPrivateSourceGate,locatePneusFeed,validatePneusIdentity,pneusPrivateObjectKey}
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
