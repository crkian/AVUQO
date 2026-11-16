import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("public eBay UK discovery remains fixed external affiliate links, not item storage",()=>{
 const epn=read("lib/ebay/epn-uk-links.ts");
 const page=read("app/partners/ebay-uk/page.tsx");
 assert.match(epn,/const IDS=new Set/);
 assert.match(epn,/unknown_ebay_uk_collection/);
 assert.match(epn,/https:\/\/www\.ebay\.co\.uk\//);
 assert.match(page,/ebayUkEpnHref\(/);
 assert.match(page,/rel="sponsored noopener noreferrer"/);
 assert.match(page,/not verified AVUQO price comparisons or ranked product offers/);
 assert.doesNotMatch(epn+page,/createAdminClient|\.insert\(|\.upsert\(|\.update\(|localStorage|sessionStorage/);
});

test("eBay private Browse diagnostics return aggregate counts with no persisted item values",()=>{
 const route=read("app/api/internal/ebay-browse-preflight/route.ts");
 assert.match(route,/no_database_writes:true/);
 assert.match(route,/no_product_values_returned:true/);
 assert.match(route,/no_import:true/);
 assert.match(route,/no_publication:true/);
 assert.match(route,/\.eq\("connector_key","ebay"\)/);
 assert.match(route,/source\.status!=="paused"/);
 assert.match(route,/source\.sync_enabled!==false/);
 assert.doesNotMatch(route,/\.insert\(|\.upsert\(|\.update\(|\.delete\(|createBucket\(/);
});

test("delayed persistent eBay importer must be explicitly reviewed before any exemption claim",()=>{
 const sql=read("supabase/migrations/20261116141000_ebay_ingestion_quarantine.sql");
 for(const table of ["offers","source_ingestion_items","product_matches","price_history"])
  assert.match(sql,new RegExp("before insert or update on public\\."+table+" for each row"));
 assert.match(sql,/ebay_source_activation_quarantine/);
 const webhook=read("app/api/ebay/account-deletion/route.ts");
 assert.match(webhook,/status:503/);
});
