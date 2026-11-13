import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("actual homepage has editorial category photos with no missing sprite reference",()=>{
 const categories=read("components/home/StorefrontQuickLinks.tsx");
 const css=read("components/home/StorefrontQuickLinks.module.css");
 assert.match(categories,/photo-1498049794561/);
 assert.match(categories,/photo-1600210492486/);
 assert.match(categories,/backgroundImage/);
 assert.doesNotMatch(categories+css,/avuqo-department-reference-sprite\.svg/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});
test("only one year-round seasonal homepage hero and owner preview stays private in navigation",()=>{
 const home=read("app/page.tsx");
 const nav=read("components/layout/MegaNav.tsx");
 assert.match(home,/const season=editorialSpotlight\(new Date\(\)\)/);
 assert.match(home,/season\?\.image/);
 assert.match(home,/season\?\.href/);
 assert.doesNotMatch(home,/<HomeSeasonalSpotlight/);
 assert.doesNotMatch(home,/<OwnerStorefrontShortcut/);
 assert.match(nav,/ownerPreview&&<Link/);
 assert.match(nav,/\/preview\/storefront/);
});
test("hero is constrained on desktop and mobile",()=>{
 const css=read("app/homepage-warm.module.css");
 assert.match(css,/\.fullStorefrontHero \.heroGrid\{width:min\(1180px,calc\(100% - 48px\)\)/);
 assert.match(css,/\.fullStorefrontHero \.heroCopy h1\{font-size:clamp\(42px,4\.3vw,63px\)/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/@media\(max-width:420px\)/);
});
