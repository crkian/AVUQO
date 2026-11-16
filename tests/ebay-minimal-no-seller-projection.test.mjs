import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizeEbayUkResults} from "../lib/ebay/private-uk-browse.ts";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("private eBay pilot keeps a minimal per-listing comparison projection",()=>{
 const seller="synthetic-personal-seller-identifier";
 const privateData="private-payload-should-not-appear";
 const rows=normalizeEbayUkResults({itemSummaries:[{
  itemId:"v1|123|0",
  title:"Synthetic cordless drill",price:{currency:"GBP",value:"79.00"},
  condition:"New",image:{imageUrl:"https://i.ebayimg.com/images/g/a/s-l500.jpg"},
  seller:{username:seller,userId:"synthetic-immutable-account-id"},
  rawData:{privateData},metadata:{sellerToken:"synthetic-secret"},
  localizedAspects:[{name:"Brand",value:"SyntheticBrand"}]
 }]},false);
 assert.equal(rows.length,1);
 assert.deepEqual(Object.keys(rows[0]).sort(),[
  "brand","categoryPath","condition","hasAffiliateTracking","imageUrl",
  "itemId","mpn","priceGBP","shippingGBP","title"
 ].sort());
 const serialized=JSON.stringify(rows);
 for(const forbidden of [seller,privateData,"synthetic-immutable-account-id","synthetic-secret"])
  assert.ok(!serialized.includes(forbidden));
});

test("owner pilot has no storage, feed importer, public publication or user checkout path",()=>{
 const lib=read("lib/ebay/private-uk-browse.ts");
 const page=read("app/preview/ebay/page.tsx");
 const ui=read("app/preview/ebay/EbayPrivateImages.tsx");
 assert.match(page,/await requireControlCentreAccess\(\)/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/No automatic product imports/);
 assert.match(lib,/cache:"no-store"/);
 assert.match(lib,/return normalizeEbayUkResults/);
 assert.doesNotMatch(lib,/(createAdminClient|createClient\(|\.from\(|\.insert\(|\.upsert\(|\.update\(|\.delete\(|supabase|writeFile|localStorage|sessionStorage)/);
 assert.doesNotMatch(ui,/item\.seller|Seller:<\/b>/);
 assert.doesNotMatch(lib,/seller\?:|seller:safeText/);
 assert.match(ui,/AVUQO checkout disabled/);
});
