import test from "node:test";
import assert from "node:assert/strict";
import {privateTooledUpValidationRow} from "../lib/awin/private-validation-report.ts";

const sha="a".repeat(64);
const key=`awin/496/89987/${sha}.csv.gz`;
const report={
 status:"validated_private_diagnostics",advertiser_id:"496",feed_id:"89987",
 source_columns:29,actual_rows:84245,compressed_bytes:14000000,expanded_bytes:135000000,
 snapshot_sha256:sha,wrong_merchant_rows:0,wrong_feed_rows:0,missing_product_ids:0,
 duplicate_product_ids:0,invalid_price_rows:0,unverified_affiliate_links:0,
 missing_titles:0,out_of_stock_rows:123,critical_issues:0,currency_verified:false,
 rights_verified:false,ready_to_stage:false,private_only:true
};
test("report binds to exact snapshot digest, remains non-runnable",()=>{
 const row=privateTooledUpValidationRow(report,key);
 assert.equal(row.object_key,key);
 assert.equal(row.ready_to_stage,false);
 assert.equal(row.currency_verified,false);
 assert.equal(row.rights_verified,false);
 assert.equal(row.actual_rows,84245);
 assert.equal(row.out_of_stock_rows,123);
});
test("wrong object or currency approval flag fail closed",()=>{
 assert.throws(()=>privateTooledUpValidationRow(report,key.replace("496","497")),/mismatch/);
 assert.throws(()=>privateTooledUpValidationRow({...report,currency_verified:true},key),/invalid_private_diagnostics/);
 assert.throws(()=>privateTooledUpValidationRow({...report,critical_issues:1},key),/critical_count_mismatch/);
 assert.throws(()=>privateTooledUpValidationRow({...report,duplicate_product_ids:84246,critical_issues:84246},key),/invalid_validation_counter/);
});
