import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("scripts/ebay-seven-foundation-body-hash-readonly.sql");
const migrationPaths=[
 "supabase/migrations/20261116132000_ebay_account_scoped_erasure_foundation.sql",
 "supabase/migrations/20261116153000_ebay_deletion_receipt_integrity_lock.sql",
 "supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql",
 "supabase/migrations/20261116165000_ebay_atomic_tombstone_admission.sql"
];
const definitions=new Map();
for(const path of migrationPaths){
 const source=read(path);
 const re=/create\s+function\s+public\.(\w+)\s*\([\s\S]*?\bas\s+\$\$([\s\S]*?)\$\$\s*;/gi;
 let match;
 while((match=re.exec(source))){
  assert.ok(!definitions.has(match[1]), "Duplicate function definition "+match[1]);
  definitions.set(match[1],match[2].replace(/\r\n/g,"\n").trim());
 }
}
const expected=new Map([...sql.matchAll(/\('([^']+)'::text,'([a-f0-9]{32})'::text\)/g)].map(m=>[m[1],m[2]]));
test("exact seven foundational function bodies match pinned live-verified hashes",()=>{
 assert.equal(expected.size,7);
 assert.deepEqual([...expected.keys()].sort(),[...definitions.keys()].sort());
 for(const [name,body] of definitions){
  const hash=createHash("md5").update(body,"utf8").digest("hex");
  assert.equal(hash,expected.get(name), "Repo SQL changed for "+name+"; rerun full live attestation");
 }
});
test("read-only production hash audit fails closed and does not expose account data",()=>{
 const stripped=sql.replace(/--[^\n]*/g,"");
 assert.match(sql,/md5\(btrim\(p\.prosrc/);
 assert.match(sql,/production_installation_authorised/);
 assert.match(sql,/'BLOCK'/);
 assert.doesNotMatch(stripped,/\b(?:insert|update|delete|truncate|alter|create|drop|grant|revoke|call|execute)\s+(?:into|from|table|function|trigger|index|policy|on|\w+\s*\()/i);
 assert.doesNotMatch(stripped,/pg_read_file|pg_ls_dir|dblink|select\s+\*\s+from\s+public\.ebay_deletion_receipts/i);
});
