import test from "node:test";
import assert from "node:assert/strict";
import {activePartnerPromotions} from "../lib/partners/advertiser-directory.ts";
test("PlayPress Christmas campaign is a single dated order-level code",()=>{
 const current=activePartnerPromotions(new Date("2026-11-25T11:00:00Z"),"playpress-toys");
 assert.equal(current.length,1);assert.equal(current[0].code,"PLAY10");assert.match(current[0].title,/over £30/);assert.match(current[0].detail,/Cannot be combined/);assert.equal(activePartnerPromotions(new Date("2027-01-01T00:00:00Z"),"playpress-toys").length,0);
});
