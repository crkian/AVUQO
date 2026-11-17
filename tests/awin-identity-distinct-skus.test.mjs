import test from "node:test";
import assert from "node:assert/strict";
import {normalizeOffer} from "../lib/pipeline/normalize.ts";
const base={
 merchantName:"Petlibro UK Affiliate Program",merchantExternalId:"77952",
 category:"home",brand:"Petlibro",model:null,description:null,
 price:100,currency:"GBP",affiliateUrl:null,sourceUrl:null,
 stockStatus:"in_stock",raw:{feed_id:"103580"}
};
test("different products with same brand but no model never share a canonical key",()=>{
 const a=normalizeOffer({...base,sourceRecordId:"77952:SKU-A",title:"Petlibro One Bowl Feeder"});
 const b=normalizeOffer({...base,sourceRecordId:"77952:SKU-B",title:"Petlibro Cat Water Fountain"});
 assert.notEqual(a.canonicalKey,b.canonicalKey);
 assert.equal(a.canonicalKey,"petlibro-one-bowl-feeder");
 assert.equal(b.canonicalKey,"petlibro-cat-water-fountain");
});
test("brand+model remains stable for matches when both are explicitly present",()=>{
 const a=normalizeOffer({...base,sourceRecordId:"77952:SKU-A",title:"Long retailer title",
  model:"PL-500"});
 const b=normalizeOffer({...base,sourceRecordId:"77952:SKU-B",title:"Different wording",
  model:"PL-500"});
 assert.equal(a.canonicalKey,b.canonicalKey);
});
