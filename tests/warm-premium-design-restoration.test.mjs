import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {editorialMomentForDate,editorialSpotlight,SEASONAL_DESTINATIONS}
 from "../lib/editorial/seasonal-schedule.ts";
import {seasonal} from "../lib/editorial/seasonal.ts";
const read=path=>readFileSync(path,"utf8");
const date=x=>new Date(x);

test("UK editorial calendar rotates without creating an advertiser or product offer",()=>{
 assert.equal(editorialMomentForDate(date("2026-11-10T08:00:00Z")),"black-friday");
 assert.equal(editorialMomentForDate(date("2026-12-10T12:00:00Z")),"christmas");
 assert.equal(editorialMomentForDate(date("2027-02-14T12:00:00Z")),"valentines");
 assert.equal(editorialMomentForDate(date("2027-03-12T12:00:00Z")),"easter");
 assert.equal(editorialMomentForDate(date("2027-03-28T12:00:00Z")),"easter");
 assert.equal(editorialMomentForDate(date("2027-01-10T12:00:00Z")),"sales");
 assert.equal(editorialMomentForDate(date("2027-08-10T12:00:00Z")),"summer");
 assert.equal(editorialMomentForDate(date("invalid")),null);
 assert.equal(editorialSpotlight(date("2026-11-15T12:00:00Z"))?.href,"/black-friday");
 assert.equal(editorialSpotlight(date("2026-11-15T12:00:00Z"))?.image,seasonal["black-friday"].photo);
 assert.equal(editorialSpotlight(date("2026-12-24T12:00:00Z"))?.href,"/christmas");
 assert.ok(SEASONAL_DESTINATIONS.length>=10,"Year-round editorial calendar should cover major UK dates and evergreen periods");
});
test("every restored seasonal route shares a premium, evidence-safe template",()=>{
 for(const kind of ["sales","black-friday","easter","valentines"]){
  assert.ok(seasonal[kind],"missing seasonal config: "+kind);
  const photo=seasonal[kind].photo;
  if(photo.startsWith("/editorial/")){
   assert.match(photo,/^\/editorial\/[a-z-]+\.webp$/);
   assert.equal(readFileSync("public"+photo).toString("ascii",8,12),"WEBP");
  }else assert.ok(photo.startsWith("https://images.unsplash.com/"));
 }
 for(const file of ["app/easter/page.tsx","app/valentines/page.tsx","app/black-friday/page.tsx"]){
  assert.match(read(file),/SeasonalLanding/);
  assert.doesNotMatch(read(file),/published_deals|feed_import_records/);
 }
 const seasonalUI=read("components/editorial/SeasonalLanding.tsx");
 assert.match(seasonalUI,/Curated ideas, never invented deals/);
 assert.match(seasonalUI,/plannerGrid/);
 assert.match(seasonalUI,/categoryRail/);
 assert.doesNotMatch(seasonalUI,/£[0-9]+|Score 9|£249/);
});
test("Christmas gift finder and published-offer gates survive seasonal visual restore",()=>{
 const christmas=read("app/christmas/page.tsx");
 assert.match(christmas,/<ChristmasHomeFeature/);
 assert.match(christmas,/<GiftFinder\s*\/>/);
 assert.match(christmas,/<PublishedChristmasCrafts\s*\/>/);
 const page=read("app/page.tsx");
 assert.match(page,/const season=editorialSpotlight\(new Date\(\)\)/);
 assert.doesNotMatch(page,/<HomeSeasonalSpotlight/); // Main seasonal hero owns the single campaign lead.
 assert.match(page,/season\?\.image/);
});
test("owner seasonal operations are protected and are not a source activation worker",()=>{
 const admin=read("app/control-centre/seasonal/page.tsx");
 assert.match(admin,/requireControlCentreAccess\(\)/);
 assert.match(admin,/SEASONAL_DESTINATIONS/);
 assert.match(admin,/\/control-centre\/site-advertising/);
 assert.match(admin,/\/control-centre\/marketing/);
 assert.doesNotMatch(admin,/\.insert\(|\.update\(|\.delete\(|AWIN_AUTO_IMPORT_ENABLED/);
});
test("personal dashboard uses signed-in account data, not mockup statistics",()=>{
 const account=read("app/account/page.tsx");
 const dashboard=read("components/account/MyAVUQODashboard.tsx");
 assert.match(account,/<MyAVUQODashboard signedIn=\{signedIn\}/);
 assert.match(dashboard,/db\.from\("saved_items"\)/);
 assert.match(dashboard,/db\.from\("watches"\)/);
 assert.match(dashboard,/db\.from\("shared_lists"\)/);
 assert.match(dashboard,/count:"exact",head:true/);
 assert.doesNotMatch(dashboard,/£268|24 Saved Items|6 Price Watches|price dropped/i);
});
test("project compass, screenshot index and branch provenance are durable",()=>{
 const agents=read("AGENTS.md");
 const readme=read("README.md");
 const compass=read("docs/AVUQO_PROJECT_COMPASS.md");
 const visuals=read("docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md");
 assert.match(agents,/AVUQO_PROJECT_COMPASS\.md/);
 assert.match(readme,/AVUQO_PROJECT_COMPASS\.md/);
 assert.match(compass,/124 named branches/);
 assert.match(compass,/site-advertising/);
 assert.match(compass,/not as a guarantee of cross-chat assistant memory/i);
 for(const file of ["1000033119.png","1000033120.png","1000033121.png","1000033110.png",
  "1000033112.png","1000033113.png","1000033114.png","1000033115.png",
  "1000033116.png","1000033117.png","1000033105.png","1000033106.png","1000033107.png","1000033108.png","1000033109.png","1000033118.png"])assert.ok(visuals.includes(file),file);
});

test("restored Saved, Watches and Lists use scoped account records and avoid mock price claims",()=>{
 const saved=read("app/saved/page.tsx");
 const watches=read("app/watches/page.tsx");
 const lists=read("app/lists/page.tsx");
 assert.match(saved,/db\.auth\.getUser\(\)/);
 assert.match(saved,/db\.from\("saved_items"\)/);
 assert.match(saved,/Price when saved, not a live quote/);
 assert.match(saved,/historical snapshots/);
 assert.match(watches,/db\.auth\.getUser\(\)/);
 assert.match(watches,/db\.from\("watches"\)/);
 assert.match(watches,/does not yet activate automated price checks/);
 assert.doesNotMatch(watches,/AVUQO will\./);
 assert.match(lists,/db\.auth\.getUser\(\)/);
 assert.match(lists,/db\.from\("shared_lists"\)/);
 assert.match(lists,/sharing depends on account permissions/i);
 for(const path of ["app/saved/page.module.css","app/watches/page.module.css","app/lists/page.module.css"]){
  assert.match(read(path),/background:#faf8f3/);
 }
});
