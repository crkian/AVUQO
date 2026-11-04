import test from "node:test";
import assert from "node:assert/strict";
import {suggestedDepartment} from "../lib/feed-imports/preview-departments.ts";

test("Petlibro suggestions use descriptive product evidence, not merchant-only assumptions",()=>{
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Automatic Pet Feeder",null),"Pet feeding");
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Water Fountain",null),"Pet hydration");
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Mystery Item",null),"Needs classification");
});
test("Cadbury, Craft Buddy, AKKO map only to provisional departments",()=>{
 assert.equal(suggestedDepartment("Cadbury Gifts Direct","Birthday gift","Other Occasions"),"Chocolate & gifts");
 assert.equal(suggestedDepartment("Craft Buddy Shop","DIY Kit","Arts & Entertainment > Arts & Crafts"),"Arts & crafts");
 assert.equal(suggestedDepartment("AKKO UK","Keyboard",null),"Keyboards & computing");
 assert.equal(suggestedDepartment("Unknown","Unknown",null),"Needs classification");
});
test("No canonical category or public product rights are inferred by helper",()=>{
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Unspecified device",null),"Needs classification");
});
