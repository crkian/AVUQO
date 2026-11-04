import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectAwinFeedList,currentTooledUpFilename} from "../lib/awin/feed-list-audit.ts";
const header="Advertiser ID,Advertiser Name,Primary Region,Membership Status,Datafeed Format,Feed ID,Feed Name,Language,Vertical,Last Imported,Last Checked,No of products,URL";
const sample=[
 "496,Tooled Up,GB,active,Awin,89987,All Products,English,,2026-11-04 05:11:24,2026-11-04 05:09:48,84284,https://productdata.awin.com/private-secret",
 "736,Cadbury Gifts Direct,GB,active,Awin,48599,Cadbury Shopping Feed,English,,2026-11-03 18:02:12,2026-11-04 05:01:10,1367,https://example.invalid/second-token",
 "1,Other Retailer,GB,Not Joined,Awin,111,Other,English,,2026-11-04,2026-11-04,15,https://example.invalid/third",
 "496,Tooled Up,GB,active,Awin,89987,All Products,English,,2026-11-04 05:11:24,2026-11-04 05:09:48,84284,https://example.invalid/duplicate"
].join("\n");
test("safe auditor returns only active joined feeds without credential URLs",()=>{
 const r=inspectAwinFeedList(header+"\n"+sample,new Set(["496","736"]));
 assert.equal(r.rowsInspected,4);
 assert.equal(r.activeRows,3);
 assert.equal(r.feeds.length,2);
 assert.equal(r.byMerchant.length,2);
 assert.equal(r.feeds.find(f=>f.advertiserId==="496")?.products,84284);
 assert.ok(!JSON.stringify(r).includes("private-secret"));
 assert.ok(!JSON.stringify(r).includes("second-token"));
 assert.equal(r.feeds.find(f=>f.advertiserId==="496")?.tooledUpFilenameMustBeChecked,true);
});
test("unobserved active advertisers are excluded, regardless of feed URLs",()=>{
 const r=inspectAwinFeedList(header+"\n"+sample,new Set(["736"]));
 assert.equal(r.feeds.length,1);
 assert.equal(r.activeOutsideJoined,2);
});
test("only newly relaunched Tooled-Up filename families pass",()=>{
 for(const filename of ["awinnew.txt","awinnew_brand_dewalt.txt","awinnew_brand_bosch-professional.txt","awinnew_cat_power-tools.txt","AWINNEW_CAT_AIR-TOOLS-COMPRESSORS.TXT","awinnew.txt.gz"])
  assert.equal(currentTooledUpFilename(filename),true,filename);
 for(const filename of ["awin.txt","awin_old.txt","oldcat_power-tools.txt","awinnew_brand_.txt","awinnew_cat_bad/unsafe.txt","awinnew.csv"])
  assert.equal(currentTooledUpFilename(filename),false,filename);
});
test("feed list route is owner-gated and never returns URLs",()=>{
 const route=readFileSync("app/api/control-centre/feed-list-audit/route.ts","utf8");
 assert.ok(route.indexOf("db.auth.getUser()")<route.indexOf("inspectAwinFeedList("));
 assert.ok(route.indexOf("joined_programme_observed===true")<route.indexOf("inspectAwinFeedList("));
 assert.match(route,/Cache-Control/);
});
