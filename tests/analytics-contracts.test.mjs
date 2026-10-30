import test from "node:test";
import assert from "node:assert/strict";
import {ANALYTICS_EVENT_VERSION,ANALYTICS_EVENTS,isAnalyticsName,sanitizeAnalyticsProperties,MEASUREMENT_GATES} from "../lib/analytics/contracts.ts";
test("first-party measurement is gated off until consent acceptance",()=>{
 assert.equal(ANALYTICS_EVENT_VERSION,1);
 assert.equal(MEASUREMENT_GATES.clientCollectionEnabled,false);
 assert.equal(MEASUREMENT_GATES.browserIdentityEnabled,false);
 assert.equal(MEASUREMENT_GATES.advertisingMeasurementEnabled,false);
});
test("only versioned known event names qualify",()=>{
 assert.equal(isAnalyticsName("grocery_complete_basket_available"),true);
 assert.equal(isAnalyticsName("affiliate_sale_assumed"),false);
 assert.ok(ANALYTICS_EVENTS.includes("merchant_link_clicked"));
});
test("rejects raw queries, email, phone and unknown properties",()=>{
 for(const bad of [{query:"a private search"},{route:"/?q=foo@example.com"},
  {route:"/deals",email:"private@example.com"},{route:"https://external.test/"},
  {source_channel:"my phone 07700900123"},{foo:"bar"}])
    assert.equal(sanitizeAnalyticsProperties(bad),null);
});
test("safe categorical values can pass without collecting PII",()=>{
 assert.deepEqual(sanitizeAnalyticsProperties({route:"/groceries",result_count:0,basket_complete:false}),
  {route:"/groceries",result_count:0,basket_complete:false});
});
test("a merchant click is never defined as a sale",()=>{
 assert.equal(MEASUREMENT_GATES.revenueFromClicks,false);
});
