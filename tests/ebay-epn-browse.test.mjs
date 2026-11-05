import test from "node:test";
import assert from "node:assert/strict";
import {verifiedEpnCampaign,ebayBrowseAffiliateHeader,privateEbayBrowseItem}
 from "../lib/ebay/epn-browse.ts";
const campaign="5339240499";
const sample={
 itemId:"v1|123456789|0",title:"Synthetic UK product",price:{currency:"GBP",value:"45.99"},
 itemAffiliateWebUrl:"https://www.ebay.co.uk/itm/123456789?mkevt=1&mkcid=1&campid=5339240499&toolid=10001",
 itemWebUrl:"https://www.ebay.co.uk/itm/123456789",
 image:{imageUrl:"https://i.ebayimg.com/images/g/example/s-l500.jpg"},
 condition:"New",itemLocation:{country:"GB"}
};
test("valid campaign creates correct EPN Browse header",()=>{
 assert.equal(ebayBrowseAffiliateHeader(campaign),"affiliateCampaignId=5339240499");
 assert.throws(()=>verifiedEpnCampaign("1234567890"),/unrecognised/);
});
test("GBP tracked item remains non-publishable",()=>{
 const r=privateEbayBrowseItem(sample,campaign);
 assert.equal(r?.price_gbp,45.99);
 assert.equal(r?.publication_approved,false);
 assert.equal(r?.item_location_country,"GB");
});
test("missing tracking, wrong campaign, price or host fails closed",()=>{
 for(const diff of [
 {itemAffiliateWebUrl:"https://www.ebay.co.uk/itm/123?campid=1234567890"},
 {itemAffiliateWebUrl:"https://evil.example/itm/123?campid=5339240499"},
 {price:{currency:"USD",value:"45.99"}},
 {price:{currency:"GBP",value:"0"}},
 {itemWebUrl:"https://evil.example/x"}
 ]){
  assert.equal(privateEbayBrowseItem({...sample,...diff},campaign),null);
 }
});
