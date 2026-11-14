import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {RESEARCH_PRODUCT_GUIDES,researchGuideBySlug,researchGuidesByDepartment}
 from "../lib/products/research-guides.ts";

const src=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("only four verified-identity editorial research guides are allowlisted, with no offer data",()=>{
 assert.equal(RESEARCH_PRODUCT_GUIDES.length,4);
 assert.equal(new Set(RESEARCH_PRODUCT_GUIDES.map(x=>x.slug)).size,4);
 for(const guide of RESEARCH_PRODUCT_GUIDES){
  assert.match(guide.slug,/^[a-z0-9][a-z0-9-]{2,159}$/);
  assert.ok(guide.title.length>15);
  assert.ok(guide.teaser.length>30);
  assert.ok(guide.modelNote.length>25);
  assert.equal(guide.checklist.length,3);
  assert.ok(["tech","home"].includes(guide.department));
  assert.deepEqual(Object.keys(guide).sort(),[
   "brand","checklist","department","manufacturerInfoUrl","modelNote","slug","teaser","title"
  ].sort());
  assert.doesNotMatch(JSON.stringify(guide),/£\s*\d|(?:https?:\/\/)[^"']*\.jpg/i);
  const url=new URL(guide.manufacturerInfoUrl);
  assert.equal(url.protocol,"https:");
  assert.ok(new Set(["support.apple.com","www.sharkninja.co.uk","www.dyson.co.uk","www.lg.com"]).has(url.host));
  assert.equal(researchGuideBySlug(guide.slug),guide);
 }
});
test("draft affiliate pilot items and arbitrary slug lookups are not public research guides",()=>{
 assert.equal(researchGuideBySlug("pilot-cadbury-heroes-pouch-300g"),undefined);
 assert.equal(researchGuideBySlug("pilot-petlibro-dockstream-rfid-fountain"),undefined);
 assert.equal(researchGuideBySlug("pilot-akko-shiny-kitten-5108-v5"),undefined);
 assert.equal(researchGuideBySlug("anything-else"),undefined);
 assert.equal(researchGuidesByDepartment("pets").length,0);
 assert.equal(researchGuidesByDepartment("tech").length,2);
 assert.equal(researchGuidesByDepartment("home").length,2);
});
test("verified offer route retains admission priority and research fallback is noindex",()=>{
 const route=src("app/products/[slug]/page.tsx");
 assert.match(route,/const record=await verifiedProduct\(slug\)/);
 assert.match(route,/const entry=await verifiedProduct\(slug\)/);
 assert.match(route,/const guide=researchGuideBySlug\(slug\)/);
 assert.match(route,/if\(!guide\)notFound\(\)/);
 assert.match(route,/return <ResearchProductDetails guide=\{guide\}\/>/);
 assert.match(route,/robots:\{index:false,follow:true\}/);
 assert.match(route,/if\(!entry\)/);
 assert.match(route,/const \{product\}=entry/);
});
test("research detail has no price, merchant media, outbound affiliate or saved-basket action",()=>{
 const detail=src("components/products/ResearchProductDetails.tsx");
 assert.match(detail,/Retailer comparison status/);
 assert.match(detail,/Not verified yet/);
 assert.match(detail,/No current retailer price, discount, stock claim/);
 assert.match(detail,/guide\.manufacturerInfoUrl/);
 assert.match(detail,/rel="noopener noreferrer"/);
 assert.match(detail,/not a manufacturer product photograph/);
 assert.doesNotMatch(detail,/<img\b/);
 assert.doesNotMatch(detail,/href=\{[`"']?\/go\//);
 assert.doesNotMatch(detail,/AddToCollectionButton/);
 assert.doesNotMatch(detail,/published_deals|\.from\("offers"\)/);
});
test("home, public /products, and departments reveal research guides without modifying verified offers",()=>{
 const index=src("app/products/page.tsx");
 const home=src("components/home/HomeShoppingDashboard.tsx");
 const department=src("app/categories/[department]/products/page.tsx");
 assert.match(index,/RESEARCH_PRODUCT_GUIDES\.map/);
 assert.match(index,/Retailer offers not verified yet/);
 assert.match(index,/verifiedProductIndex\(48\)/);
 assert.match(home,/RESEARCH_PRODUCT_GUIDES\.slice\(0,3\)/);
 assert.match(home,/Research guide · No verified retailer price/);
 assert.match(home,/picked\.length\?picked\.map/);
 assert.match(department,/researchGuidesByDepartment\(department\)/);
 assert.match(department,/matching=verified\.filter/);
 assert.match(department,/No verified retailer offers yet/);
});
