import test from "node:test";
import assert from "node:assert/strict";
import {exactTyreFeed,candidateTyreSize,inspectTyreHeader}
 from "../lib/awin/tyre-feed-contract.ts";

test("only the exact two joined tyre feed identities can be inspected",()=>{
 assert.equal(exactTyreFeed("12715","93988")?.listed_rows,32053);
 assert.equal(exactTyreFeed("15236","26513")?.listed_rows,20062);
 assert.equal(exactTyreFeed("12715","26513"),null);
 assert.equal(exactTyreFeed("15236","93988"),null);
 assert.equal(exactTyreFeed("496","89987"),null);
});
test("candidate tyre size is never a verified fitment",()=>{
 assert.deepEqual(candidateTyreSize("225/45 R17 94W summer tyre"),
  {width_mm:225,aspect_ratio:45,rim_inches:17,verified:false});
 assert.equal(candidateTyreSize("battery drill 18v"),null);
 assert.equal(candidateTyreSize("999/45 R17"),null);
});
test("header diagnostics expose fields but never grant automatic import or publication",()=>{
 const header=["merchant_id","merchant_product_id","product_name",
  "search_price","currency","aw_deep_link","tyre_size","load_index",
  "speed_rating","wet_grip","delivery_cost"];
 const r=inspectTyreHeader(header,"12715","93988");
 assert.equal(r.explicit_size,true);
 assert.equal(r.explicit_load_rating,true);
 assert.equal(r.explicit_speed_rating,true);
 assert.equal(r.delivery_price_column,true);
 assert.equal(r.ready_to_import,false);
 assert.equal(r.ready_to_publish,false);
 assert.equal(r.currency_verified,false);
 assert.equal(r.rights_verified,false);
});
test("bad headers and unknown advertisers fail closed",()=>{
 assert.throws(()=>inspectTyreHeader(["id","id","title","price","currency"],"12715","93988"),/schema_invalid/);
 assert.throws(()=>inspectTyreHeader(["id","title","price","currency","load"],"496","89987"),/not_allowlisted/);
});
