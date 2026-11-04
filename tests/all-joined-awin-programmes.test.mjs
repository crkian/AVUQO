import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {joinedAwinAdvertisers} from "../lib/awin/joined-catalogue.ts";
const read=p=>readFileSync(p,"utf8");
test("every accepted Awin advertiser appears in the full owner register",()=>{
 assert.equal(joinedAwinAdvertisers.length,16);
 assert.equal(new Set(joinedAwinAdvertisers.map(([id])=>id)).size,16);
 const page=read("app/control-centre/awin-programmes/page.tsx");
 assert.match(page,/joinedAwinAdvertisers\.map/);
 assert.match(page,/joinedInSource/);
 assert.match(page,/No current feed entry has been recorded/);
 assert.match(page,/services? rather than physical products|service\/contract taxonomy/i);
 for(const [id] of joinedAwinAdvertisers)assert.ok(id.length>0);
});
test("join status, current imports and observations are checked after server owner auth",()=>{
 const page=read("app/control-centre/awin-programmes/page.tsx");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf("createAdminClient()"));
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/\.from\("sources"\)/);
 assert.match(page,/\.from\("feed_import_runs"\)/);
 assert.match(page,/\.from\("awin_feed_update_observations"\)/);
 assert.match(page,/private_review/);
 assert.match(page,/permission/i);
 assert.doesNotMatch(page,/signed_url|download_url|api_key|itemAffiliateWebUrl/);
});
test("known large feeds are not directed through the small importer",()=>{
 const page=read("app/control-centre/awin-programmes/page.tsx");
 assert.match(page,/93988/);
 assert.match(page,/26513/);
 assert.match(page,/97090/);
 assert.match(page,/89987/);
 assert.match(page,/merchant-specific and cannot be used for tyres/);
 assert.match(page,/2,500 rows/);
 assert.match(page,/without permission|not permission|not permission to reuse images/i);
});
test("all joined merchant register is discoverable in existing Control Centre",()=>{
 const page=read("app/control-centre/feed-imports/page.tsx");
 assert.match(page,/All 16 accepted Awin programmes/);
 assert.match(page,/href="\/control-centre\/awin-programmes"/);
 const css=read("app/control-centre/awin-programmes/programmes.module.css");
 assert.match(css,/@media\(max-width:880px\)/);
 assert.match(css,/@media\(max-width:500px\)/);
});
