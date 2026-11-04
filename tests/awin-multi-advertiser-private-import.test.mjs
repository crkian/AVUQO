import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {joinedAwinAdvertisers,joinedInSource,joinedName} from "../lib/awin/joined-catalogue.ts";

test("all sixteen observed joined advertisers can be selected for private import",()=>{
 assert.equal(joinedAwinAdvertisers.length,16);
 assert.equal(joinedName("12715"),"Tyres UK");
 assert.equal(joinedName("15236"),"Tyres Pneus Online UK");
 assert.equal(joinedName("77952"),"Petlibro UK Affiliate Program");
 assert.equal(joinedName("69178"),null);
});
test("private import requires exact joined status in current source registry",()=>{
 const sample={awin_advertisers:[{advertiser_id:"12715",joined_programme_observed:true},{advertiser_id:"15236",joined_programme_observed:false}]};
 assert.equal(joinedInSource(sample,"12715"),true);
 assert.equal(joinedInSource(sample,"15236"),false);
 assert.equal(joinedInSource(sample,"736"),false);
 assert.equal(joinedInSource({},"12715"),false);
 assert.equal(joinedInSource(null,"12715"),false);
});
test("server rejects mixed advertiser rows before saving private import run",()=>{
 const route=readFileSync("app/api/control-centre/feed-imports/route.ts","utf8");
 const selects=route.indexOf("joinedInSource(source.metadata");
 const denies=route.indexOf("records.some(r => r.merchant_id !== merchantId)");
 const writes=route.indexOf("feed_import_runs').insert");
 assert.ok(selects>=0 && denies>selects && writes>denies);
 assert.match(route,/permission_status: 'unverified'/);
 assert.match(route,/status: 'private_review'/);
 assert.match(route,/canonical_category_approved: false/);
});
