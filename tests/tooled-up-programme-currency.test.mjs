import test from "node:test";
import assert from "node:assert/strict";
import {inspectTooledUpProgrammeCurrency} from "../lib/awin/tooled-up-programme-currency.ts";
const publisher="3135746",token="a".repeat(20);
function response(items){
 return async()=>new Response(JSON.stringify(items),{status:200,headers:{"content-type":"application/json"}});
}
test("joined programme GBP yields evidence, never staging approval",async()=>{
 const r=await inspectTooledUpProgrammeCurrency(publisher,token,
  await response([{id:496,currencyCode:"GBP",status:"Active"}]));
 assert.equal(r.currency_verified,true);
 assert.equal(r.ready_to_stage,false);
 assert.equal(r.no_publication,true);
});
test("non GBP is recorded, not silently treated as GBP",async()=>{
 const r=await inspectTooledUpProgrammeCurrency(publisher,token,
  await response([{id:496,currencyCode:"EUR"}]));
 assert.equal(r.currency_verified,false);
});
test("missing or duplicate joined programme fails closed",async()=>{
 for(const values of [[],[{id:496,currencyCode:"GBP"},{id:496,currencyCode:"GBP"}]]){
  await assert.rejects(()=>inspectTooledUpProgrammeCurrency(publisher,token,
   await response(values)),/missing_or_ambiguous/);
 }
});
