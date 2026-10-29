import test from "node:test";
import assert from "node:assert/strict";
import {validPublicCampaign,DEFAULT_CAMPAIGN} from "../lib/marketing/homepage-policy.ts";
import {nextEditorialRun} from "../lib/marketing/editorial-automation-policy.ts";
test("homepage campaign rejects external or protocol-relative URLs",()=>{
 const base={id:"x",title:"A featured AVUQO guide",summary:"Find a useful AVUQO guide on total cost.",cta_label:"Explore now",href:"/products",sponsored:false};
 assert.equal(validPublicCampaign({...base,href:"https://evil.example"}),null);
 assert.equal(validPublicCampaign({...base,href:"//evil.example"}),null);
 assert.equal(validPublicCampaign(base)?.href,"/products");
});
test("default homepage message has a safe internal destination",()=>{
 assert.equal(DEFAULT_CAMPAIGN.href,"/discover");
});
test("automation cadence rejects dangerous frequency",()=>{
 assert.throws(()=>nextEditorialRun(new Date("2026-10-29"),1));
 assert.equal(nextEditorialRun(new Date("2026-10-29"),3),"2026-11-01T00:00:00.000Z");
});
