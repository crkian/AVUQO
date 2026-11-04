import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizeEbayUkResults} from "../lib/ebay/private-uk-browse.ts";
const read=(p)=>readFileSync(p,"utf8");
test("UK Browse response is normalized without invented manufacturer, stock or public checkout",()=>{
 const rows=normalizeEbayUkResults({itemSummaries:[{
  itemId:"v1|123|0",title:"New drill kit",price:{value:"99.99",currency:"GBP"},
  itemLocation:{country:"GB"},seller:{username:"realSeller"},condition:"New",
  image:{imageUrl:"https://i.ebayimg.com/images/g/abc/s-l500.jpg"},
  localizedAspects:[{name:"Brand",value:"Bosch"},{name:"MPN",value:"AB-100"}],
  shippingOptions:[{shippingCost:{value:"4.99",currency:"GBP"}}],
  itemAffiliateWebUrl:"https://www.ebay.co.uk/itm/123?campid=1234567890"
 }]},false);
 assert.equal(rows.length,1);
 assert.equal(rows[0].priceGBP,99.99);
 assert.equal(rows[0].shippingGBP,4.99);
 assert.equal(rows[0].brand,"Bosch");
 assert.equal(rows[0].mpn,"AB-100");
 assert.equal(rows[0].hasAffiliateTracking,false);
 assert.equal(rows[0].seller,"realSeller");
});
test("unsafe image hosts, absent price or non-GBP values cannot become GBP offers",()=>{
 const rows=normalizeEbayUkResults({itemSummaries:[
  {itemId:"1",title:"A",price:{value:"10",currency:"USD"},image:{imageUrl:"https://attacker.example/bad.png"}},
  {itemId:"2",title:"B",price:{value:"not-number",currency:"GBP"},image:{imageUrl:"http://i.ebayimg.com/insecure.jpg"}}
 ]},true);
 assert.equal(rows[0].priceGBP,null);
 assert.equal(rows[0].imageUrl,null);
 assert.equal(rows[1].priceGBP,null);
 assert.equal(rows[1].imageUrl,null);
});
test("OAuth credentials and eBay Browse calls stay exclusively server-side",()=>{
 const lib=read("lib/ebay/private-uk-browse.ts");
 assert.match(lib,/process\.env\.EBAY_CLIENT_SECRET/);
 assert.match(lib,/client_credentials/);
 assert.match(lib,/EBAY_GB/);
 assert.match(lib,/itemLocationCountry:GB/);
 assert.match(lib,/redirect:"error"/);
 assert.match(lib,/cache:"no-store"/);
 assert.match(lib,/X-EBAY-C-ENDUSERCTX/);
 assert.doesNotMatch(lib,/NEXT_PUBLIC_|console\.log/);
});
test("eBay pilot and existing product details require verified owner access",()=>{
 const page=read("app/preview/ebay/page.tsx");
 const detail=read("app/preview/products/[id]/page.tsx");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf("ebayUkPrivateSearch(q)"));
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/No automatic product imports/);
 assert.match(detail,/requireControlCentreAccess\(\)/);
 assert.match(detail,/run\.status!=="private_review"/);
 assert.match(detail,/created_at/);
 const image=read("app/preview/ebay/EbayPrivateImages.tsx");
 assert.match(image,/useState\(false\)/);
 assert.match(image,/referrerPolicy="no-referrer"/);
 assert.match(image,/checkout disabled/);
});
test("responsive eBay experience uses existing AVUQO design system",()=>{
 const css=read("app/preview/ebay/ebay-private.module.css");
 for(const bp of ["1100","750","480"])assert.match(css,new RegExp("max-width:"+bp+"px"));
 assert.match(css,/background:#faf8f3/);
 assert.match(css,/background:#6043a3/);
 const storefront=read("app/preview/storefront/page.tsx");
 assert.match(storefront,/href="\/preview\/ebay"/);
});
