import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const catalogue=readFileSync("lib/products/public-catalog.ts","utf8");
test("public Awin admission automatically rejects stale or out-of-stock offers",()=>{
 assert.match(catalogue,/function offerFresh\(row:Record<string,unknown>,now:number,isAwin=false\)/);
 assert.match(catalogue,/const maxAge=isAwin\?48\*3600_000:7\*24\*3600_000/);
 assert.match(catalogue,/isAwin&&[^\n]*"in_stock","low_stock"/);
 assert.match(catalogue,/source\.connector_key==="awin"\)\)return \[\]/);
});
test("no database mutation or global source activation in public admission",()=>{
 assert.match(catalogue,/evaluateSourceControls\(flags,!!flagsError\)\.publishing/);
 assert.match(catalogue,/approval\.status!=="approved"/);
 assert.match(catalogue,/sourceReady\(/);
 assert.match(catalogue,/Number\(approval\.reviewed_price\)!==Number\(offer\.price\)/);
 assert.doesNotMatch(catalogue,/\.update\(|\.upsert\(|\.insert\(|\.delete\(|setSourceStatus\(/);
});
