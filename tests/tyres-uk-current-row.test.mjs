import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {csvRowsFromChunks} from "../lib/feed-imports/stream-csv.ts";
import {verifiedTyresUkRow} from "../lib/awin/tyres-uk-current-row.mjs";
const header=["merchant_id","merchant_product_id","product_name","search_price","currency",
 "aw_deep_link","merchant_image_url","in_stock"];
const valid=["12715","123-XL-95V","Sample Tyre 205/55 R16 95V XL","66.10","GBP",
 "https://www.awin1.com/pclick.php?p=1234&a=3135746&m=12715",
 "https://static.tyres.net/test.jpg","1"];
test("Tyres UK authenticated product preserves exact SKU and tracked image",()=>{
 const x=verifiedTyresUkRow(header,valid);
 assert.equal(x?.sku,"123-XL-95V");assert.equal(x?.price,66.1);
 assert.equal(x?.stock,"in_stock");assert.equal(x?.images.length,1);
});
test("Wrong advertiser or publisher account never enters shopping",()=>{
 for(const [index,change] of [[0,"15236"],[5,
  "https://www.awin1.com/pclick.php?p=1234&a=9999999&m=12715"]]){
  const v=[...valid];v[index]=change;
  assert.equal(verifiedTyresUkRow(header,v),null);
 }
});
test("Missing real GBP price or stock is not made live",()=>{
 for(const [index,change] of [[3,"0"],[4,"EUR"],[7,"0"]]){
  const v=[...valid];v[index]=change;
  assert.equal(verifiedTyresUkRow(header,v),null);
 }
});

test("authenticated Tyres UK CSV allows known long custom_6 fields but preserves SKU gates",async()=>{
 const extended=[...header,"custom_6"];
 const synthetic=[extended.join(","),[...valid,"x".repeat(16422)].join(",")].join("\n")+"\n";
 const generator=(async function*(){yield synthetic;})();
 const parsed=[];
 for await(const row of csvRowsFromChunks(generator,",",120,20000))parsed.push(row);
 assert.equal(parsed.length,2);
 assert.equal(parsed[1][8].length,16422);
 assert.equal(verifiedTyresUkRow(parsed[0],parsed[1])?.sku,"123-XL-95V");
 const source=readFileSync("app/api/internal/awin-tyres-uk-live-recheck/route.ts","utf8");
 assert.match(source,/const rows=lines\(text,20000\)/);
 assert.match(source,/if\(advertiser!==ADVERTISER\|\|!sku\|\|seen.has\(sku\)\)/);
 assert.match(source,/verifiedTyresUkRow\(header,values\)/);
 assert.match(source,/sourceReady\(db\)/);
});
test("oversize fields remain rejected by the Tyres UK CSV parser",async()=>{
 const source=[...header,"custom_6"].join(",")+"\n"+[...valid,"x".repeat(20001)].join(",")+"\n";
 await assert.rejects(async()=>{
  for await(const _ of csvRowsFromChunks((async function*(){yield source;})(),",",120,20000))void _;
 },/CSV field exceeds/);
});
