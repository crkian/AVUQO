import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {categoryDetail} from "../lib/feed-imports/category-detail.ts";

test("gifts show title-derived pack information and request allergens",()=>{
 const x=categoryDetail("Cadbury Gifts Direct","Cadbury Chocolate Gift 250g 12 bars","Chocolate","Cadbury");
 assert.equal(x.heading,"Gift and chocolate details");
 assert.ok(x.facts.some(f=>f.value==="250g"));
 assert.ok(x.missing.includes("Allergens and ingredients"));
});
test("pet product layout requests compatibility and only extracts title values",()=>{
 const x=categoryDetail("Petlibro UK Affiliate Program","Cat Water Fountain 2.5L",null,"Petlibro");
 assert.equal(x.heading,"Pet product details");
 assert.ok(x.facts.some(f=>f.value==="2.5L"));
 assert.ok(x.missing.includes("Compatibility"));
});
test("craft and keyboard views differ without invented facts",()=>{
 const craft=categoryDetail("Craft Buddy Shop","Craft kit 120 pieces","Arts & Crafts",null);
 const tech=categoryDetail("AKKO UK","ISO 75% mechanical keyboard",null,null);
 assert.equal(craft.heading,"Creative product details");
 assert.ok(craft.facts.some(f=>f.value==="120 pieces"));
 assert.equal(tech.heading,"Technical specifications");
 assert.ok(tech.missing.includes("Warranty"));
});
test("unknown item stays unclassified",()=>{
 const x=categoryDetail("Unknown seller","Mystery item",null,null);
 assert.equal(x.heading,"Product details awaiting classification");
 assert.equal(x.facts.length,0);
 assert.ok(x.missing.includes("Verified category"));
});
test("individual preview is authenticated, not indexed, and cannot sell",()=>{
 const page=readFileSync("app/preview/products/[id]/page.tsx","utf8");
 const photo=readFileSync("app/preview/products/[id]/PrivateProductPhoto.tsx","utf8");
 assert.ok(page.indexOf("await requireControlCentreAccess()")<page.indexOf('db.from("feed_import_records")'));
 assert.match(page,/index:false,follow:false/);
 assert.match(page,/Retailer checkout unavailable/);
 assert.match(photo,/useState\(false\)/);
 assert.match(photo,/allowed\.has\(u.hostname\)/);
});
