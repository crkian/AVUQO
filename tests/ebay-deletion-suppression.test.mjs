import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHmac} from "node:crypto";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const identity=read("lib/ebay/deletion-identity.ts");
const receipt=read("lib/ebay/deletion-journal.ts");
const guard=read("lib/ebay/deletion-suppression.ts");

test("suppression uses exactly the receipt's HMAC domains and secret",()=>{
 assert.match(identity,/EBAY_DELETION_HMAC_SECRET/);
 assert.match(identity,/createHmac\("sha256",secret\)/);
 assert.match(identity,/digest\("userId",id\)/);
 assert.match(identity,/digest\("username",username\)/);
 assert.match(identity,/digest\("eiasToken",eias\)/);
 assert.match(receipt,/ebayAccountDigests\(data\)/);
 assert.match(guard,/ebayAccountDigests\(identifiers\)/);
 const key="synthetic_test_key_abcdefghijklmnopqrstuvwxyz";
 const hash=(domain,value)=>createHmac("sha256",key).update(domain+"\0"+value).digest("hex");
 assert.equal(hash("userId","123"),hash("userId","123"));
 assert.notEqual(hash("userId","123"),hash("username","123"));
});

test("all present account identifiers must be checked and any match suppresses",()=>{
 assert.match(guard,/Object\.entries\(digests\)/);
 assert.match(guard,/\.eq\(field,value\)\.limit\(1\)/);
 assert.match(guard,/if\(data\.length>0\)return "suppressed"/);
 assert.match(guard,/if\(error\)return "unavailable"/);
 assert.match(guard,/if\(!digests\)return "unavailable"/);
 assert.match(guard,/catch\{return "unavailable";\}/);
 assert.match(guard,/==="clear"/);
 assert.doesNotMatch(guard,/return true;|return "clear";\s*catch/);
});

test("receipt database access remains privileged and private",()=>{
 assert.match(guard,/import "server-only"/);
 assert.match(guard,/createAdminClient\(\)/);
 assert.doesNotMatch(guard,/NEXT_PUBLIC_/);
 const sql=read("supabase/migrations/20261116124500_ebay_private_deletion_receipt_journal.sql");
 assert.match(sql,/alter table public\.ebay_deletion_receipts enable row level security/);
 assert.match(sql,/grant select,insert on table public\.ebay_deletion_receipts to service_role/);
});
