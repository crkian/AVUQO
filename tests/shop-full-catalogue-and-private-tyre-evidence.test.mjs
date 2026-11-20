import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SHOP_MAX_PAGE,SHOP_PAGE_SIZE,cleanShopSearch,shopFilters,shopHref} from "../lib/products/shop-filters.ts";
import {compareEligibleOffers} from "../lib/products/comparison-evidence.ts";

const read=path=>readFileSync(path,"utf8");
const merchants=[{value:"Tooled Up",label:"Tooled Up",count:100},{value:"Petlibro UK Affiliate Program",label:"Petlibro UK",count:20}];
const categories=[{value:"tools",label:"Tools & DIY",count:100},{value:"gifts",label:"Gifts",count:50}];
const offer=(merchant,price,total=null)=>({published:{merchant},offer:{price,total_price:total}});
test("shop filters prevent wildcard, out-of-range page and unapproved merchant injection",()=>{
 assert.equal(cleanShopSearch("   Bosch_%(test); 4K \\ demo  "),"Bosch test 4K demo");
 const cleaned=shopFilters({merchant:"Fake Demo",category:"fake",q:"socket_ set%()"} ,merchants,categories);
 assert.equal(cleaned.merchant,"");assert.equal(cleaned.category,"");assert.equal(cleaned.q,"socket set");
 const selected=shopFilters({merchant:"Tooled Up",category:"tools",sort:"price-low",page:"3",q:"Makita drill"},merchants,categories);
 assert.equal(selected.merchant,"Tooled Up");assert.equal(selected.category,"tools");
 assert.equal(shopHref(selected),"/shop?q=Makita+drill&merchant=Tooled+Up&category=tools&sort=price-low&page=3");
 assert.equal(shopFilters({page:String(SHOP_MAX_PAGE+1)},merchants,categories).page,1);
 assert.equal(shopFilters({page:"-5",sort:"untrusted"},merchants,categories).sort,"recent");
 assert.equal(SHOP_PAGE_SIZE<=60,true);
});
test("single retailer never becomes a fabricated cheapest-market label",()=>{
 const c=compareEligibleOffers([offer("Tooled Up",65),offer("Tooled Up",62)]);
 assert.equal(c.sellers,1);assert.equal(c.basis,"item_price_only");
 assert.match(c.heading,/at this retailer/);
 assert.match(c.detail,/not a cheapest-market comparison/);
 assert.equal(c.ordered[0].offer.price,62);
});
test("multi-retailer comparisons sort by verified item price if any delivery unknown",()=>{
 const c=compareEligibleOffers([offer("Shop A",95,99),offer("Shop B",90,null),offer("Shop A",110,115)]);
 assert.equal(c.sellers,2);assert.equal(c.basis,"item_price_only");
 assert.equal(c.ordered[0].published.merchant,"Shop B");
 assert.match(c.heading,/Lowest item price among 2 retailers/);
 assert.match(c.detail,/Cheapest delivered price is unknown/);
});
test("delivery total comparison only when ALL sellers have evidenced total",()=>{
 const c=compareEligibleOffers([offer("Shop A",70,95),offer("Shop B",80,84)]);
 assert.equal(c.basis,"verified_total");assert.equal(c.sellers,2);
 assert.equal(c.ordered[0].published.merchant,"Shop B");
 assert.match(c.heading,/Lowest verified total/);
 const invalid=compareEligibleOffers([offer("Shop A",70,65),offer("Shop B",80,84)]);
 assert.equal(invalid.basis,"item_price_only");
});
test("source-safe page iterates complete candidate windows, then reuses existing publishing gates",()=>{
 const shop=read("lib/products/shop-discovery.ts");
 const publicGate=read("lib/products/public-catalog.ts");
 assert.match(shop,/SHOP_PAGE_SIZE-1/);
 assert.match(shop,/\.range\(offset,offset\+SHOP_PAGE_SIZE-1\)/);
 assert.match(shop,/verifiedOffers\(\{offerIds,limit:SHOP_PAGE_SIZE\}\)/);
 assert.match(shop,/approvedNames/);
 assert.match(shop,/source_unavailable/);
 assert.doesNotMatch(shop,/feed_import_records|large_feed_import_chunks|public\.offers\s+o\s+join/);
 for(const control of ["global_emergency_stop","deal_publishing","source_ingestion","awin_offer_release_reviews","ownAffiliateLink","offerFresh","sourceReady"])
  assert.ok(publicGate.includes(control),"unsafe admission missing "+control);
 const page=read("app/shop/page.tsx");
 assert.match(page,/verifiedShopPage/);
 assert.match(page,/Item price; delivery may be extra/);
 assert.match(page,/candidate total is not a count of currently verified live products/);
 assert.doesNotMatch(page,/Lowest guaranteed|market-cheapest|we beat everyone/i);
});
test("private tyre evidence is owner-gated, code-valid and service-role only",()=>{
 const sql=read("supabase/migrations/20261120064500_owner_only_private_tyre_ean_overlap.sql");
 for(const required of [
  "private_tyre_ean13_check","owner_private_tyre_ean_overlap_summary",
  "merchant_id in ('12715','15236')","^[0-9]{13}$",
  "currency_qualified_pairs","specification_verified_pairs",
  "public_price_release_authorised',false",
  "security invoker","revoke all on function public.owner_private_tyre_ean_overlap_summary() from public,anon,authenticated",
  "grant execute on function public.owner_private_tyre_ean_overlap_summary() to service_role"
 ])assert.ok(sql.includes(required),required);
 assert.doesNotMatch(sql,/insert\s+into|update\s+public\.|delete\s+from|grant execute.+to anon/i);
 const route=read("app/control-centre/tyre-cross-retailer/page.tsx");
 assert.match(route,/requireControlCentreAccess/);
 assert.match(route,/createAdminClient/);
 assert.match(route,/public_price_release_authorised===false/);
 assert.match(route,/No supplier prices or affiliate links/);
 assert.ok(!read("app/sitemap.ts").includes("/control-centre/tyre-cross-retailer"));
});
test("wider shopping connects to existing AVUQO catalogues without removing original journeys",()=>{
 const expected=[
 ["components/catalogue/CatalogueGateway.tsx","/shop"],
 ["app/catalogue/page.tsx","/shop"],
 ["app/products/page.tsx","/shop"],
 ["app/partners/page.tsx","/shop"],
 ["app/search/page.tsx","/shop"],
 ["lib/content/navigation.ts","/shop"],
 ["app/sitemap.ts","/shop"],
 ["app/products/[slug]/page.tsx","compareEligibleOffers"],
 ["lib/control-centre/workspaces.ts","/control-centre/tyre-cross-retailer"]
 ];
 for(const [file,marker] of expected)assert.ok(read(file).includes(marker),file+" missing "+marker);
 assert.match(read("app/categories/page.tsx"),/DepartmentExplorer/);
 assert.match(read("app/partners/page.tsx"),/RetailerCatalogueBrowser/);
});
