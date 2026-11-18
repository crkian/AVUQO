import test from "node:test";
import assert from "node:assert/strict";
import {redactedTyreRecheckFailure} from "../lib/awin/tyre-recheck-failure.mjs";
test("tyre cron preserves recognised safe reasons and stages",()=>{
 assert.deepEqual(redactedTyreRecheckFailure(Error("invalid_feed_schema"),"parse"),{
  status:"invalid_feed_schema",diagnostic_stage:"parse",no_publication:true,private_only:true});
});
test("unexpected fetch failure identifies a safe stage without leaking supplier URLs",()=>{
 const secret="https://productdata.awin.com/feed?apikey=do-not-print";
 const output=redactedTyreRecheckFailure(Error("Fetch failed "+secret),"download");
 assert.equal(output.status,"tyre_download_failed");
 assert.equal(output.diagnostic_stage,"download");
 assert.doesNotMatch(JSON.stringify(output),/apikey|do-not-print/);
});
test("untrusted error text and stage cannot become returned diagnostic content",()=>{
 const output=redactedTyreRecheckFailure(Error("some secret"),"https://bad.example/path");
 assert.equal(output.status,"tyre_unexpected_failed");
 assert.equal(output.diagnostic_stage,"unexpected");
});

test("bounded CSV parser failures are distinct but reveal no supplier payload",()=>{
 for(const [msg,expected] of [
  ["CSV field exceeds 10,000 characters","tyre_csv_field_limit"],
  ["CSV column count exceeds 120","tyre_csv_column_limit"],
  ["Incomplete quoted CSV field","tyre_csv_unterminated_quote"],
  ["Unexpected character after closing quote","tyre_csv_quoted_field_format"]
 ]){
  assert.deepEqual(redactedTyreRecheckFailure(Error(msg),"parse"),{
   status:expected,diagnostic_stage:"parse",private_only:true,no_publication:true
  });
 }
 const secret="provider url with key=do-not-log";
 assert.equal(redactedTyreRecheckFailure(Error(secret),"parse").status,"tyre_parse_failed");
});
