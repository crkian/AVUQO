import test from "node:test";
import assert from "node:assert/strict";
import {checkedTyreHeader,currentTyreCandidate,rowDictionary} from "../lib/awin/tyres-uk-server-candidates.ts";

const header=[
 "merchant_id","merchant_product_id","product_name","description","search_price",
 "currency","custom_1","custom_2","custom_3","custom_4","custom_5"
];
const valid={
 merchant_id:"12715",merchant_product_id:"9998588",product_name:"N Fera Sport",
 description:"235/35 ZR19 91Y",search_price:"115.99",currency:"GBP",
 custom_1:"235",custom_2:"35",custom_3:"19",custom_4:"91",custom_5:"Y"
};

test("recognises exact Tyres UK feed schema without accepting duplicates",()=>{
 assert.deepEqual(checkedTyreHeader(header),header);
 assert.throws(()=>checkedTyreHeader([...header,header[0]]));
 assert.throws(()=>checkedTyreHeader(header.filter(name=>name!=="custom_5")));
 assert.throws(()=>rowDictionary(header,["12715"]));
});
test("creates unverified candidate from corroborated recent Awin snapshot",()=>{
 const candidate=currentTyreCandidate(valid);
 assert.equal(candidate?.merchant_product_id,"9998588");
 assert.equal(candidate?.load_index,"91");
 assert.equal(candidate?.speed_rating,"Y");
 assert.equal(candidate?.price,"115.99");
 assert.equal(candidate?.corroborated,true);
});
test("does not guess ratings from conflicting or missing evidence",()=>{
 assert.equal(currentTyreCandidate({...valid,custom_4:"92"}),null);
 assert.equal(currentTyreCandidate({...valid,description:"235/35 ZR19 91Y and 235/35 ZR19 91Y"}),null);
 assert.equal(currentTyreCandidate({...valid,description:"235 R19 91Y"}),null);
});
test("rejects cross-advertiser rows and malformed source prices",()=>{
 assert.throws(()=>currentTyreCandidate({...valid,merchant_id:"77952"}));
 assert.equal(currentTyreCandidate({...valid,search_price:"0"}),null);
 assert.equal(currentTyreCandidate({...valid,search_price:"115.999"}),null);
 assert.equal(currentTyreCandidate({...valid,currency:"USD"}),null);
 assert.equal(currentTyreCandidate({...valid,merchant_product_id:"unsafe/id"}),null);
});
test("does not silently truncate changed titles or accept oversized fields",()=>{
 assert.equal(currentTyreCandidate({...valid,product_name:"x".repeat(501)}),null);
 assert.equal(rowDictionary(header,header.map((_,i)=>String(i))).custom_5,"10");
});
