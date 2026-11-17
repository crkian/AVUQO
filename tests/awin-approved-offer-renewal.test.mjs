import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {canRenewApprovedAwinOffer} from "../lib/awin/approved-offer-renewal.ts";

const now=new Date().toISOString();
const tracked="https://www.awin1.com/pclick.php?m=736&a=3135746&p=12345";
const base={
 sourceId:"source",offerId:"offer",productId:"product",advertiserId:"736",
 merchantId:"merchant",priorMerchantId:"merchant",
 priorAffiliateUrl:tracked,affiliateUrl:tracked,
 price:12.95,currency:"GBP",stockStatus:"in_stock",
 matchConfidence:0.98,score:83,scoreConfidence:78,
 publishingEnabled:true,rightsVerified:true,
 priorPublished:{status:"published",product_id:"product",current_price:12.95},
 approval:{status:"approved",source_id:"source",advertiser_id:"736",
  reviewed_price:12.95,reviewed_offer_at:now,reviewed_score_at:now}
};
test("only an already-published and owner-approved unchanged offer can renew",()=>{
 assert.equal(canRenewApprovedAwinOffer(base),true);
 assert.equal(canRenewApprovedAwinOffer({...base,priorPublished:null}),false);
 assert.equal(canRenewApprovedAwinOffer({...base,approval:null}),false);
 assert.equal(canRenewApprovedAwinOffer({...base,approval:{...base.approval,status:"paused"}}),false);
 assert.equal(canRenewApprovedAwinOffer({...base,priorPublished:{...base.priorPublished,status:"held"}}),false);
});
test("never renew across prices, product identity, merchant, rights or publisher",()=>{
 const cases=[
  {...base,price:13.95},{...base,currency:"USD"},
  {...base,priorPublished:{...base.priorPublished,current_price:99}},
  {...base,productId:"different"},{...base,priorMerchantId:"different"},
  {...base,publishingEnabled:false},{...base,rightsVerified:false},
  {...base,advertiserId:"735"},{...base,approval:{...base.approval,source_id:"elsewhere"}},
  {...base,approval:{...base.approval,reviewed_price:13.95}},
  {...base,affiliateUrl:"https://example.com/item"},
  {...base,affiliateUrl:"https://www.awin1.com/pclick.php?m=736&a=123&p=12345"},
  {...base,affiliateUrl:tracked.replace("p=12345","p=45678")}
 ];
 for(const candidate of cases)assert.equal(canRenewApprovedAwinOffer(candidate),false,JSON.stringify(candidate).slice(0,130));
});
test("never renew out of stock, insufficient score or inaccurate match",()=>{
 for(const candidate of [
  {...base,stockStatus:"out_of_stock"},{...base,stockStatus:"unknown"},
  {...base,score:59},{...base,scoreConfidence:54},{...base,matchConfidence:0.84},
  {...base,approval:{...base.approval,reviewed_offer_at:"not a date"}},
 ])assert.equal(canRenewApprovedAwinOffer(candidate),false);
});
test("existing publication path checks approvals and immediately holds mismatches",()=>{
 const pipeline=readFileSync("lib/pipeline/run.ts","utf8");
 const publicCatalog=readFileSync("lib/products/public-catalog.ts","utf8");
 assert.match(pipeline,/source\.connector_key!=="awin"\|\|renewExistingAwin/);
 assert.match(pipeline,/approvalError\|\|publicError/);
 assert.match(pipeline,/status: shouldPublish \? "published" : "held"/);
 assert.match(pipeline,/priorOffer\.product_id===product\.productId/);
 assert.match(publicCatalog,/approval\.status!=="approved"/);
 assert.match(publicCatalog,/Number\(approval\.reviewed_price\)!==Number\(offer\.price\)/);
 assert.match(publicCatalog,/Date\.parse\(score\.calculated_at\)<Date\.parse\(approval\.reviewed_score_at\)/);
 assert.match(publicCatalog,/Date\.now\(\)-Date\.parse\(score\.calculated_at\)>48\*3600_000/);
});
