import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=read("app/explore-avuqo/page.tsx");
const home=read("app/page.tsx");
const sitemap=read("app/sitemap.ts");
test("whole-site tour is a discoverable public route and sitemap entry",()=>{
 assert.match(home,/href="\/explore-avuqo"/);
 assert.ok(sitemap.includes('"/explore-avuqo"'));
 assert.match(page,/canonical:"\/explore-avuqo"/);
 assert.match(page,/export default function ExploreAvuqoPage/);
});
test("tour links to real shopping, comparison, grocery, tyre, lifestyle and account routes",()=>{
 for(const href of ["/shopping","/categories","/products","/marketplace/compare","/sales","/groceries","/tyres","/tyres/find","/travel","/saved","/watches","/account"]){
  assert.ok(page.includes('"'+href+'"'),"Missing tour route "+href);
 }
});
test("public tour preserves honest source, account and marketing boundaries",()=>{
 assert.match(page,/does not mean every merchant feed, price, image or automatic alert is active/);
 assert.match(page,/owner/i);
 assert.match(page,/source, rights and product checks pass/);
 assert.doesNotMatch(page,/supabase\.from|service_role|AWIN_ACCESS_TOKEN|publishOffer|productPrice|\b\d+% off\b/i);
});
