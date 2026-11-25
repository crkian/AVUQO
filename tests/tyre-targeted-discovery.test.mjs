import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("tyre finder narrows candidates before public admission",()=>{const src=read("lib/products/public-catalog.ts").split("export async function verifiedTyreProductIndex")[1];assert.match(src,/tyre_specs_verified/);assert.match(src,/tyre_width_mm/);assert.match(src,/verifiedOffers\(\{productId:product.id/);assert.match(read("app/tyres/find/page.tsx"),/verifiedTyreProductIndex\(size/);});
