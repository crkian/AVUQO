import test from "node:test";
import assert from "node:assert/strict";
import {
 AWIN_PROGRAMME_POLICY,programmePolicy,programmeAllowsAutomaticPublication,
 programmeAllowsInsuranceAffiliateLink,programmeAllowsPaidSearch
} from "../lib/awin/programme-policy-registry.ts";

test("seven advertiser policies retain exact Awin identities and categories",()=>{
 assert.equal(Object.keys(AWIN_PROGRAMME_POLICY).length,7);
 assert.deepEqual(programmePolicy("12715")?.feed_ids,["93988"]);
 assert.deepEqual(programmePolicy("15236")?.feed_ids,["26513"]);
 assert.equal(programmePolicy("3496")?.category,"travel/airport-extras");
 assert.equal(programmePolicy("128157")?.kind,"mobile_plan");
 assert.equal(programmePolicy("37738")?.kind,"mobile_plan");
 assert.equal(programmePolicy("45747")?.kind,"physical_products");
 assert.equal(programmePolicy("118401")?.css_separate_account,true);
 assert.equal(programmePolicy("0"),null);
});
test("terms and joining Awin never authorise automatic public product feed release",()=>{
 for(const id of Object.keys(AWIN_PROGRAMME_POLICY))
  assert.equal(programmeAllowsAutomaticPublication(id),false);
 assert.equal(programmeAllowsAutomaticPublication("999999"),false);
});
test("Holiday Extras insurance gate requires independently verified IAR",()=>{
 assert.equal(programmeAllowsInsuranceAffiliateLink("3496",false),false);
 assert.equal(programmeAllowsInsuranceAffiliateLink("3496",true),true);
 assert.equal(programmeAllowsInsuranceAffiliateLink("12715",true),false);
});
test("Pneus, Tyres UK, Holiday Extras and Lyca cannot auto-enter paid search",()=>{
 for(const id of ["12715","15236","3496","128157","45747"])
  assert.equal(programmeAllowsPaidSearch(id).permitted_in_principle,false);
 assert.equal(programmeAllowsPaidSearch("37738").needs_keyword_and_campaign_review,true);
 assert.equal(programmeAllowsPaidSearch("118401").needs_keyword_and_campaign_review,true);
});
