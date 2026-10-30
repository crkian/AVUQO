import test from "node:test";
import assert from "node:assert/strict";
import {CONTROL_CENTRE_SECTIONS,allAdminLinks,adminSectionForPath} from "../lib/control-centre/workspaces.ts";
test("every listed admin destination is unique and internal",()=>{
 const paths=allAdminLinks().map(x=>x.href);
 assert.equal(new Set(paths).size,paths.length);
 assert.equal(paths.every(p=>/^\/control-centre(?:\/[a-z-]+)*$/.test(p)),true);
});
test("the three commercial systems have independent destinations",()=>{
 const ads=CONTROL_CENTRE_SECTIONS.find(x=>x.id==="commercial").links;
 assert.ok(ads.find(x=>x.href==="/control-centre/site-advertising"));
 assert.ok(ads.find(x=>x.href==="/control-centre/marketing"));
 assert.ok(ads.find(x=>x.href==="/control-centre/promotions"));
});
test("nested grocery prices correctly stay in Website Experience",()=>{
 assert.equal(adminSectionForPath("/control-centre/groceries/price-evidence"),"website");
});
test("release readiness has a clear control-centre home",()=>{
 assert.equal(adminSectionForPath("/control-centre/release-readiness"),"home");
});
