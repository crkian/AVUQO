import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("homepage has a larger verified-shopping product window",()=>{
 const homepage=read("app/page.tsx"),dashboard=read("components/home/HomeShoppingDashboard.tsx");
 assert.match(homepage,/verifiedProductIndex\(36\)/);
 assert.match(dashboard,/diverseShoppingPicks\(items,12\)/);
 assert.match(dashboard,/groups=new Map/);
 assert.match(dashboard,/Regular eligible retailer price/);
 assert.match(dashboard,/\/wishlist/);
});
test("supplier gallery never navigates to an external image page",()=>{
 const gallery=read("components/products/ProductGallery.tsx");
 assert.match(gallery,/aria-pressed=\{selected===index\}/);
 assert.match(gallery,/onClick=\{\(\)=>setSelected\(index\)\}/);
 assert.doesNotMatch(gallery,/target="_blank"|href=\{url\}/);
 const product=read("app/products/[slug]/page.tsx");
 assert.match(product,/ProductGallery images=\{gallery\}/);
});
test("product recommendations remain restricted to verified public index",()=>{
 const page=read("app/products/[slug]/page.tsx");
 assert.match(page,/verifiedProductIndex\(60\)/);
 assert.match(page,/item\.product\.id!==entry\?\.product\.id/);
 assert.match(page,/RelatedProductSuggestions similar=\{similar\} discover=\{discover\}/);
 const cards=read("components/products/RelatedProductSuggestions.tsx");
 assert.match(cards,/Similar items worth comparing/);
 assert.match(cards,/Have you seen these\?/);
});
test("wishlist is explained as keeping for later, basket is not checkout",()=>{
 const copy=read("lib/collections/planning.ts");
 assert.match(copy,/Keep products for later/);
 assert.match(copy,/not a checkout or reservation/);
 const actions=read("components/collections/AddToCollectionButton.tsx");
 assert.match(actions,/Kept for later in your wishlist/);
});
