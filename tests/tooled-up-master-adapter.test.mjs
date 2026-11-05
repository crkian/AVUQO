import test from "node:test";
import assert from "node:assert/strict";
import {TOOLED_UP_SOURCE_FIELDS,normalizeTooledUpMasterChunk,validateTooledUpMasterChunk} from "../lib/awin/tooled-up-master-adapter.ts";

const header=[...TOOLED_UP_SOURCE_FIELDS];
const values=Object.fromEntries(header.map(name=>[name,""]));
Object.assign(values,{
 data_feed_id:"89987",merchant_id:"496",merchant_name:"Tooled Up",
 merchant_product_id:"TU-123",product_name:"Example hand tool",search_price:"14.99",
 aw_deep_link:"https://www.awin1.com/pclick.php?p=123&m=496&a=3135746",
 stock_status:"in stock",brand_name:"Example",category_name:"Hand Tools"
});
const row=header.map(name=>values[name]);
const approval={
 advertiser_id:"496",feed_id:"89987",currency:"GBP",
 evidence_ref:"uk_feed_terms_2026",approved_for_private_staging:true
};
test("source header alone is insufficient proof of GBP",()=>{
 assert.throws(()=>normalizeTooledUpMasterChunk("496","89987",header,[row]),/currency_evidence_required/);
});
test("rejects mismatched feed, advertiser and malformed headers",()=>{
 assert.throws(()=>normalizeTooledUpMasterChunk("496","89988",header,[row],approval),/not_allowlisted/);
 assert.throws(()=>normalizeTooledUpMasterChunk("31539","89987",header,[row],approval),/not_allowlisted/);
 assert.throws(()=>normalizeTooledUpMasterChunk("496","89987",[...header.slice(1),header[1]],[row],approval),/schema_mismatch/);
 assert.throws(()=>normalizeTooledUpMasterChunk("496","89987",header,[[...row.slice(0,-1)]],approval),/column_mismatch/);
});
test("never allows cross-advertiser product rows",()=>{
 const other=[...row];other[header.indexOf("merchant_id")]="31539";
 assert.throws(()=>normalizeTooledUpMasterChunk("496","89987",header,[other],approval),/advertiser_mismatch/);
});
test("with independent evidence, maps to strict existing validator in private review",()=>{
 const records=validateTooledUpMasterChunk("496","89987",header,[row],approval);
 assert.equal(records.length,1);
 assert.equal(records[0].status,"review");
 assert.equal(records[0].currency,"GBP");
 assert.equal(records[0].metadata.permission_status,"unverified");
 assert.equal(records[0].metadata.source_image_rights_confirmed,false);
 assert.equal(records[0].metadata.source_currency_explicit,false);
 assert.equal(records[0].metadata.currency_evidence_ref,"uk_feed_terms_2026");
});
test("invalid tracking link is excluded by strict validator",()=>{
 const other=[...row];other[header.indexOf("aw_deep_link")]="https://example.com/p";
 const records=validateTooledUpMasterChunk("496","89987",header,[other],approval);
 assert.equal(records[0].status,"excluded");
 assert.ok(records[0].reasons.includes("tracking_link_unverified"));
});
