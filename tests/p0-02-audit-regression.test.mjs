import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("P0-02 migration only pauses the unapproved Awin source",()=>{
 const sql=readFileSync("supabase/migrations/20261102172000_pause_unapproved_awin.sql","utf8");
 assert.match(sql,/UPDATE public\.sources/);
 assert.match(sql,/WHERE connector_key='awin'/);
 assert.match(sql,/sync_enabled=false/);
 assert.doesNotMatch(sql,/DELETE FROM|TRUNCATE|DROP TABLE|INSERT INTO/i);
});
test("public product admission responds to emergency and source rights",()=>{
 const c=readFileSync("lib/products/public-catalog.ts","utf8");
 assert.match(c,/evaluateSourceControls\(/);
 assert.match(c,/sourceEvidenceFailures\(/);
 assert.match(c,/publication_permission/);
 assert.match(c,/price_evidence_status/);
});
test("admin source activation cannot bypass advertiser evidence",()=>{
 const c=readFileSync("app/control-centre/actions.ts","utf8");
 assert.match(c,/sourceEvidenceFailures\(source,/);
 assert.match(c,/role !== "owner"/);
});
test("source readiness and pipeline screens use current rights evidence",()=>{
 const p=readFileSync("app/control-centre/pipeline/page.tsx","utf8");
 const s=readFileSync("app/control-centre/source-readiness/page.tsx","utf8");
 assert.match(p,/sourceIngestionFailures\(/);
 assert.match(p,/disabled=\{!awinReady\}/);
 assert.match(s,/sourceIngestionFailures\(/);
});
