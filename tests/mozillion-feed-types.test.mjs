import test from "node:test";
import assert from "node:assert/strict";
import {MOZILLION_FEED_CLASSES,mozillionPhysicalFeedAllowed} from "../lib/awin/mozillion-feed-types.ts";
test("only exact Mozillion SIM-free handset feed can use physical-product importer",()=>{
 assert.equal(mozillionPhysicalFeedAllowed("31539","74135","Mozillion SIM Free Phones"),true);
 assert.equal(mozillionPhysicalFeedAllowed("31539","74135","Pay Monthly Contract Phones"),false);
 assert.equal(mozillionPhysicalFeedAllowed("31539","97090","Mozillion SIM Free Phones"),false);
 assert.equal(mozillionPhysicalFeedAllowed("77952","74135","Mozillion SIM Free Phones"),false);
 for(const [id,feed] of Object.entries(MOZILLION_FEED_CLASSES)){
  assert.equal(feed.auto_import_allowed,id==="74135");
 }
});
