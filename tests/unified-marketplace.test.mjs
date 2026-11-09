import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BROWSE_DEPARTMENTS,departmentHref} from "../lib/categories/browse-tree.ts";
import {MARKETPLACE_JOURNEYS,marketplaceDepartmentBySlug,departmentJourneys,summarizeMarketCategories}
 from "../lib/marketplace/journeys.ts";
import {DEFAULT_NAVIGATION,isValidNavigation} from "../lib/content/navigation.ts";
import {DEFAULT_FOOTER,parseFooter} from "../lib/content/footer.ts";
const read=path=>readFileSync(path,"utf8");

test("all 25 existing departments are routed and unique without catalogue activation",()=>{
 assert.equal(BROWSE_DEPARTMENTS.length,25);
 assert.equal(new Set(BROWSE_DEPARTMENTS.map(d=>d.slug)).size,25);
 assert.equal(summarizeMarketCategories().departments,25);
 for(const d of BROWSE_DEPARTMENTS){
  assert.equal(marketplaceDepartmentBySlug(d.slug)?.name,d.name);
  assert.ok(d.topics.length>0);
  assert.match(departmentHref(d),/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/);
 }
 assert.equal(marketplaceDepartmentBySlug("unsafe/slug"),undefined);
 assert.equal(marketplaceDepartmentBySlug("__proto__"),undefined);
 assert.match(read("app/categories/[department]/page.tsx"),/if\(!item\|\|item.landing\)notFound\(\)/);
});
test("every department exposes legitimate, independent buying journeys",()=>{
 assert.deepEqual(MARKETPLACE_JOURNEYS.map(x=>x.id),["explore","shop","compare","whos-who"]);
 assert.equal(departmentJourneys(marketplaceDepartmentBySlug("grocery-food")).compare,"/groceries");
 assert.equal(departmentJourneys(marketplaceDepartmentBySlug("connectivity-utilities")).compare,"/compare");
 assert.equal(departmentJourneys(marketplaceDepartmentBySlug("motoring")).compare,"/tyres");
 assert.equal(departmentJourneys(marketplaceDepartmentBySlug("travel")).compare,"/travel");
 assert.match(read("app/marketplace/page.tsx"),/BROWSE_DEPARTMENTS/);
 assert.match(read("components/lifestyle/LifestyleLanding.tsx"),/<CategoryJourneys/);
 assert.match(read("components/layout/Header.tsx"),/<MarketplaceRibbon\/>/);
});
test("Who’s Who never calls an unverified supplier import or uses private rows",()=>{
 const who=read("app/whos-who/page.tsx");
 assert.match(who,/verifiedOffers/);
 assert.match(who,/verifiedProductIndex/);
 assert.doesNotMatch(who,/feed_import_records|source_url|createAdminClient|affiliate_url|price_observations/);
 assert.match(who,/No independent retailer listing is currently eligible/);
 assert.match(who,/not a claim of manufacturer sponsorship/);
});
test("admin source atlas is role-gated, read-only and never returns source secrets",()=>{
 for(const path of ["app/control-centre/source-atlas/page.tsx","app/control-centre/marketplace/page.tsx"]){
  const file=read(path);
  assert.match(file,/requireControlCentreAccess\(\)/);
  assert.match(file,/robots:\{index:false,follow:false\}/);
  assert.doesNotMatch(file,/\.insert\(|\.update\(|\.delete\(|\.upsert\(/);
  assert.doesNotMatch(file,/select\([^)]*metadata|access_token|api_key|secret_key/);
 }
 assert.match(read("lib/control-centre/workspaces.ts"),/\/control-centre\/source-atlas/);
 assert.match(read("lib/control-centre/workspaces.ts"),/\/control-centre\/marketplace/);
 assert.match(read("app/robots.ts"),/\/control-centre\//);
});
test("default menu and footer retain validated routes and capacity",()=>{
 assert.ok(isValidNavigation(DEFAULT_NAVIGATION));
 const discover=DEFAULT_NAVIGATION.groups.find(g=>g.id==="discover");
 assert.ok(discover.links.some(l=>l.href==="/marketplace"));
 assert.ok(discover.links.some(l=>l.href==="/whos-who"));
 assert.deepEqual(parseFooter(DEFAULT_FOOTER),DEFAULT_FOOTER);
});
test("UI retains responsive and accessible controls, no fake product claims",()=>{
 const css=read("app/marketplace/marketplace.module.css");
 assert.match(css,/@media\(max-width:550px\)/);
 assert.match(css, /focus-visible/);
 assert.match(css, /prefers-reduced-motion/);
 const marketplace=read("app/marketplace/page.tsx");
 assert.doesNotMatch(marketplace,/\u00a3\d|lowest price guaranteed|100% savings/);
 const compare=read("app/marketplace/compare/page.tsx");
 assert.match(compare,/missing costs|complete|Like-for-like/i);
});
