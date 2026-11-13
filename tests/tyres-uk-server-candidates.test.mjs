import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {checkedTyreHeader,currentTyreCandidate,rowDictionary} from "../lib/awin/tyres-uk-server-candidates.ts";
const header=["merchant_id","merchant_product_id","product_name","description","search_price","currency","custom_1","custom_2","custom_3","custom_4","custom_5"];
const good={merchant_id:"12715",merchant_product_id:"9998588",product_name:"N Fera Sport",description:"235/35 ZR19 91Y",search_price:"115.99",currency:"GBP",custom_1:"235",custom_2:"35",custom_3:"19",custom_4:"91",custom_5:"Y"};
test("Tyres UK snapshot schema requires each current technical source field",()=>{
 assert.deepEqual(checkedTyreHeader(header),header);
 assert.throws(()=>checkedTyreHeader([...header,header[0]]));
 assert.throws(()=>checkedTyreHeader(header.filter(x=>x!=="custom_5")));
 assert.throws(()=>rowDictionary(header,["12715"]));
});
test("corroborated source evidence produces only unverified private technical fields",()=>{
 const c=currentTyreCandidate(good);
 assert.equal(c?.merchant_product_id,"9998588");
 assert.equal(c?.load_index_candidate,"91");
 assert.equal(c?.speed_rating_candidate,"Y");
 assert.equal(c?.corroborated,true);
 assert.equal(c?.fitment_verified,false);
 assert.equal(c?.public_offer_approved,false);
 assert.ok(!("price" in c),"Never turn a source-row number into a published or existing price");
});
test("reject inconsistent, malformed, cross-merchant or stale-looking evidence",()=>{
 for(const row of [
  {...good,custom_4:"92"},{...good,description:"235 R19 91Y"},
  {...good,description:"235/35 ZR19 91Y and 235/35 ZR19 91Y"},
  {...good,search_price:"0"},{...good,search_price:"115.999"},
  {...good,currency:"USD"},{...good,merchant_product_id:"bad/id"},
  {...good,product_name:"x".repeat(501)}
 ])assert.equal(currentTyreCandidate(row),null);
 assert.throws(()=>currentTyreCandidate({...good,merchant_id:"77952"}),/cross_advertiser/);
});
test("safe candidate code is pure and cannot activate old snapshot or update public offers",()=>{
 const src=readFileSync(new URL("../lib/awin/tyres-uk-server-candidates.ts",import.meta.url),"utf8");
 for(const bad of ["createAdminClient","AWIN_TYRE_AUTO_ENRICH_ENABLED","fetch(","storage.","upsert(","insert(","rpc(","93988","cron"])assert.ok(!src.includes(bad),bad);
 const cron=readFileSync(new URL("../vercel.json",import.meta.url),"utf8");
 assert.ok(!cron.includes("awin-tyre-auto-enrich"));
});
