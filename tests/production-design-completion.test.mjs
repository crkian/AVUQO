import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("live header/footer share the approved visual identity without changing functional routing",()=>{
 const header=read("components/layout/Header.tsx"),footer=read("components/layout/Footer.tsx");
 for(const content of [header,footer]){
  assert.match(content,/avuqo-brand-lockup/);
  assert.match(content,/Find what&?apos;s/);
  assert.match(content,/avuqo-brand-symbol/);
 }
 for(const route of ['action="/search"','href="/wishlist"','href="/basket"','href="/account"','href="/control-centre"'])
  assert.ok(header.includes(route),route);
 assert.match(header,/createClient/);
 assert.match(header,/MegaNav/);
 assert.match(header,/MobileDock/);
});
test("public catalogue shows only publication-gated images and maintains truthful empty states",()=>{
 const catalogue=read("app/products/page.tsx"),source=read("lib/products/public-catalog.ts");
 assert.match(catalogue,/verifiedProductIndex\(48\)/);
 assert.match(catalogue,/published\.image_url/);
 assert.match(catalogue,/No approved photograph available/);
 assert.match(catalogue,/There are no verified external-source product offers ready/);
 assert.match(source,/image_rights_confirmed===true/);
 assert.match(source,/imageAllowed&&isHttps\(d\.image_url\)/);
 assert.match(source,/publication_permission!=="verified"/);
});
test("the full design refinement targets real shared customer pages and is responsive",()=>{
 const css=[
  "app/globals.css",
  "components/layout/MegaNav.module.css",
  "components/layout/MobileDock.module.css",
  "app/categories/page.module.css",
  "app/products/page.module.css",
  "app/products/[slug]/page.module.css",
  "components/editorial/SeasonalLanding.module.css",
  "components/lifestyle/LifestyleLanding.module.css"
 ];
 for(const path of css){const content=read(path);assert.match(content,/focus-visible/,path);assert.match(content,/@media\(max-width:/,path);}
 assert.match(read("components/editorial/SeasonalLanding.tsx"),/Curated ideas, never invented deals/);
 assert.match(read("components/lifestyle/LifestyleLanding.tsx"),/Lifestyle photographs illustrate categories/);
});
