import test from "node:test";
import assert from "node:assert/strict";
import {PILOT_PREVIEWS,BRAND_PREVIEWS,findPilotPreview,findBrandPreview,productsForBrand,privatePilotHref,privateBrandHref,independentBrandPolicy} from "../lib/products/private-preview.ts";
test("all eight private pilots have unique individual preview layouts and story prompts",()=>{
 assert.equal(PILOT_PREVIEWS.length,8);
 assert.equal(new Set(PILOT_PREVIEWS.map(x=>x.slug)).size,8);
 for(const p of PILOT_PREVIEWS){
  assert.deepEqual(findPilotPreview(p.slug),p);
  assert.ok(p.storyHeadline.length>20);
  assert.ok(p.suggestedTitle.length>10);
  assert.equal(p.prompts.length,3);
  assert.equal(p.checks.length,4);
  assert.match(privatePilotHref(p.slug),/^\/control-centre\/pilot-products\//);
  assert.ok(findBrandPreview(p.brandSlug));
 }
});
test("private branded areas are non-official editorial collections",()=>{
 assert.equal(BRAND_PREVIEWS.length,5);
 for(const b of BRAND_PREVIEWS){
  assert.ok(productsForBrand(b.slug).length>0);
  assert.match(privateBrandHref(b.slug),/^\/control-centre\/brand-previews\//);
  assert.match(b.introduction,/not an official|not a company-operated|without any claim|no brand assets|not an official manufacturer/i);
 }
});
test("paid or company-controlled destinations cannot affect independent AVUQO outcomes",()=>{
 const p=independentBrandPolicy();
 assert.equal(p.implyOfficialPartnership,false);
 assert.equal(p.brandLogoRightsAssumed,false);
 assert.equal(p.sponsorCanInfluenceAVUQOScore,false);
 assert.equal(p.sponsorCanInfluenceOrganicRank,false);
 assert.equal(p.liveAdServing,false);
});

test("imported title with stray punctuation has a clean proposed display label",()=>{
 const item=findPilotPreview("pilot-craft-buddy-reindeer-3d-puzzle-kit");
 assert.equal(item?.suggestedTitle,"Craft Buddy Reindeer 3D Puzzle Kit");
});
