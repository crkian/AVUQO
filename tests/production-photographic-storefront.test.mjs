import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/homepage-warm.module.css",import.meta.url),"utf8");
test("production homepage restores photographic visual hero and evidence panel",()=>{
 for(const token of ["fullStorefrontHero","fullStorefrontPhoto","fullStorefrontIntelligence","Evidence","Shop smarter.","<StorefrontQuickLinks/>","<HomeShoppingDashboard items={products}/>"])assert.ok(page.includes(token),"Missing "+token);
 assert.match(page,/href="\/marketplace\/compare"/);
 assert.match(page,/href="\/sales"/);
 assert.match(page,/href="\/products"/);
});
test("hero makes no fabricated numerical rankings or discounts and is mobile responsive",()=>{
 assert.doesNotMatch(page,/9\.2|18% below|£269\.00|verified discounts/i);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/@media\(max-width:420px\)/);
 assert.match(css,/rgba\(255,251,247/);
});
