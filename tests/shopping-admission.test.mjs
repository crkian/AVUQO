import test from "node:test";
import assert from "node:assert/strict";
import {shoppingAdmissionFailures} from "../lib/products/shopping-admission.ts";

const now=Date.parse("2026-11-24T18:00:00.000Z");
const valid=()=>({
 advertiserId:"12345",sourceOfferId:"12345:sku-001",sku:"sku-001",currency:"GBP",
 price:42.50,stock:"in_stock",lastSeenAt:new Date(now-3600_000).toISOString(),
 verifiedAt:new Date(now-3600_000).toISOString(),feedDigest:"a".repeat(64),
 affiliateUrl:"https://www.awin1.com/pclick.php?m=12345&a=3135746&p=sku-001",
 matchConfidence:0.98,sourceCurrencyExplicit:true,exactSourceMatch:true,
 sourceRights:true,programmeApproved:true,ownerGrant:true,
 controlsEnabled:true,reviewStatus:"approved"
});
const failures=(patch={})=>shoppingAdmissionFailures({...valid(),...patch},now);
test("eligible ordinary shopping inventory has no deal-score requirement",()=>{
 assert.deepEqual(failures(),[]);
});
test("owner stop and missing approval fail closed",()=>{
 assert.ok(failures({controlsEnabled:false}).includes("controls_disabled"));
 assert.ok(failures({ownerGrant:false}).includes("rights_or_owner_grant_missing"));
 assert.ok(failures({sourceRights:false}).includes("rights_or_owner_grant_missing"));
 assert.ok(failures({programmeApproved:false}).includes("rights_or_owner_grant_missing"));
 assert.ok(failures({reviewStatus:"withdrawn"}).includes("review_not_approved"));
});
test("exact merchant SKU and corroboration are mandatory",()=>{
 assert.ok(failures({sourceOfferId:"12345:other"}).includes("exact_source_identity_missing"));
 assert.ok(failures({exactSourceMatch:false}).includes("exact_source_identity_missing"));
});
test("GBP must be explicit and price valid",()=>{
 assert.ok(failures({currency:"USD"}).includes("explicit_gbp_price_missing"));
 assert.ok(failures({sourceCurrencyExplicit:false}).includes("explicit_gbp_price_missing"));
 assert.ok(failures({price:0}).includes("explicit_gbp_price_missing"));
});
test("stock, recency and digest evidence cannot be fabricated",()=>{
 assert.ok(failures({stock:"unknown"}).includes("stock_unverified"));
 assert.ok(failures({lastSeenAt:new Date(now-49*3600_000).toISOString()}).includes("fresh_authenticated_evidence_missing"));
 assert.ok(failures({feedDigest:"unknown"}).includes("fresh_authenticated_evidence_missing"));
});
test("publisher attribution and confidence remain mandatory",()=>{
 assert.ok(failures({affiliateUrl:"https://example.com/item"}).includes("publisher_link_invalid"));
 assert.ok(failures({affiliateUrl:"https://www.awin1.com/pclick.php?m=12345&a=999&p=sku-001"}).includes("publisher_link_invalid"));
 assert.ok(failures({matchConfidence:0.5}).includes("identity_confidence_insufficient"));
});

test("recognised UK-only retailer feeds accept GBP without pretending it was explicit",()=>{
 for(const [advertiserId,feedId,currencyBasis] of [
 ["496","89987","tooled_up_uk_GBP_storefront_and_exact_staged_price_match"],
 ["77952","103580","petlibro_uk_programme_gbp"],["736","48599","cadbury_uk_programme_gbp"]]){
 const patch={advertiserId,sourceOfferId:advertiserId+":sku-001",affiliateUrl:"https://www.awin1.com/pclick.php?m="+advertiserId+"&a=3135746&p=sku-001",sourceCurrencyExplicit:false,feedId,currencyBasis};
 assert.deepEqual(failures(patch),[]);
 assert.ok(failures({...patch,currency:"EUR"}).includes("explicit_gbp_price_missing"));
 assert.ok(failures({...patch,feedId:"unknown"}).includes("explicit_gbp_price_missing"));
 assert.ok(failures({...patch,currencyBasis:"unverified"}).includes("explicit_gbp_price_missing"));
 }
});
