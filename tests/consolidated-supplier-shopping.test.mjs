import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("retailer comparisons use exact canonical identity and independent admission",()=>{const s=read("lib/products/shopping-release-reader.ts").split("export async function ordinaryOffersForProduct")[1];assert.match(s,/eq\("product_id",productId\)/);assert.match(s,/readShoppingReleases/);assert.match(s,/r.productId===productId/);});
test("department shopping samples require explicit classification",()=>{const s=read("app/categories/[department]/products/page.tsx");assert.match(s,/o.department===department/);assert.match(s,/ordinaryShoppingPage/);});
test("handover candidate is not declared live",()=>{const h=JSON.parse(read("docs/AVUQO_ACTIVE_HANDOVER.json"));assert.equal(h.consolidated_supplier_shopping_candidate_20261125.status,"unpublished_pending_tests");});
