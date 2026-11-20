import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BROWSE_DEPARTMENTS,DEPARTMENT_GROUPS} from "../lib/categories/browse-tree.ts";
import {PARTNERS,PARTNER_BY_SLUG} from "../lib/partners/advertiser-directory.ts";
import {PARTNER_DEPARTMENTS,departmentsForPartner,partnersForDepartment} from "../lib/partners/catalogue-taxonomy.ts";
import {DEFAULT_NAVIGATION,isValidNavigation,parseNavigation} from "../lib/content/navigation.ts";

const read=path=>readFileSync(path,"utf8");
test("retain 25 existing category slugs and all 21 accepted advertiser pages",()=>{
 assert.equal(BROWSE_DEPARTMENTS.length,25);
 assert.equal(new Set(BROWSE_DEPARTMENTS.map(d=>d.slug)).size,25);
 assert.equal(PARTNERS.length,21);
 assert.equal(PARTNER_BY_SLUG.size,21);
 assert.deepEqual(Object.keys(PARTNER_DEPARTMENTS).sort(),PARTNERS.map(p=>p.slug).sort());
 assert.deepEqual(DEPARTMENT_GROUPS.flatMap(g=>g.slugs).sort(),BROWSE_DEPARTMENTS.map(d=>d.slug).sort());
 for(const p of PARTNERS){
  const destinations=departmentsForPartner(p.slug);
  assert.ok(destinations.length>0,p.name+" needs valid category association");
  assert.ok(destinations.every(d=>BROWSE_DEPARTMENTS.includes(d)),p.name+" mapped to unknown category");
  assert.ok(destinations.some(d=>partnersForDepartment(d.slug).some(member=>member.slug===p.slug)),p.slug);
 }
});
test("category partner discovery never creates a false product feed or missing department",()=>{
 assert.deepEqual(partnersForDepartment("unknown-department"),[]);
 assert.ok(partnersForDepartment("pets").some(p=>p.slug==="petlibro"));
 assert.ok(partnersForDepartment("travel").some(p=>p.slug==="holiday-extras"));
 assert.ok(partnersForDepartment("tech").some(p=>p.slug==="mozillion"));
 assert.ok(partnersForDepartment("motoring").some(p=>p.slug==="tyres-uk"));
 assert.ok(partnersForDepartment("grocery-food").some(p=>p.slug==="cadbury-gifts-direct"));
 const shelf=read("components/partners/DepartmentPartnerShelf.tsx");
 assert.match(shelf,/partnersForDepartment/);
 assert.match(shelf,/Membership alone does not guarantee live stock/);
 assert.doesNotMatch(shelf,/insert into|feed_import_records|published_deals/);
});
test("two catalogues and all category routes linked without replacing existing pages",()=>{
 const pages=[
 ["app/catalogue/page.tsx",["/products","/partners","/categories","BROWSE_DEPARTMENTS","DEPARTMENT_GROUPS","VerifiedCatalogueShelf"]],
 ["app/partners/page.tsx",["RetailerCatalogueBrowser","/products","/categories","/catalogue"]],
 ["app/products/page.tsx",["CatalogueGateway","verifiedProductIndex"]],
 ["app/categories/page.tsx",["DepartmentExplorer","ShoppingDepartmentShelf","CatalogueGateway"]],
 ["app/categories/[department]/products/page.tsx",["DepartmentPartnerShelf","RetailerSales","eligibleDepartmentProduct"]],
 ["app/partners/[slug]/page.tsx",["departmentsForPartner","partnersForDepartment","verifiedOffersForAdvertiser"]],
 ["app/page.tsx",["StorefrontQuickLinks","CatalogueGateway","HomeShoppingDashboard","RetailerSales"]],
 ["app/marketplace/page.tsx",["MARKETPLACE_JOURNEYS","CatalogueGateway"]],
 ["components/marketplace/MarketplaceRibbon.tsx",["/catalogue","/partners"]],
 ["app/sitemap.ts",["/catalogue","/partners"]]
 ];
 for(const [file,needles] of pages){
  const code=read(file);
  for(const needle of needles)assert.ok(code.includes(needle),file+" missing "+needle);
 }
 const catalogue=read("app/catalogue/page.tsx");
 assert.match(catalogue,/verifiedProductIndex/);
 assert.match(catalogue,/await connection\(\)/);
 assert.match(catalogue,/<Suspense fallback=/);
 assert.doesNotMatch(catalogue,/feed_import_records|private_rows|raw_data/);
});
test("existing owner navigation stays valid and legacy customisations survive new catalogue links",()=>{
 assert.ok(isValidNavigation(DEFAULT_NAVIGATION));
 const saved=structuredClone(DEFAULT_NAVIGATION);
 for(const g of saved.groups)g.links=g.links.filter(l=>l.href!=="/catalogue");
 saved.groups[0].label="My personal discovery";
 saved.groups[0].links[0].enabled=false;
 const updated=parseNavigation(saved);
 assert.ok(isValidNavigation(updated));
 assert.equal(updated.groups[0].label,"My personal discovery");
 assert.equal(updated.groups[0].links[0].enabled,false);
 assert.ok(updated.groups.some(g=>g.links.some(l=>l.href==="/catalogue")));
 assert.ok(updated.groups.some(g=>g.links.some(l=>l.href==="/partners")));
});
test("original design and 21 unique themes persist",()=>{
 const shared=read("app/catalogue/page.module.css");
 const retailer=read("app/partners/partners.module.css");
 const host=read("app/partners/[slug]/page.tsx");
 assert.match(shared,/Georgia/);
 assert.match(shared,/#faf8f3/);
 assert.match(retailer,/AVUQO visual continuity/);
 assert.match(retailer,/var\(--glow\)/);
 assert.match(host,/--accent/);
 assert.equal(new Set(PARTNERS.map(p=>p.accent+p.deep+p.glow)).size,21);
});

test("cumulative handovers preserve all previous project work, source and branch snapshots",()=>{
 const history=["docs/PROJECT_STATUS.md","CHANGELOG.md",
  "docs/AVUQO_ACTIVE_HANDOVER.md","docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md"];
 for(const file of history){
  const text=read(file);
  assert.ok(text.length>100000,file+" history was unexpectedly truncated");
  const hasAffiliateAddendum=file==="docs/AVUQO_ACTIVE_HANDOVER.md";
  const expectedHeader=hasAffiliateAddendum
   ?"## 20 November 2026 | Affiliate advertiser rejection recovery added as separate active workstream"
   :"## 20 November 2026 | Massive leap candidate:";
  assert.ok(text.startsWith(expectedHeader),file+" missing newest non-destructive handover");
  assert.ok(text.includes("## 20 November 2026 | Massive leap candidate:"),file+" full shopping and tyre handover missing");
  if(hasAffiliateAddendum){
   assert.ok(text.includes("AVUQO_AWIN_PUBLISHER_ELIGIBILITY_AND_ADVERTISER_AUDIT_WORKSTREAM_2026-11-20.md"),"privacy-safe affiliate handover not linked");
   const recovery=read("docs/AVUQO_AWIN_PUBLISHER_ELIGIBILITY_AND_ADVERTISER_AUDIT_WORKSTREAM_2026-11-20.md");
   for(const required of ["publisher", "inaccessible", "programme", "privacy", "Control Centre"])
    assert.ok(recovery.toLowerCase().includes(required.toLowerCase()),"recovery roadmap missing "+required);
  }
  assert.ok(text.includes("## 20 November 2026 | VERIFIED PRODUCTION:"),file+" earlier verified production snapshot was deleted");
  assert.ok(text.includes("## 19 November 2026 | Unified AVUQO catalogue"),file+" original project launch record missing");
  assert.ok(text.includes("Retail park, 21 advertiser storefronts, mobile hub"),file+" previous release record missing");
  assert.ok(text.includes("original"),file+" original work index missing");
 }
 for(const file of ["docs/AVUQO_ACTIVE_HANDOVER.json","docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.json"]){
  const root=JSON.parse(read(file));
  const continuity=root.unified_catalogues_full_continuity_20261119;
  assert.ok(continuity,file+" latest continuity namespace missing");
  assert.ok(Object.keys(root).length>90,file+" historic workstream sections deleted");
  assert.equal(continuity.historical_json_keys_and_requirements_retained,true);
  assert.ok(root.retail_park_advertiser_launch_20261119,file+" PR 327 historical entry deleted");
  assert.ok(root.awin_21_programme_automation_20261119,file+" feed automation entry deleted");
  assert.ok(root.massive_leap_verified_shop_and_private_tyre_ean_20261120,file+" next leap workstream missing");
  assert.ok(continuity.outstanding_actions.length>=8);
 }
 const index=read("docs/AVUQO_CUMULATIVE_CONTINUITY_AND_CATALOGUE_INDEX_2026-11-19.md");
 for(const keyword of ["29-workstream","12-gap","Amazon","Dropshipping","Supermarket","Holiday Extras","Pneus Online","21 individual advertiser","all 25","PR #327","20 November 2026 verified production addendum","candidate extension: all verified retailer offers"])
  assert.ok(index.toLowerCase().includes(keyword.toLowerCase()),"missing preserved goal: "+keyword);
});
