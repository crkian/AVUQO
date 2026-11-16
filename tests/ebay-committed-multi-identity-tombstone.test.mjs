import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("tests/fixtures/ebay-committed-multi-identity-tombstone.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const workflow=read(".github/workflows/quality.yml");
test("three supported aliases have real committed links before receipt commit",()=>{
 for(const v of ["user_id_digest","username_digest","eias_token_digest"])assert.ok(sql.includes("'"+v+"'"),v);
 assert.match(sql,/insert into public\.ebay_account_item_links/);
 assert.match(sql,/insert into public\.ebay_deletion_receipts/);
 assert.ok((sql.match(/^commit;$/gm)||[]).length===2);
 assert.match(sql,/Committed synthetic account links missing/);
});
test("tombstone suppresses all aliases, forbids relinking and false completion",()=>{
 assert.match(sql,/ebay_is_account_digest_suppressed/);
 assert.match(sql,/Deleted eBay account cannot be relinked/);
 assert.match(sql,/False completion was accepted/);
 assert.match(sql,/v_work_count<>7/);
 assert.match(sql,/state<>'pending'/);
 assert.match(sql,/COMMITTED_MULTI_IDENTITY_TOMBSTONE_PASS/);
});
test("native job executes committed fixture after rolled-back race probes",()=>{
 assert.match(runner,/test-ebay-committed-link-first-race\.sh[\s\S]*ebay-committed-multi-identity-tombstone\.sql/);
 assert.match(workflow,/Native PostgreSQL eBay concurrency \(synthetic, no Docker\)/);
 assert.doesNotMatch(sql,/drop table|truncate table|delete from public\.ebay_deletion_receipts|update public\.sources/i);
});
