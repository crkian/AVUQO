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
