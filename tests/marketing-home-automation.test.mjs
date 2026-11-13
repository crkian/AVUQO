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

test("homepage scheduling uses an inclusive start and exclusive end", async () => {
 const {homePlacementState}=await import("../lib/marketing/homepage-policy.ts");
 const start="2026-12-01T00:00:00Z",end="2026-12-02T00:00:00Z";
 assert.equal(homePlacementState("approved",start,end,new Date("2026-11-30T23:59:59Z")),"scheduled");
 assert.equal(homePlacementState("approved",start,end,new Date(start)),"live");
 assert.equal(homePlacementState("approved",start,end,new Date(end)),"ended");
 assert.equal(homePlacementState("paused",start,end,new Date(start)),"paused");
});

test("anonymous homepage rotation orders only by publicly granted columns", async () => {
 const {readFileSync}=await import("node:fs");
 const reader=readFileSync("lib/marketing/homepage.ts","utf8");
 const sql=readFileSync("supabase/migrations/20261029220000_marketing_homepage_public_column_least_privilege.sql","utf8");
 const granted=sql.match(/grant select \(([^)]+)\)/i)[1].split(",").map(name=>name.trim());
 for(const [,column] of reader.matchAll(/\.order\("([^"]+)"/g))assert.ok(granted.includes(column),column);
});
