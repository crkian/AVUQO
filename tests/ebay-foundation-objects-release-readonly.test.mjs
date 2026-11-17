import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../scripts/ebay-foundation-objects-release-readonly.sql",import.meta.url),"utf8");
const gates=["exact_22_foundation_columns","private_table_effective_privileges",
 "three_owned_identity_sequences","zero_public_rls_policies",
 "three_expected_fk_delete_rules","nine_unapplied_history",
 "production_migration_authorised"];
test("eBay foundation release gate enumerates seven fail-closed decisions",()=>{
 for(const g of gates)assert.ok(sql.includes("'"+g+"'"),g);
 assert.equal((sql.match(/union all select /g)||[]).length,6);
 assert.match(sql,/'production_migration_authorised',false/);
});
test("release gate checks full column equality, effective rights and sequence ownership",()=>{
 for(const check of ["select * from expected except select * from observed",
  "select * from observed except select * from expected",
  "has_table_privilege('anon'","has_table_privilege('authenticated'",
  "has_table_privilege('service_role'","has_sequence_privilege('service_role'",
  "d.deptype='i'","c.convalidated","c.confdeltype","from supabase_migrations.schema_migrations"]){
  assert.ok(sql.includes(check),check);
 }
});
test("foundation release diagnostic contains no writes, data scans or activation",()=>{
 const strip=sql.replace(/--[^\n]*/g,"");
 assert.doesNotMatch(strip,/\b(?:insert\s+into|update\s+public\.|delete\s+from|truncate\s+|alter\s+table|create\s+table|drop\s+table|grant\s+|revoke\s+|call\s+)/i);
 assert.doesNotMatch(strip,/from\s+public\.(?:ebay_deletion_receipts|ebay_account_item_links|ebay_partial_erasure_audit)\b/i);
 assert.doesNotMatch(strip,/http_|dblink|pg_read_file/i);
});
