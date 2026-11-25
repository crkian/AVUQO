import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const detail=readFileSync("components/products/OrdinaryProductDetails.tsx","utf8");
const shelf=readFileSync("app/shop/retail/page.tsx","utf8");
test("admitted item only uses exact rights-cleared supplier content",()=>{assert.match(detail,/readExactRetailContent\(item\)/);assert.match(detail,/content\.description/);assert.match(detail,/content\.specifications/);assert.match(detail,/href="#supplier-description"/)});
test("dated promotions belong to exact studio and do not change price",()=>{assert.match(detail,/activePartnerPromotions\(new Date\(\),studio\.slug\)/);assert.match(detail,/p\.startsAt&&p\.endsAt/);assert.match(detail,/not a verified reduction/);assert.match(detail,/money\(item\.price\)/)});
test("retail shelf preserves admission and provides retailer and category journeys",()=>{assert.match(shelf,/ordinaryShoppingPage/);assert.match(shelf,/if\(!data\.enabled\)redirect/);assert.match(shelf,/href="\/partners"/);assert.match(shelf,/href="\/categories"/);assert.match(shelf,/offer\.gallery\[0\]/);assert.match(shelf,/offer\.stock/)});
