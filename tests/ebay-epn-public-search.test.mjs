import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AVUQO_EBAY_UK_EPN_CAMPAIGN,EBAY_UK_ROTATION_ID,EBAY_UK_SEARCHES,ebayUkEpnHref} from "../lib/ebay/epn-uk-links.ts";
import {AVUQO_EPN_DEFAULT_CAMPAIGN} from "../lib/ebay/epn-browse.ts";
const read=p=>readFileSync(p,"utf8");
test("all eBay UK links have official EPN campaign and rotation, with fixed safe targets",()=>{
 assert.equal(AVUQO_EBAY_UK_EPN_CAMPAIGN,AVUQO_EPN_DEFAULT_CAMPAIGN);
 assert.equal(EBAY_UK_ROTATION_ID,"710-53481-19255-0");
 assert.equal(EBAY_UK_SEARCHES.length,6);
 for(const id of ["all",...EBAY_UK_SEARCHES.map(x=>x.id)]){
  const u=new URL(ebayUkEpnHref(id));
  assert.equal(u.protocol,"https:");
  assert.equal(u.hostname,"www.ebay.co.uk");
  assert.equal(u.searchParams.get("campid"),"5339240499");
  assert.equal(u.searchParams.get("mkevt"),"1");
  assert.equal(u.searchParams.get("mkcid"),"1");
  assert.equal(u.searchParams.get("mkrid"),"710-53481-19255-0");
  assert.equal(u.searchParams.get("toolid"),"10001");
  if(id!=="all"){assert.equal(u.pathname,"/sch/i.html");assert.ok(u.searchParams.get("_nkw"));}
 }
 assert.throws(()=>ebayUkEpnHref("https://example.org"),/unknown/);
 assert.throws(()=>ebayUkEpnHref("untrusted"),/unknown/);
});
test("public partner search never invents products/prices and carries sponsored disclosure",()=>{
 const p=read("app/partners/ebay-uk/page.tsx");
 const h=read("app/page.tsx");
 const c=read("components/home/EbayUKPartnerShelf.tsx");
 assert.match(p,/rel="sponsored noopener noreferrer"/);
 assert.match(p,/not verified AVUQO price comparisons/i);
 assert.match(p,/Affiliate disclosure/);
 assert.match(p,/Listings, sellers, prices, condition, delivery costs, stock and returns/);
 assert.doesNotMatch(p,/createAdminClient|importFeed|verifiedOffers|EBAY_CLIENT_SECRET|fetch\(/);
 assert.match(h,/<EbayUKPartnerShelf\/>/);
 assert.match(c,/href="\/partners\/ebay-uk"/);
});
