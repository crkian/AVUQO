import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const script=readFileSync(new URL("../scripts/test-ebay-reverse-lock-witness.sh",import.meta.url),"utf8");
test("reverse direction uses independent psql processes and receipt lock timeout",()=>{
 assert.match(script,/ALLOW_EBAY_RACE_TEST/);
 assert.match(script,/EBAY_RACE_TEST_DATABASE_URL/);
 assert.match(script,/holder_pid=\$!/);
 assert.match(script,/pg_advisory_xact_lock/);
 assert.match(script,/avuqo-ebay-account:user_id_digest/);
 assert.match(script,/EBAY_REVERSE_LOCK_HELD/);
 assert.match(script,/insert into public\.ebay_deletion_receipts/);
 assert.match(script,/lock_timeout='1200ms'/);
 assert.match(script,/55P03/);
 assert.match(script,/contender_rc.*-eq 0/);
});
test("reverse witness does not claim end-to-end admission or commit test fixtures",()=>{
 assert.match(script,/rollback;/i);
 assert.match(script,/trap cleanup EXIT/);
 assert.match(script,/\$pre" == "\$post/);
 assert.match(script,/NOT a real link-first transaction proof/);
 assert.doesNotMatch(script,/insert into public\.ebay_account_item_links|delete from public\.ebay_deletion_receipts|truncate public\./i);
});
