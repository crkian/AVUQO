import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("scale remains opt-in before database changes",()=>{for(const p of ["lib/products/shopping-catalogue.ts","app/api/internal/awin-catalogue-conversion/route.ts","app/api/internal/awin-shopping-auto-review/route.ts"])assert.match(read(p),/AWIN_CATALOGUE_SCALE_ENABLED==="true"/);});
test("SQL candidate preserves admission and lock predicates",()=>{const s=read("docs/sql/2026-11-25-full-range-scale-candidate.sql");for(const re of [/p_offset between 0 and 36000/,/p_limit between 1 and 50/,/p_limit>60/,/global_emergency_stop/,/for update of x skip locked/,/record_awin_shopping_owner_review/,/exact_authenticated_feed_digest_rechecked/,/publication_approved/])assert.match(s,re);assert.doesNotMatch(s,/grant execute|disable row level security/i);});
test("jump form retains query, retailer and sort",()=>{const s=read("app/shop/retail/page.tsx");for(const key of ["q","merchant","sort","page"])assert.ok(s.includes('name="'+key+'"'));assert.match(s,/max=\{data.maxPage\}/);});
