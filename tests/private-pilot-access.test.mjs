import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const pilot=readFileSync(new URL("../app/control-centre/pilot-products/page.tsx",import.meta.url),"utf8");
const ready=readFileSync(new URL("../app/control-centre/product-readiness/page.tsx",import.meta.url),"utf8");
test("private pilot drafts require owner/admin before service role reads",()=>{
 assert.ok(pilot.indexOf("await requireControlCentreAccess()")>=0);
 assert.ok(pilot.indexOf("await requireControlCentreAccess()")<pilot.indexOf("createAdminClient()"));
 assert.match(pilot,/\.like\("slug","pilot-%"\)\.eq\("status","draft"\)/);
 assert.doesNotMatch(pilot,/createClient\(\)/);
});
test("product readiness also requires owner/admin before private reporting",()=>{
 assert.ok(ready.indexOf("await requireControlCentreAccess()")>=0);
 assert.ok(ready.indexOf("await requireControlCentreAccess()")<ready.indexOf("createAdminClient()"));
});
test("the public catalogue remains unchanged and denies unverified draft publication",()=>{
 const source=readFileSync(new URL("../lib/products/public-catalog.ts",import.meta.url),"utf8");
 assert.match(source,/\.eq\("status","active"\)/);
 assert.match(source,/usage_rights_confirmed===true/);
 assert.match(source,/source\.connector_key==="demo"/);
});
