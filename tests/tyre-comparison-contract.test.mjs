import test from "node:test";
import assert from "node:assert/strict";
import {compareTyreVariants,comparableTotal,rankComparableQuotes,independentSellerCount}
 from "../lib/tyres/comparison-contract.ts";

const base={
 brand:"Michelin",model:"Pilot Sport 5",
 widthMm:235,aspectRatio:40,rimInches:19,loadIndex:"96",speedRating:"Y",
 season:"summer",xl:true,runFlat:false,oeMarking:""
};
const fees={
 delivery:0,fitting_per_tyre:1800,balancing_per_tyre:400,
 valve_per_tyre:150,disposal_per_tyre:200,mobile_visit:0,other:0
};
const quote={
 offerId:"A1",canonicalVariantId:"canonical-1",sourcePlatform:"retailer A",
 underlyingSellerId:"retailer-A",sourceKind:"direct",quantity:2,
 fulfilment:"centre_fitted",locationKey:"LS1",currency:"GBP",
 unitPricePence:10000,vatIncluded:true,fees,
 includedInUnitPrice:[],eligibleDiscountPence:0,sourceVerified:true
};

test("only complete exact variants can be compared as same-SKU offers",()=>{
 assert.equal(compareTyreVariants(base,{...base}),"exact");
 assert.equal(compareTyreVariants(base,{...base,brand:"ContinentAL"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,loadIndex:"100"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,speedRating:"W"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,runFlat:true}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,xl:false}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,season:"winter"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,oeMarking:"MO"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,aspectRatio:45}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,model:"Pilot Sport 4"}),"conflict");
 assert.equal(compareTyreVariants(base,{...base,runFlat:null}),"insufficient_evidence");
 assert.equal(compareTyreVariants(base,{...base,speedRating:null}),"insufficient_evidence");
 assert.equal(compareTyreVariants(base,{...base,gtin:"123"},),"exact");
 assert.equal(compareTyreVariants({...base,gtin:"111"},{...base,gtin:"222"}),"conflict");
});
test("price only becomes comparable if all required fitting charges and VAT are evidenced",()=>{
 const result=comparableTotal(quote);
 assert.deepEqual(result,{status:"complete",totalPence:25100,scope:"canonical-1|2|centre_fitted|LS1"});
 assert.equal(comparableTotal({...quote,fees:{...fees,disposal_per_tyre:null}}).status,"incomplete");
 assert.equal(comparableTotal({...quote,vatIncluded:null}).status,"incomplete");
 assert.equal(comparableTotal({...quote,locationKey:null}).status,"incomplete");
 assert.equal(comparableTotal({...quote,sourceVerified:false}).status,"incomplete");
 assert.equal(comparableTotal({...quote,quantity:0}).status,"incomplete");
});
test("documented included charges avoid double charging and contradictory flags fail",()=>{
 const q={...quote,includedInUnitPrice:["fitting_per_tyre"],fees:{...fees,fitting_per_tyre:0}};
 assert.equal(comparableTotal(q).status,"complete");
 assert.equal(comparableTotal({...q,fees:{...fees,fitting_per_tyre:1800}}).status,"incomplete");
});
test("delivery-only prices never rank against fitted quotes",()=>{
 const delivery={...quote,offerId:"B2",fulfilment:"delivered",locationKey:null,
  fees:{...fees,delivery:350}};
 const result=comparableTotal(delivery);
 assert.equal(result.status,"complete");
 const ranked=rankComparableQuotes([quote,{...quote,offerId:"C3",unitPricePence:9500}]);
 assert.equal(ranked[0].offer.offerId,"C3");
 // Mixed scope rows are handled separately by product UI, not one cheapest badge.
 assert.equal(rankComparableQuotes([delivery]).length,1);
 assert.equal(rankComparableQuotes([quote,delivery]).length,0);
 assert.equal(rankComparableQuotes([quote,{...quote,locationKey:"LS2"}]).length,0);
});
test("unattributed marketplaces are not counted as distinct independent sellers",()=>{
 assert.equal(independentSellerCount([
 {sourceKind:"direct",underlyingSellerId:"retailer-A"},
 {sourceKind:"marketplace",underlyingSellerId:"retailer-A"},
 {sourceKind:"marketplace",underlyingSellerId:null},
 {sourceKind:"direct",underlyingSellerId:"retailer-B"}
 ]),2);
});

test("retailer ranking prefers direct quote over a mirrored marketplace offer",()=>{
 const marketplace={...quote,offerId:"market-mirror",sourcePlatform:"Tyre marketplace",
  sourceKind:"marketplace",unitPricePence:9000};
 const ranked=rankComparableQuotes([marketplace,quote]);
 assert.equal(ranked.length,1);
 assert.equal(ranked[0].offer.offerId,"A1");
 const unattributed={...marketplace,underlyingSellerId:null};
 assert.equal(rankComparableQuotes([unattributed]).length,0);
});
