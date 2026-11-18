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
