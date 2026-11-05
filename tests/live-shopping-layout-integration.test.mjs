import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("shopping collections integrate into real published navigation destinations",()=>{
 const shelf=read("components/shopping/ShoppingDepartmentShelf.tsx");
 const home=read("app/page.tsx"),categories=read("app/categories/page.tsx");
 const shopping=read("app/shopping/page.tsx"),landing=read("components/lifestyle/LifestyleLanding.tsx");
 // The landing page uses the owner-approved compact ribbon/dashboard, while
 // category and shopping directories still use the full editorial department shelf.
 for(const page of [categories,shopping])assert.match(page,/ShoppingDepartmentShelf/);
 assert.match(home,/StorefrontQuickLinks/);
 assert.match(home,/HomeShoppingDashboard/);
 const quickLinks=read("components/home/StorefrontQuickLinks.tsx");
 const dashboard=read("components/home/HomeShoppingDashboard.tsx");
 assert.match(quickLinks,/\/categories/);
 assert.match(quickLinks,/\/pets/);
 assert.match(dashboard,/\/groceries/);
 assert.match(dashboard,/\/watches/);
 assert.match(dashboard,/\/saved/);
 assert.match(landing,/\{afterTrust\}/);
 assert.match(shelf,/\/gifts/);
 assert.match(shelf,/\/pets/);
 assert.match(shelf,/\/search\?q=tools/);
 assert.match(shelf,/\/search\?q=craft/);
 assert.match(shelf,/\/categories/);
 assert.doesNotMatch(shelf,/\/categories\/diy-building|\/categories\/crafts/);
});
test("unapproved imported products appear only behind verified owner roles",()=>{
 const gate=read("components/shopping/OwnerCollectionLink.tsx");
 const shelf=read("components/shopping/ShoppingDepartmentShelf.tsx");
 const privatePage=read("app/preview/storefront/page.tsx");
 assert.match(gate,/db\.auth\.getUser\(\)/);
 assert.match(gate,/\.from\("user_roles"\)/);
 assert.match(gate,/data\?\.role==="owner"\|\|data\?\.role==="admin"/);
 assert.match(gate,/if\(!allowed\)return null/);
 assert.match(shelf,/OwnerCollectionLink/);
 assert.match(privatePage,/requireControlCentreAccess\(\)/);
 assert.match(privatePage,/robots:\{index:false,follow:false\}/);
 assert.match(privatePage,/\.eq\("status","private_review"\)/);
});
test("editorial shop shelf is responsive and never shows unapproved merchant photos",()=>{
 const css=read("components/shopping/ShoppingDepartmentShelf.module.css");
 const shelf=read("components/shopping/ShoppingDepartmentShelf.tsx");
 for(const size of ["1080","700","480"])assert.ok(css.includes("max-width:"+size+"px"));
 assert.match(css,/grid-template-columns:1fr/);
 assert.match(css,/\.publicLink:focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(shelf,/Images are illustrative/);
 assert.doesNotMatch(shelf,/feed_import_records|image_url|awin1\.com/);
});
test("private merchant-specific detailed pages remain the only product routes",()=>{
 const detail=read("app/preview/products/[id]/page.tsx");
 assert.match(detail,/requireControlCentreAccess\(\)/);
 assert.match(detail,/categoryDetail/);
 assert.match(detail,/permission_status/);
 assert.match(detail,/robots:\{index:false,follow:false\}/);
});
