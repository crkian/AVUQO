import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("owner-only retailer page shows merchant restrictions without new approval controls",()=>{
 const page=load("app/control-centre/retailers/page.tsx");
 assert.ok(page.indexOf("await requireControlCentreAccess()")>=0);
 assert.ok(page.indexOf("await requireControlCentreAccess()")<page.indexOf("createAdminClient()"));
 for(const s of ["Cadbury Gifts Direct · 736","Petlibro UK · 77952","Sale-category","Branded PPC","Channel Islands and Gibraltar","commission figures conflicted","Public feed/images: not approved by this evidence","/control-centre/source-readiness"])assert.ok(page.includes(s),s);
 assert.doesNotMatch(page,/\\.update\\(\\{.*feed_permission_confirmed/);
});
test("terms review preserves provenance, unverified image/feed rights and commercial gate",()=>{
 const doc=load("docs/AWIN_CADBURY_PETLIBRO_TERMS_REVIEW_2026-11-04.md");
 assert.match(doc,/The underlying PDFs\/emails were not independently reopened/);
 assert.match(doc,/feed_permission_confirmed=false/);
 assert.match(doc,/do not establish an unrestricted licence/);
 const source=load("lib/pipeline/source-readiness.ts");
 assert.match(source,/meta\.usage_rights_confirmed !== true/);
 assert.match(source,/meta\.feed_permission_confirmed !== true/);
 assert.match(source,/match\.feed_permission_confirmed !== true/);
});
