import test from "node:test";
import assert from "node:assert/strict";
import {tyreBrandSlug,resolveTyreBrand,tyreEvidence,tyreSizeHref,
 tyreSizeQuery,tyreCollections,tyreBrandNames} from "../lib/tyres/catalogue.ts";
test("brand slugs are predictable, stable and cannot silently merge collisions",()=>{
 assert.equal(tyreBrandSlug("BF Goodrich"),"bf-goodrich");
 assert.equal(tyreBrandSlug("HANKOOK"),"hankook");
 assert.equal(resolveTyreBrand("hankook",["Continental","HANKOOK"]),"HANKOOK");
 assert.equal(resolveTyreBrand("hankook",["HANKOOK","Hankook"]),null);
 assert.equal(resolveTyreBrand("bad/slug",["HANKOOK"]),null);
 assert.equal(new Set(tyreBrandNames.map(tyreBrandSlug)).size,tyreBrandNames.length);
});
test("tyre category paths are unique and are editorial readiness gates, not live product classes",()=>{
 assert.equal(new Set(tyreCollections.map(c=>c.slug)).size,tyreCollections.length);
 assert.ok(tyreCollections.every(c=>c.readiness&&c.description));
});
test("historical size candidates are never represented as verified fitment",()=>{
 const result=tyreEvidence({tyre_size_candidate:{width_mm:235,aspect_ratio:35,rim_inches:19},
  load_index_candidate:"91",speed_rating_candidate:"Y",tyre_size_verified:false});
 assert.equal(result.size,"235/35 R19");
 assert.equal(result.load,"91");
 assert.equal(result.speed,"Y");
 assert.equal(result.source,"Tyres UK historical feed · unverified");
 assert.equal(tyreSizeHref(result),"/preview/tyres/sizes?width=235&profile=35&rim=19");
});
test("incomplete, invalid and contradictory sizing does not invent a fitment",()=>{
 assert.equal(tyreEvidence({tyre_size_candidate:{width_mm:900,aspect_ratio:35,rim_inches:19}}).size,null);
 assert.equal(tyreEvidence({tyre_size_candidate:{width_mm:235,aspect_ratio:35,rim_inches:19},tyre_size_conflict:true}).size,null);
 assert.equal(tyreEvidence({tyre_size_candidate:{width_mm:235,aspect_ratio:35}}).size,null);
 assert.equal(tyreEvidence({load_index_candidate:"91Y",speed_rating_candidate:"YY"}).load,null);
 assert.equal(tyreEvidence({load_index_candidate:"91Y",speed_rating_candidate:"YY"}).speed,null);
 assert.equal(tyreEvidence(null).size,null);
});
test("size finder accepts only bounded numeric dimensions",()=>{
 assert.equal(tyreSizeQuery("235",125,385),"235");
 assert.equal(tyreSizeQuery("035",125,385),"");
 assert.equal(tyreSizeQuery("120",125,385),"");
 assert.equal(tyreSizeQuery("235;drop table",125,385),"");
 assert.equal(tyreSizeQuery("19",10,26),"19");
});
