import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {categoryDetail} from "../lib/feed-imports/category-detail.ts";
test("private storefront is server-gated before product reads and contains no checkout",()=>{
 const page=readFileSync("app/preview/storefront/page.tsx","utf8");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf('db.from("feed_import_runs")'));
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/\.eq\("status","private_review"\)/);
 assert.match(page,/\.eq\("status","review"\)/);
 assert.match(page,/private_only|OWNER-ONLY|OWNER-ONLY STOREFRONT/);
 assert.match(page,/\/preview\/products\/tooled-up/);
 assert.match(page,/\/preview\/products\?merchant=736/);
 assert.match(page,/\/preview\/products\?merchant=77952/);
 assert.match(page,/\/preview\/products\?merchant=45747/);
 assert.doesNotMatch(page,/awin1\.com|checkout|addToBasket/i);
});
test("public homepage and categories keep staged product inventory owner-only",()=>{
 const home=readFileSync("app/page.tsx","utf8");
 const owner=readFileSync("components/home/OwnerStorefrontShortcut.tsx","utf8");
 const header=readFileSync("components/layout/Header.tsx","utf8");
 const nav=readFileSync("components/layout/MegaNav.tsx","utf8");
 assert.match(home,/OwnerStorefrontShortcut/);
 assert.match(owner,/db\.auth\.getUser/);
 assert.match(owner,/data\?\.role==="owner"\|\|data\?\.role==="admin"/);
 assert.match(owner,/if\(!allowed\)return null/);
 assert.match(header,/ownerPreview=\{admin\}/);
 assert.match(nav,/ownerPreview&&<Link/);
 assert.match(nav,/\/preview\/storefront/);
});
test("new store and category card layouts support phones and reduced motion",()=>{
 const main=readFileSync("app/preview/storefront/private-storefront.module.css","utf8");
 const tools=readFileSync("app/preview/products/tooled-up/cards.module.css","utf8");
 const filters=readFileSync("app/preview/products/tooled-up/catalogue.module.css","utf8");
 const detail=readFileSync("app/preview/products/[id]/detail.module.css","utf8");
 for(const style of [main,tools,filters,detail])assert.match(style,/@media\(max-width:/);
 assert.match(main,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(main,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(tools,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(filters,/\.filters/);
 assert.match(detail,/overflow-wrap:anywhere/);
});
test("source facts are category-adaptive and never claim legal manufacturer certainty",()=>{
 const result=categoryDetail("Tooled Up","Bosch HSS drill bit","DIY","Bosch",{
  merchant_category_path:"Power Tool Accessories > Drilling Accessories > Drill Bits",
  ean:"1234567890123",manufacturer_brand:"Bosch",availability:"Available to Order"
 });
 assert.equal(result.department,"Power Tool Accessories");
 assert.equal(result.heading,"Accessory compatibility");
 assert.ok(result.facts.some(f=>f.label==="EAN"&&f.value==="1234567890123"));
 assert.ok(result.facts.some(f=>f.label.includes("unverified manufacturer")));
 assert.ok(result.facts.some(f=>f.value==="Available to Order"));
 assert.ok(result.missing.some(x=>/current retailer price/i.test(x)));
 const work=categoryDetail("Tooled Up","Boot","DIY","DeWalt",{merchant_category_path:"Workwear > Footwear > Work Boots"});
 assert.equal(work.heading,"Workwear fit and protection");
 const chocolate=categoryDetail("Cadbury Gifts Direct","Chocolate 300g","Chocolate","Cadbury");
 assert.equal(chocolate.department,"Chocolate & gifts");
});
test("image links are still manually enabled only on exact retailer HTTPS hosts",()=>{
 const c=readFileSync("app/preview/storefront/PrivateStorefrontImages.tsx","utf8");
 assert.match(c,/useState\(false\)/);
 assert.match(c,/hosts\.has\(u\.hostname\)/);
 assert.match(c,/u\.protocol==="https:"/);
 assert.match(c,/!u\.username&&!u\.password/);
 assert.match(c,/referrerPolicy="no-referrer"/);
 assert.match(c,/\/preview\/products\/\$\{item.id\}/);
});
