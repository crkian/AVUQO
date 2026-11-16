import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("scripts/ebay-cascade-readonly-preflight.sql");
const script=read("scripts/test-ebay-cascade-readonly-preflight.sh");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const manifest=read("tests/fixtures/ebay-migration-replay-manifest.txt");
test("read-only live-safe diagnostic pins all seven observed cascading FKs and new guard",()=>{
 const names=["availability","awin_offer_release_reviews","awin_release_audit",
 "click_events","deal_scores","promotion_candidates","published_deals"];
 for(const t of names)assert.ok(sql.includes("'public."+t+"'"),t);
 assert.match(sql,/c\.confdeltype='c' and c\.convalidated/);
 assert.match(sql,/enabled_count/);
 assert.match(sql,/cascade_containment_guard_enabled/);
 assert.match(sql,/seven_validated_cascade_fks/);
 assert.doesNotMatch(sql.replace(/^--.*$/gm,""),/\b(delete|update|insert|alter|create|drop|grant|truncate)\b/i);
});
test("local CI and ordered replay include the thirteenth guard without provider activation",()=>{
 assert.match(runner,/test-ebay-cascade-readonly-preflight\.sh/);
 assert.match(script,/avuqo_ebay_ci_synthetic/);
 assert.match(script,/DATABASE_URL/);
 assert.match(script,/EBAY_SEVEN_CASCADE_READONLY_PREFLIGHT_PASS/);
 assert.match(manifest,/20261116230000_ebay_unreviewed_offer_cascade_guard.sql/);
 assert.match(read("scripts/test-ebay-ordered-migration-replay.sh"),/count" -eq 13/);
 assert.match(read("scripts/ebay-full-schema-readonly-preflight.sql"),/provider_release_authorised/);
});
