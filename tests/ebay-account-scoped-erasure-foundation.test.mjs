import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sql=readFileSync(new URL("../supabase/migrations/20261116132000_ebay_account_scoped_erasure_foundation.sql",import.meta.url),"utf8");
const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");

test("eBay ownership only maps HMAC account digests to exact existing eBay rows",()=>{
 assert.match(sql,/create table public\.ebay_account_item_links/);
 assert.match(sql,/identity_digest text not null/);
 assert.match(sql,/offer_id uuid references public\.offers\(id\) on delete cascade/);
 assert.match(sql,/ingestion_item_id uuid references public\.source_ingestion_items\(id\) on delete cascade/);
 assert.match(sql,/ebay_link_exactly_one_target/);
 assert.match(sql,/s\.connector_key='ebay'/);
 assert.match(sql,/before insert or update/);
 assert.doesNotMatch(sql,/raw_user_id|raw_username|raw_payload/i);
});

test("new account map has no browser rights and does not give service role delete",()=>{
 assert.match(sql,/alter table public\.ebay_account_item_links enable row level security/);
 assert.match(sql,/revoke all on public\.ebay_account_item_links from public,anon,authenticated,service_role/);
 assert.match(sql,/grant select,insert on public\.ebay_account_item_links to service_role/);
 assert.doesNotMatch(sql,/grant (update|delete|truncate) on public\.ebay_account_item_links to service_role/i);
});

test("partial erasure targets only source-matched exact linked rows, holds receipt, never completes it",()=>{
 assert.match(sql,/create function public\.ebay_purge_mapped_account_rows\(p_notification_digest text\)/);
 assert.match(sql,/for update;/);
 assert.match(sql,/l\.identity_kind='user_id_digest'/);
 assert.match(sql,/l\.identity_kind='username_digest'/);
 assert.match(sql,/l\.identity_kind='eias_token_digest'/);
 assert.match(sql,/o\.source_id=v_source and o\.id=any\(v_offers\)/);
 assert.match(sql,/i\.source_id=v_source and i\.id=any\(v_items\)/);
 assert.match(sql,/h\.source_id=v_source and h\.offer_id=any\(v_offers\)/);
 assert.match(sql,/m\.source_id=v_source/);
 assert.match(sql,/revoke all on function public\.ebay_purge_mapped_account_rows\(text\)/);
 assert.doesNotMatch(sql,/grant execute on function public\.ebay_purge_mapped_account_rows/);
 assert.doesNotMatch(sql,/update public\.ebay_deletion_receipts set state='completed'/);
 assert.match(route,/status:503/);
 assert.doesNotMatch(route,/ebay_purge_mapped_account_rows/);
});
