import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_NAVIGATION,isValidNavigation,parseNavigation,orderedNavigation} from "../lib/content/navigation.ts";
const clone=()=>structuredClone(DEFAULT_NAVIGATION);
test("navigation points to existing internal site routes",()=>{
 assert.equal(isValidNavigation(DEFAULT_NAVIGATION),true);
 for(const group of DEFAULT_NAVIGATION.groups){
  assert.match(group.href,/^\/[a-z0-9/-]+$/);
  for(const link of group.links)assert.match(link.href,/^\/[a-z0-9/-]+$/);
 }
});
test("essential destinations remain prominent",()=>{
 assert.deepEqual(orderedNavigation(DEFAULT_NAVIGATION).slice(0,4).map(x=>x.id),["discover","deals","compare","groceries"]);
});
test("invalid external or invented links fail closed",()=>{
 const a=clone();a.groups[0].href="https://untrusted.example";assert.equal(isValidNavigation(a),false);
 const b=clone();b.groups[1].links[0].href="/not-a-real-page";assert.equal(isValidNavigation(b),false);
});
test("navigation cannot hide essential departments",()=>{
 const x=clone();x.groups.find(g=>g.id==="groceries").enabled=false;assert.equal(isValidNavigation(x),false);
});
test("draft may hide non-essential destinations",()=>{
 const x=clone();x.groups.find(g=>g.id==="more").enabled=false;
 assert.equal(isValidNavigation(x),true);assert.equal(orderedNavigation(x).some(g=>g.id==="more"),false);
});
test("invalid published content falls back to vetted menu",()=>{
 assert.equal(parseNavigation({bad:"payload"}),DEFAULT_NAVIGATION);
});
test("sorting changes order but never destinations",()=>{
 const x=clone();x.groups.find(g=>g.id==="travel").order=0;
 x.groups.find(g=>g.id==="discover").order=4;
 const result=orderedNavigation(x);
 assert.equal(result[0].id,"travel");assert.equal(result[0].href,"/travel");
});
