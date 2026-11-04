import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("private catalogue and detail page recognise the exact Tooled-Up image host",()=>{
 const card=readFileSync("app/preview/products/PremiumDiscovery.tsx","utf8");
 const detail=readFileSync("app/preview/products/[id]/PrivateProductPhoto.tsx","utf8");
 for(const file of [card,detail]){
  assert.match(file,/www\.tooled-up\.com/);
  assert.match(file,/u\.protocol==="https:"/);
  assert.match(file,/!u\.username&&!u\.password/);
  assert.match(file,/useState\(false\)/);
  assert.match(file,/<img /);
 }
});
test("private merchant catalogue can page through all 84,284 Tooled-Up items",()=>{
 const page=readFileSync("app/preview/products/page.tsx","utf8");
 assert.ok(!page.includes("Math.min(100,"));
 assert.match(page,/Math\.min\(10000,/);
 assert.match(page,/pageSize=48/);
 assert.match(page,/requireControlCentreAccess\(\)/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
});
