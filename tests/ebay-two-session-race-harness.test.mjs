import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const script=readFileSync(new URL("../scripts/test-ebay-tombstone-race.sh",import.meta.url),"utf8");
test("owner-gated psql two-process race proof cannot silently succeed without contention",()=>{
 assert.match(script,/ALLOW_EBAY_RACE_TEST/);
 assert.match(script,/EBAY_RACE_TEST_DATABASE_URL/);
 assert.match(script,/holder_pid=\$!/);
 assert.match(script,/grep -q '\^EBAY_LOCK_HELD\$'/);
 assert.match(script,/lock_timeout='1200ms'/);
 assert.match(script,/55P03/);
 assert.match(script,/contender_rc.*-eq 0/);
 assert.match(script,/FAIL: two-session lock contention was NOT proven/);
});
test("synthetic receipt and link do not commit, verify baseline and clean up temporary files",()=>{
 assert.match(script,/insert into public\.ebay_deletion_receipts/);
 assert.match(script,/insert into public\.ebay_account_item_links/);
 assert.match(script,/rollback;/i);
 assert.match(script,/trap cleanup EXIT/);
 assert.match(script,/post="\$\(sql -c/);
 assert.match(script,/\$pre" == "\$post/);
 assert.match(script,/synthetic receipt remains/);
 assert.match(script,/synthetic link remains/);
 assert.doesNotMatch(script,/delete from public\.ebay_deletion_receipts|truncate public\./i);
});
