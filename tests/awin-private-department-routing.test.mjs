import test from "node:test";
import assert from "node:assert/strict";
import {suggestedDepartment} from "../lib/feed-imports/preview-departments.ts";

test("Tooled Up categories route to specific departments, rather than one universal DIY shelf",()=>{
 const rows=[
  ["Power Tools","Power tools & equipment"],
  ["Hand Tools","Hand tools"],
  ["Garden Tools","Gardening & outdoors"],
  ["Men's Footwear","Workwear & safety"],
  ["Vehicle Servicing","Motoring maintenance"],
  ["Vacuum Cleaners","Home appliances & cleaning"],
  ["Lighting","Lighting & security"],
  ["DIY","DIY & home improvement"],
  ["Unrecognised feed category","Needs classification"]
 ];
 for(const [category,expected] of rows)
  assert.equal(suggestedDepartment("Tooled Up","Synthetic item",category),expected,category);
});
test("Mozillion SIM-free handsets belong under mobile phones, not mobile contracts",()=>{
 assert.equal(suggestedDepartment("Mozillion","Unlocked smartphone","Mobile Phones"),"Mobile phones");
 assert.equal(suggestedDepartment("Mozillion","Monthly data SIM","SIM only contracts"),"Needs classification");
});
test("existing retailer suggestions remain available",()=>{
 assert.equal(suggestedDepartment("Petlibro UK","Water fountain",null),"Pet hydration");
 assert.equal(suggestedDepartment("Cadbury Gifts Direct","Gift hamper","Chocolate"),"Chocolate & gifts");
 assert.equal(suggestedDepartment("AKKO UK","Keyboard",null),"Keyboards & computing");
});
