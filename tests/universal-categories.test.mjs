import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {UNIVERSAL_DEPARTMENTS,EXISTING_CATEGORY_PARENTS,validateUniversalTaxonomy} from "../lib/taxonomy/universal-categories.mjs";
import {generateUniversalSeed} from "../scripts/generate-universal-taxonomy-seed.mjs";

const summary=validateUniversalTaxonomy();
const candidates=UNIVERSAL_DEPARTMENTS.flatMap(g=>[...(g.existing?[]:[g.slug]),...g.children.map(x=>x.slug)]);

test("taxonomy is broad, unique and structurally valid",()=>{
 assert.equal(summary.ok,true,summary.errors.join("; "));
 assert.ok(summary.departments>=60);
 assert.ok(summary.newDepartments>=60);
 assert.ok(summary.children>=1200);
 assert.equal(new Set(candidates).size,candidates.length);
});
test("existing AVUQO category parents are preserved rather than re-created",()=>{
 for(const slug of ["tech","home","fashion","gifts","beauty","motoring","travel","experiences","crafts","pets","keyboards","chocolate-gifts"])
   assert.ok(EXISTING_CATEGORY_PARENTS.includes(slug));
 assert.ok(UNIVERSAL_DEPARTMENTS.some(g=>g.slug==="keyboards"&&g.existing));
 assert.equal(candidates.includes("keyboards"),false);
});
test("nested departments are connected to existing or new parents",()=>{
 const known=new Set([...EXISTING_CATEGORY_PARENTS,...UNIVERSAL_DEPARTMENTS.map(g=>g.slug)]);
 for(const group of UNIVERSAL_DEPARTMENTS){
   if(group.parentSlug)assert.ok(known.has(group.parentSlug),group.slug);
   for(const leaf of group.children)assert.equal(leaf.parentSlug,group.slug);
 }
});
test("specialist categories cover UK retail and planned service areas",()=>{
 for(const slug of ["craft-needlework-crochet-kits","grocery-food-fresh-fruit","baby-nursery-car-seats",
    "sports-fitness-football","computers-tablets-laptops","home-services-plumbers",
    "travel-booking-flights","insurance-finance-home-insurance"]){
   assert.ok(candidates.includes(slug),slug);
 }
});
test("committed SQL is generated and publication stays explicitly off",()=>{
 const expected=generateUniversalSeed();
 const actual=readFileSync(new URL("../supabase/seeds/20261030_universal_inactive_categories.sql",import.meta.url),"utf8");
 assert.equal(actual,expected,"Rerun node scripts/generate-universal-taxonomy-seed.mjs");
 assert.match(actual,/on conflict\(slug\) do nothing/);
 assert.match(actual,/description,is_active\)/);
 assert.match(actual,/false\nfrom pg_temp/);
 assert.doesNotMatch(actual,/\bupdate public\.categories\b/i);
 assert.doesNotMatch(actual,/\bdelete from\b/i);
 assert.doesNotMatch(actual,/\bproducts\s+set\b/i);
});
