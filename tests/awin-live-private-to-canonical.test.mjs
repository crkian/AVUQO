import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {toFreshVerifiedAwinRaw} from "../lib/awin/private-live-canonical-stage.ts";

const checked=new Date().toISOString(), digest="a".repeat(64);
const link="https://www.awin1.com/pclick.php?m=77952&a=3135746&p=real-product";
const base={id:"row",import_id:"private-run",merchant_product_id:"SKU-001",
 title:"Synthetic Petlibro Smart Feeder",price:"149.99",currency:"GBP",
 brand:"Petlibro",category:"Pet care",status:"review",
 metadata:{feed_id:"103580",tracking_link_verified:true,
  live_feed_digest:digest,live_feed_verified_at:checked,
  live_feed_verification:"exact_authenticated_feed_digest_rechecked",
  verified_awin_deep_link:link,availability:"in_stock",
  listing_kind:"physical_product",currency_source:"petlibro_uk_programme_gbp",
  source_currency_explicit:false,gtin:"6976166720714"}};
test("fresh exact rechecked private Awin row becomes a raw canonical held candidate",()=>{
 const r=toFreshVerifiedAwinRaw(base,"77952","103580",digest);
 assert.ok(r);
 assert.equal(r.price,149.99);
 assert.equal(r.currency,"GBP");
 assert.equal(r.category,"home");
 assert.equal(r.merchantExternalId,"77952");
 assert.equal(r.sourceRecordId,"77952:SKU-001");
 assert.equal(r.gtin,"6976166720714");
 assert.equal(r.imageUrl,null);
 assert.equal(r.affiliateUrl,link);
});
test("no acceptance of stale snapshots, feed cross-binding, wrong publisher or unverified stock",()=>{
 const fail=[
  [base,"77952","103581",digest],
  [base,"77952","103580","b".repeat(64)],
  [{...base,currency:"USD"},"77952","103580",digest],
  [{...base,price:"0"},"77952","103580",digest],
  [{...base,status:"excluded"},"77952","103580",digest],
  [{...base,metadata:{...base.metadata,availability:"unknown"}},"77952","103580",digest],
  [{...base,metadata:{...base.metadata,verified_awin_deep_link:link.replace("m=77952","m=496")}},"77952","103580",digest],
  [{...base,metadata:{...base.metadata,live_feed_verified_at:"2026-11-01T10:00:00Z"}},"77952","103580",digest],
  [{...base,metadata:{...base.metadata,live_feed_verification:"private_import"}},"77952","103580",digest],
  [base,"12715","103580",digest],
 ];
 for(const [row,advertiser,feed,hash] of fail)
  assert.equal(toFreshVerifiedAwinRaw(row,advertiser,feed,hash),null);
});
test("bridge uses the one existing scoring pipeline and cannot auto-publish first products",()=>{
 const stage=readFileSync("lib/awin/private-live-canonical-stage.ts","utf8");
 const worker=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 const pipeline=readFileSync("lib/pipeline/run.ts","utf8");
 assert.match(stage,/runDealIntelligencePipeline\(db/);
 assert.match(stage,/awinPrivateStaging:true/);
 assert.match(stage,/limit\?\?20,20/);
 // Every canonical batch must be bound to the digest that an authenticated
 // Awin download just verified, regardless of historical created_at order.
 assert.match(stage,/\.contains\("metadata",\{live_feed_digest:input\.digest\}\)/);
 assert.match(stage,/source\.status!=="paused"/);
 assert.match(worker,/attestUnchangedLiveRows/);
 assert.match(worker,/\.is\("reviewed_at",null\)\.limit\(300\)/);
 assert.match(worker,/if\(verified>=20\)break/);
 assert.match(worker,/stageLiveAwinCanonicalCandidates/);
 assert.match(worker,/no_publication:true/);
 assert.match(pipeline,/privateOnly\?false:controls\.dealPublishing/);
 assert.match(pipeline,/status: privateOnly\?"draft":"active"/);
 assert.match(pipeline,/source\.status!=="paused"/);
 assert.doesNotMatch(stage,/record_awin_owner_release|\.from\("awin_offer_release_reviews"\)/);
});
