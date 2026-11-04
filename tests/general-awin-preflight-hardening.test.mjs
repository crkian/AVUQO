import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prepareGeneralBatch,identifyFormat} from "../lib/feed-imports/general-awin-large.ts";
const standard=["merchant_id","merchant_product_id","product_name","search_price","currency","brand_name","aw_deep_link"];
const row=(id,merchant="31539")=>[merchant,id,"Phone model","199.00","GBP","Brand",
 "https://www.awin1.com/pclick.php?m="+merchant+"&a=3135746&p="+id];
test("new import preflight does not write to API and validates sample against chosen advertiser",()=>{
 const ui=readFileSync("app/control-centre/general-feed-import/GeneralFeedImport.tsx","utf8");
 assert.match(ui,/async function check\(\)/);
 assert.match(ui,/identifyFormat\(headers\)/);
 assert.match(ui,/prepareGeneralBatch\(merchant,feedId,headers,sample\)/);
 assert.ok(ui.indexOf("async function check()") < ui.indexOf("async function start()"));
 assert.match(ui,/diagnosis\.fileKey!==fileKey\(file,merchant,feedId\)/);
 assert.match(ui,/Inspect actual feed columns/);
 assert.ok(ui.includes(String.raw`if(!/\.(csv|tsv)(\.gz)?$/i.test(file.name))`),"Preflight must accept actual .csv/.tsv file extensions");
 assert.match(ui,/sample, not a validation of the entire feed/);
});
test("TSV and compressed TSV are valid in both browser and server",()=>{
 const ui=readFileSync("app/control-centre/general-feed-import/GeneralFeedImport.tsx","utf8");
 const api=readFileSync("app/api/control-centre/general-feed-import/route.ts","utf8");
 assert.match(ui,/csv\|tsv/);
 assert.match(api,/csv\|tsv/);
 assert.match(api,/Request body too large/);
});
test("service and contract source products are quarantined without inventing physical product offers",()=>{
 assert.equal(identifyFormat(standard),"awin-csv");
 const service=prepareGeneralBatch("37738","81201",standard,[row("PLAN-1","37738")])[0];
 assert.equal(service.status,"excluded");
 assert.ok(service.reasons.includes("service_contract_adapter_pending"));
 assert.equal(service.metadata.listing_kind,"service_or_contract");
 const physical=prepareGeneralBatch("31539","74135",standard,[row("PHONE-1")])[0];
 assert.equal(physical.status,"review");
 assert.equal(physical.metadata.listing_kind,"physical_product");
 const plan=prepareGeneralBatch("31539","97136",standard,[row("PLAN-2")])[0];
 assert.ok(plan.reasons.includes("service_contract_adapter_pending"));
});
test("database enforces exact feed IDs, source privileges, and general-session prefix",()=>{
 const sql=readFileSync("supabase/migrations/20261104201000_general_awin_feed_binding_hardening.sql","utf8");
 const api=readFileSync("app/api/control-centre/general-feed-import/route.ts","utf8");
 assert.match(sql,/split_part\(v_run\.filename,'__',2\)/);
 assert.match(sql,/revoke all on function public\.append_general_awin_feed_chunk/);
 assert.match(sql,/GENAWIN__/);
 assert.ok(api.indexOf("currentSource")<api.indexOf('if(action==="status")'));
 assert.match(api,/joinedInSource\(currentSource\.metadata,run\.merchant_id\)/);
 assert.match(api,/GENAWIN__/);
});
