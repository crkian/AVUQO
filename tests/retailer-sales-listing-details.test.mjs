import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {activeRetailerSales,activeSaleProducts} from "../lib/promotions/retailer-sales.ts";
import {cardDescription,hasObservedReduction} from "../lib/products/listing-description.ts";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Petlibro is visible only in its actual announced November-December window",()=>{
 const during=activeRetailerSales(new Date("2026-11-19T14:15:00Z"));
 assert.equal(during.length,1);
 assert.equal(during[0].advertiserId,"77952");
 assert.equal(activeRetailerSales(new Date("2026-11-18T23:59:59Z")).length,0);
 assert.equal(activeRetailerSales(new Date("2026-12-04T00:00:00Z")).length,0);
 assert.equal(activeRetailerSales(new Date("2026-11-20T12:00:00Z"),"tech").length,0);
 assert.equal(activeRetailerSales(new Date("2026-11-20T12:00:00Z"),"pets").length,1);
});
test("exact Petlibro wave windows do not falsely advertise between-wave reductions",()=>{
 const sale=activeRetailerSales(new Date("2026-11-20T12:00:00Z"))[0];
 const first=activeSaleProducts(sale,new Date("2026-11-22T12:00:00Z"));
 assert.equal(first.find(p=>p.name==="Scout Smart Camera")?.percent,55);
 assert.equal(first.find(p=>p.name==="Luma Smart Litter Box")?.percent,30);
 const between=activeSaleProducts(sale,new Date("2026-11-25T12:00:00Z"));
 assert.equal(between.some(p=>p.name==="Luma Smart Litter Box"),false);
 assert.equal(between.some(p=>p.name==="Scout Smart Camera"),true);
 const second=activeSaleProducts(sale,new Date("2026-11-28T12:00:00Z"));
 assert.equal(second.find(p=>p.name==="One RFID Smart Feeder")?.percent,25);
});
test("no unsupported saving claims and truthful missing-description fallback",()=>{
 assert.equal(hasObservedReduction({current_price:80,typical_price:100,saving_amount:20,avuqo_score:75,confidence:90}),true);
 assert.equal(hasObservedReduction({current_price:80,typical_price:100,saving_amount:20,avuqo_score:20,confidence:90}),false);
 assert.equal(hasObservedReduction({current_price:80,typical_price:null,saving_amount:20,avuqo_score:75,confidence:90}),false);
 assert.match(cardDescription(null),/not provided/);
 assert.equal(cardDescription("A tested product."),"A tested product.");
});
test("active sales appear on homepage, sales, Black Friday, Shopping, Pets and relevant categories",()=>{
 const home=read("app/page.tsx"),landing=read("components/editorial/SeasonalLanding.tsx");
 assert.match(home,/RetailerSales placement="home"/);
 assert.match(landing,/RetailerSales placement="sales"/);
 assert.match(landing,/VerifiedSaleDeals/);
 assert.match(read("app/pets/page.tsx"),/RetailerSales category="pets"/);
 assert.match(read("app/shopping/page.tsx"),/RetailerSales/);
 assert.match(read("app/categories\/\[department\]\/products\/page.tsx"),/RetailerSales category=\{department\}/);
 assert.match(read("app/products\/\[slug\]\/page.tsx"),/eligibleDepartmentProduct\(\{slug:"pets"\},entry\)/);
 assert.match(read("app/categories/page.tsx"),/href:"\/sales"/);
});
test("eligible listings across advertisers now include descriptions and seller details",()=>{
 for(const path of ["components/home/HomeShoppingDashboard.tsx","app/products/page.tsx","app/search/page.tsx","app/categories/[department]/products/page.tsx","components/products/RelatedProductSuggestions.tsx","components/live/LiveDealCard.tsx"]){
  const file=read(path);
  assert.match(file,/cardDescription\(/,path+" lacks supplier description");
 }
 assert.match(read("components/promotions/RetailerSales.tsx"),/rel="noopener noreferrer sponsored"/);
 assert.match(read("components/promotions/RetailerSales.tsx"),/Retailer-announced|Advertiser-announced/);
});
