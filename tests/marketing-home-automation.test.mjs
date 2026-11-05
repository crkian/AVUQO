import test from "node:test";
import assert from "node:assert/strict";
import {validPublicCampaign,DEFAULT_CAMPAIGN} from "../lib/marketing/homepage-policy.ts";
import {nextEditorialRun} from "../lib/marketing/editorial-automation-policy.ts";
import {activeHomeSeasonalMoment} from "../lib/marketing/seasonal-calendar.ts";
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

test("UK home calendar activates Christmas build-up only within its annual window",()=>{
 assert.equal(activeHomeSeasonalMoment(new Date("2026-10-14T12:00:00Z")),null);
 assert.equal(activeHomeSeasonalMoment(new Date("2026-10-15T12:00:00Z"))?.stage,"early");
 assert.equal(activeHomeSeasonalMoment(new Date("2026-11-05T12:00:00Z"))?.stage,"early");
 assert.equal(activeHomeSeasonalMoment(new Date("2026-11-15T12:00:00Z"))?.stage,"planning");
 assert.equal(activeHomeSeasonalMoment(new Date("2026-12-15T12:00:00Z"))?.stage,"near");
 assert.equal(activeHomeSeasonalMoment(new Date("2026-12-26T12:00:00Z"))?.id,"christmas");
 assert.equal(activeHomeSeasonalMoment(new Date("2026-12-27T12:00:00Z")),null);
 assert.equal(activeHomeSeasonalMoment(new Date("2027-02-14T12:00:00Z")),null);
 assert.equal(activeHomeSeasonalMoment(new Date("2027-04-01T12:00:00Z")),null);
 assert.equal(activeHomeSeasonalMoment(new Date("2027-11-20T12:00:00Z"))?.id,"christmas");
 assert.equal(activeHomeSeasonalMoment(new Date("invalid")),null);
});
test("seasonal homepage copy has safe internal destinations and no fabricated offers",()=>{
 for(const day of ["2026-10-19","2026-11-18","2026-12-20"]){
   const moment=activeHomeSeasonalMoment(new Date(day+"T12:00:00Z"));
   assert.equal(moment?.href,"/christmas");
   assert.equal(/% off|guaranteed cheapest|delivery by|verified deal/i.test(moment?.summary??""),false);
 }
});
