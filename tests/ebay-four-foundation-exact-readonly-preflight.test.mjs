import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sql=readFileSync("scripts/ebay-four-foundation-exact-readonly-preflight.sql","utf8");
const gateNames=[
 "seven_foundation_functions","seven_foundation_triggers",
 "eight_foundation_indexes","three_private_rls_relations",
 "three_privileged_erasure_rpcs","historic_foundation_versions",
 "nine_pending_versions_not_installed","manual_sql_object_equivalence",
 "production_migration_authorised"
];
test("four installed foundations have nine explicit deterministic release gates",()=>{
 for(const gate of gateNames)assert.ok(sql.includes("'"+gate+"'"),gate);
 assert.equal((sql.match(/union all select /g)||[]).length,8);
});
test("read-only foundation preflight cannot install, erase or enable production",()=>{
 const withoutComments=sql.replace(/--[^\n]*/g,"");
 assert.doesNotMatch(withoutComments,/\b(?:insert|update|delete|truncate|alter|create|drop|grant|revoke|call)\b\s+(?:into|from|table|function|trigger|index|policy|schema|on|\w+\s*\()/i);
 assert.doesNotMatch(withoutComments,/pg_catalog\.(?:pg_read_file|pg_ls_dir)|pg_sleep|dblink|http_/i);
 assert.match(sql,/'manual_sql_object_equivalence',\s*false/);
 assert.match(sql,/'production_migration_authorised',\s*false/);
});
test("reviewed 7-function, 7-trigger, 8-index, 3-RLS and historic-version contracts",()=>{
 for(const s of ["n=7 and safe=7","matched=7","matched=8","rls_enabled=3","locked=3","count_found=4","count_found=0"])assert.ok(sql.includes(s),s);
 for(const stamp of ["20261116131949","20261116140013","20261116141927","20261116160011",
 "20261116181000","20261116230000"])assert.ok(sql.includes(stamp),stamp);
 assert.ok(sql.includes("has_function_privilege('anon'"));
 assert.ok(sql.includes("has_function_privilege('authenticated'"));
 assert.ok(sql.includes("has_function_privilege('service_role'"));
});
