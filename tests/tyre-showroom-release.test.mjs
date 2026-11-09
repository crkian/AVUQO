import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
test("tyre homepage uses first-party art and real noncommercial size guide form",()=>{
 const page=read("app/tyres/page.tsx");
 const art=read("app/tyres/TyreWheelVisual.tsx");
 assert.match(page,/action="\/tyres\/sizes"/);
 assert.match(page,/name="width"/);
 assert.match(page,/name="profile"/);
 assert.match(page,/name="rim"/);
 assert.match(page,/Understand this size/);
 assert.match(art,/Original AVUQO vector artwork/);
 assert.doesNotMatch(page,/feed_import_records|published_deals|[£]\d/);
});
test("manufacturer and type guide routes never expose private catalogues",()=>{
 const paths=[
  "app/tyres/brands/page.tsx",
  "app/tyres/brands/[slug]/page.tsx",
  "app/tyres/categories/[slug]/page.tsx"
 ];
 for(const p of paths){
  const page=read(p);
  assert.match(page,/index:false/);
  assert.doesNotMatch(page,/feed_import_records|createAdminClient|SUPABASE_SERVICE_ROLE/);
 }
});
test("private tyre catalogue and product routes remain role checked",()=>{
 for(const p of [
  "app/preview/tyres/page.tsx",
  "app/preview/tyres/sizes/page.tsx",
  "app/preview/tyres/brands/[slug]/page.tsx",
  "app/preview/products/[id]/page.tsx"
 ])assert.match(read(p),/requireControlCentreAccess\(\)/);
 assert.match(read("app/robots.ts"),/\/preview\//);
});
test("new buyer guide has no misleading checkout, rankings or vehicle lookup",()=>{
 const guide=read("app/tyres/sizes/page.tsx");
 assert.match(guide,/vehicle-fitment/);
 assert.doesNotMatch(guide,/Visit retailer|\/go\/|number plate|registration lookup/);
 assert.match(guide,/<Suspense/);
 const tpl=read("app/products/[slug]/page.tsx");
 assert.match(tpl,/verifiedProduct\(slug\)/);
 assert.match(tpl,/specRecord.tyre_specs_verified===true/);
});
test("responsive and reduced-motion treatments are defined for showroom",()=>{
 const css=read("app/tyres/tyres.module.css");
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/focus-visible/);
});
