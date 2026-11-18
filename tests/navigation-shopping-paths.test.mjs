import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_NAVIGATION,isValidNavigation} from "../lib/content/navigation.ts";
import {departmentJourneys} from "../lib/marketplace/journeys.ts";
import {departmentBySlug} from "../lib/categories/browse-tree.ts";
test("customer menus expose live shopping destinations, without outside links",()=>{
 assert.equal(isValidNavigation(DEFAULT_NAVIGATION),true);
 const urls=DEFAULT_NAVIGATION.groups.flatMap(g=>g.links.map(l=>l.href));
 assert.ok(urls.includes("/tools"));
 assert.ok(urls.includes("/tyres/shop"));
 for(const url of urls)assert.match(url,/^\/[a-z0-9/-]+$/);
});
test("department Shop journeys use real specialist retailer shelves",()=>{
 for(const [department,expected] of [
  ["diy-building","/tools"],["garden-outdoors","/tools"],["motoring","/tyres/shop"],
  ["tech","/categories/tech/products"]
 ]){
  const row=departmentBySlug(department);
  assert.ok(row);
  assert.equal(departmentJourneys(row).shop,expected);
 }
});
