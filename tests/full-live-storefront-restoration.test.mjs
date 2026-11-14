import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const root=new URL("../",import.meta.url);
const file=path=>readFileSync(new URL(path,root),"utf8");
const home=file("app/page.tsx");
const quick=file("components/home/StorefrontQuickLinks.tsx");
const dashboard=file("components/home/HomeShoppingDashboard.tsx");
const css=file("components/home/HomeShoppingDashboard.module.css");

test("restored full storefront is part of public production homepage, not only preview",()=>{
 for(const token of ["<StorefrontQuickLinks/>","<HomeShoppingDashboard items={products}/>","verifiedProductIndex(8)","<CategoryJourneys","<HomeCampaignCarousel"])
  assert.ok(home.includes(token),"Missing "+token);
 assert.match(home,/href="\/marketplace\/compare"/);
 assert.match(home,/href="\/sales"/);
});
test("dashboard uses independently eligible product index and honest editorial fallback",()=>{
 assert.match(home,/verifiedProductIndex\(8\)/);
 assert.match(dashboard,/No unverified offers are represented as current deals/);
 assert.match(dashboard,/RESEARCH_PRODUCT_GUIDES\.slice\(0,3\)/);
 assert.match(dashboard,/Research guide · No verified retailer price/);
 assert.match(dashboard,/picked\.length\?picked\.map/);
 assert.match(dashboard,/published\.image_url/);
 assert.doesNotMatch(dashboard,/Math\.random|fake.*deal|example.*score/i);
});
test("recovered components link to real routes and have mobile layout",()=>{
 assert.match(quick,/href:"\/tech"/);
 assert.match(quick,/href:"\/gifts"/);
 assert.match(dashboard,/href:"\/travel"/);
 assert.match(css,/@media\(max-width:/);
});
