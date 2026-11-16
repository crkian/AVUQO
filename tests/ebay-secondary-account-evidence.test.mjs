import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116211000_ebay_secondary_account_reference_counts.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const fixture=read("tests/fixtures/ebay-local-secondary-account-evidence.sql");
test("DBA-only secondary counts are exact account-linked and eBay source scoped",()=>{
 assert.match(sql,/public\.ebay_secondary_account_reference_counts\(p_receipt_id bigint\)/);
 assert.match(sql,/join public\.offers o on o\.id=l\.offer_id and o\.source_id=v_source/);
 for(const kind of ["user_id_digest","username_digest","eias_token_digest"])
  assert.match(sql,new RegExp("l\\.identity_kind='"+kind+"'"));
 for(const table of ["analytics_events","attribution_events","user_feedback","watch_events"])
  assert.match(sql,new RegExp("from public\\."+table+" e"));
 assert.match(sql,/array_agg\(distinct o\.id\)/);
 assert.match(sql,/revoke all on function public\.ebay_secondary_account_reference_counts\(bigint\)/);
 assert.doesNotMatch(sql,/delete from|truncate |update public\.|grant execute|state='completed'\s*;|pg_catalog\.dblink|http_post/i);
});
test("native PostgreSQL exercises alias deduplication, cross-source isolation and full rollback",()=>{
 for(const path of ["20261116211000_ebay_secondary_account_reference_counts.sql","ebay-local-secondary-account-evidence.sql"])
  assert.ok(runner.includes(path),path);
 for(const expected of ["Expected one distinct linked eBay offer","Expected four secondary records","Unrelated source data leaked into account evidence","Zero-linked account must have zero secondary records","Synthetic secondary evidence residue remains","rollback;"])
  assert.ok(fixture.includes(expected),expected);
});
