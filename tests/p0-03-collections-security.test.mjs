import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseCollectionRequest,parseBasketName,isSameOriginWrite} from "../lib/collections/requests.ts";
import {isSafeSnapshot,basketEmailBody,safeProductUrl} from "../lib/collections/planning.ts";

const id="11111111-1111-4111-8111-111111111111";
const offer="22222222-2222-4222-8222-222222222222";
const valid={kind:"basket",productId:id,productSlug:"airfryer-123",offerId:offer};
const read=(path)=>readFileSync(path,"utf8");

test("server accepts only product and verified offer identifiers",()=>{
 assert.deepEqual(parseCollectionRequest({...valid,merchant:"Invented retailer",priceGbp:0.01,captured_at:"1990-01-01"}),valid);
 for(const bad of [
   null,[],{}, {...valid,kind:"standard"}, {...valid,productId:"../admin"},
   {...valid,productSlug:"https://evil.example"}, {...valid,offerId:"not-a-uuid"},
 ])assert.equal(parseCollectionRequest(bad),null);
 assert.equal(parseCollectionRequest({...valid,kind:"wishlist"})?.kind,"wishlist");
});

test("named basket copies reject invalid titles and cross-origin form posts",()=>{
 assert.equal(parseBasketName({name:"  New   kitchen  "}),"New kitchen");
 for(const name of ["","ab","a".repeat(81),"Testing\nInjected"]){
  assert.equal(parseBasketName({name}),null);
 }
 const json={method:"POST",headers:{"content-type":"application/json"}};
 assert.equal(isSameOriginWrite(new Request("https://www.avuqo.com/api/collections/items",{...json,headers:{...json.headers,origin:"https://www.avuqo.com"}})),true);
 assert.equal(isSameOriginWrite(new Request("https://www.avuqo.com/api/collections/items",{...json,headers:{...json.headers,origin:"https://evil.example"}})),false);
 assert.equal(isSameOriginWrite(new Request("https://www.avuqo.com/api/collections/items",{...json,headers:{"content-type":"text/plain"}})),false);
});

test("captured price snapshots require valid URLs, finite prices and real timestamps",()=>{
 const validShot={kind:"basket",product_slug:"airfryer-123",merchant:"Approved shop",price_gbp:45.2,captured_at:"2026-11-01T00:00:00Z"};
 assert.equal(isSafeSnapshot(validShot),true);
 for(const shot of [
  {...validShot,product_slug:"https://external.example"},
  {...validShot,merchant:"Seller\r\nFake-price:0"},
  {...validShot,price_gbp:NaN},
  {...validShot,price_gbp:-1},
  {...validShot,captured_at:"not-a-date"},
  {...validShot,captured_at:"2099-01-01T00:00:00Z"},
 ])assert.equal(isSafeSnapshot(shot),false);
 assert.equal(safeProductUrl("airfryer-123"),"/products/airfryer-123");
});

test("email draft cannot be turned into forged headers or external offer links",()=>{
 const items=Array.from({length:20},(_,i)=>({
  title:`Offer ${i}\\r\\nPrice £0`,merchant:"Merchant\\nBad:\tDeal",
  price:20,url:i===0?"https://evil.example/offer":`/products/product-${i+100}`
 }));
 const email=basketEmailBody(items,"https://evil.example");
 assert.match(email,/historical snapshots/);
 assert.doesNotMatch(email,/evil\.example/);
 assert.doesNotMatch(email,/Merchant\nBad/);
 assert.match(email,/\+ 2 more saved offers/);
 assert.doesNotMatch(email,/Offer 18/);
 assert.match(email,/https:\/\/www\.avuqo\.com\/products\/product-101/);
});

test("public offer is re-verified before privileged server save, not passed from browser",()=>{
 const route=read("app/api/collections/items/route.ts");
 const ui=read("components/collections/AddToCollectionButton.tsx");
 assert.ok(route.indexOf("await db.auth.getUser()")<route.indexOf("const admin=createAdminClient()"));
 assert.ok(route.indexOf("verifiedProduct(body.productSlug)")<route.indexOf('admin.from("shared_list_items").insert'));
 assert.match(route,/verified\.offers\.find/);
 assert.match(route,/alreadySaved:true/);
 assert.match(route,/insertError\?\.code==="23505"/);
 assert.doesNotMatch(ui,/priceGbp|title: title|merchant: merchant|snapshot:/);
 assert.match(ui,/fetch\("\/api\/collections\/items"/);
});

test("named copies read all basket items from server and roll back failures",()=>{
 const route=read("app/api/collections/save-basket/route.ts");
 assert.match(route,/\.eq\("owner_id",owner\)\.eq\("list_type","basket"\)/);
 assert.match(route,/\.limit\(201\)/);
 assert.match(route,/if\(copies\.some\(item=>!item\)\)/);
 assert.match(route,/if\(copyError\)/);
 assert.match(route,/\.delete\(\)\.eq\("id",named\.id\)/);
 const page=read("components/collections/PlanningCollectionPage.tsx");
 assert.match(page,/fetch\("\/api\/collections\/save-basket"/);
 assert.doesNotMatch(page,/\.from\("shared_list_items"\)\.insert/);
});

test("migration ensures one list and one saved item, keeps standard lists editable",()=>{
 const sql=read("supabase/migrations/20261104103000_p003_private_verified_collections.sql");
 assert.match(sql,/unique index if not exists shared_lists_one_planning_kind_per_owner/i);
 assert.match(sql,/unique index if not exists shared_list_items_one_key_per_list/i);
 assert.match(sql,/as restrictive for select to authenticated/);
 assert.match(sql,/as restrictive for insert to authenticated/);
 assert.match(sql,/as restrictive for update to authenticated/);
 assert.match(sql,/list_type not in \('wishlist','basket'\)/);
 assert.doesNotMatch(sql,/truncate|delete from|drop table/i);
});
