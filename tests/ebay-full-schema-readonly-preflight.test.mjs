import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("scripts/ebay-full-schema-readonly-preflight.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const check=read("scripts/test-ebay-full-schema-readonly-preflight.sh");
test("production preflight must be a single read-only structural SELECT",()=>{
 assert.match(sql,/^-- AVUQO eBay: strictly read-only production structural preflight\./);
 assert.match(sql,/^with\s/m);
 assert.match(sql,/from checks order by check_id;\s*$/);
 for(const wanted of ["source_quarantine","eleven_core_relations","four_validated_secondary_fks",
 "work_journal_installed","private_partial_audit_installed","six_required_dba_rpcs",
 "secondary_orphan_guard_enabled","independent_drift_guard_enabled","queue_rls_enabled",
 "queue_private_roles","dba_executor_private","provider_release_authorised"]){
  assert.ok(sql.includes("'"+wanted+"'"),wanted);
  assert.ok(check.includes(wanted),wanted);
 }
 for(const bad of [/\binsert\b/i,/\bupdate\b\s+[\w".]+\s+set/i,/\bdelete\b\s+from/i,
 /\balter\s+table\b/i,/\bcreate\s+(table|function|policy|trigger)\b/i,
 /\bgrant\s+\w+\s+on\b/i,/\bexecute\s+(?:function|procedure)\b/i,
 /\bpg_sleep\(/i,/\bhttp_post\(/i,/\bselect\s+\*\s+from\s+public\.ebay_deletion_receipts/i]){
  assert.doesNotMatch(sql.replace(/^--.*$/gm,""),bad);
 }
 assert.match(sql,/false,\s*'NEVER inferred from schema/);
});
test("no-network synthetic CI enforces all structural checks and provider NO-GO",()=>{
 assert.ok(runner.includes("test-ebay-full-schema-readonly-preflight.sh"));
 assert.match(check,/\[\[ "\$\(id -un\)" == "postgres" \]\]/);
 assert.match(check,/avuqo_ebay_ci_synthetic/);
 assert.match(check,/DATABASE_URL/);
 assert.match(check,/provider_release_authorised/);
 assert.match(check,/wanted=BLOCK/);
 assert.match(check,/EBAY_FULL_SCHEMA_RELEASE_PREFLIGHT_PASS/);
});
