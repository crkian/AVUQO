import test from "node:test";
import assert from "node:assert/strict";
import {comparePrivateTyreIdentities,tyreIdentity} from "../lib/awin/tyre-cross-retailer-evidence.mjs";
const row=(brand="Example",ean="4006381333931",extra={})=>({brand,metadata:{ean,...extra}});
test("exact private candidate identity is checksum, uniqueness and brand gated",()=>{
 const t=row("example","4006381333931",{tyre_size_conflict:false,tyre_size_candidate:{width_mm:205,aspect_ratio:55,rim_inches:16}});
 assert.deepEqual(comparePrivateTyreIdentities([row()],[t]),{uniqueMatches:1,brandMatches:1,brandConflicts:0,missingBrand:0,ambiguous:0,sizeCandidates:1,verifiedEquivalentOffers:0});
 assert.equal(comparePrivateTyreIdentities([row(),row()],[t]).ambiguous,1);
 assert.equal(comparePrivateTyreIdentities([row("Other")],[t]).brandConflicts,1);
 assert.equal(comparePrivateTyreIdentities([row("")],[t]).missingBrand,1);
 assert.equal(tyreIdentity(row("Example","4006381333932")),null);
 assert.equal(tyreIdentity(row("Example","4006381333931",{gtin:"1234567890128"})),null);
 assert.equal(comparePrivateTyreIdentities([row()],[row("Example","4006381333931",{tyre_size_conflict:true,tyre_size_candidate:{width_mm:205,aspect_ratio:55,rim_inches:16}})]).sizeCandidates,0);
});
