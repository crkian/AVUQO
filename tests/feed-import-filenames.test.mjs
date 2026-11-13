import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {normalizedFeedFilename,isCraftBuddyGoogleFeedFilename} from "../lib/feed-imports/filename.ts";

test("Chrome/Windows duplicate suffixes preserve actual extension and Craft Buddy parser format",()=>{
 for(const suffix of [""," (1)"," (2)"," (10)"," (999)"]){
  for(const ext of [".csv",".csv.gz",".CSV.GZ"]){
   const name="45747-retail-en_GB"+suffix+ext;
   assert.equal(normalizedFeedFilename(name),"45747-retail-en_GB"+ext,name);
   assert.equal(isCraftBuddyGoogleFeedFilename(name),true,name);
  }
 }
});
test("invalid/suspicious variations and other merchants cannot select Craft Buddy parser",()=>{
 for(const name of [
  "45747-retail-en_GB (0).csv.gz",
  "45747-retail-en_GB (-1).csv",
  "45747-retail-en_GB (1).csv.gz.exe",
  "45747-retail-en_GB (1) .csv.gz",
  "736-48599-en_GB-Cadbury_Shopping_Feed (1).csv.gz",
  "datafeed_3135746 (3).csv.gz",
  "unknown (1).csv",
  "45747-retail-en_GB (1).json"
 ]) assert.equal(isCraftBuddyGoogleFeedFilename(name),false,name);
 assert.equal(normalizedFeedFilename("736-48599-en_GB-Cadbury_Shopping_Feed (1).csv.gz"),
  "736-48599-en_GB-Cadbury_Shopping_Feed.csv.gz");
});
test("current Awin upload stays explicit, joined, private and validates advertiser on every row",()=>{
 const route=readFileSync(new URL("../app/api/control-centre/feed-imports/route.ts",import.meta.url),"utf8");
 assert.match(route,/const merchantId = String\(form\.get\('advertiser_id'\)/);
 assert.match(route,/joinedInSource\(source\.metadata, merchantId\)/);
 assert.match(route,/merchantId === '45747' && isCraftBuddyGoogleFeedFilename\(file\.name\)/);
 assert.match(route,/records\.some\(r => r\.merchant_id !== merchantId\)/);
 assert.match(route,/permission_status: 'unverified'/);
 assert.match(route,/status: 'private_review'/);
 assert.doesNotMatch(route,/recognisedPilotMerchant|merchantId = recognised\?\.id/);
});
test("invalid extension and genuine size/empty upload errors are distinct",()=>{
 const route=readFileSync(new URL("../app/api/control-centre/feed-imports/route.ts",import.meta.url),"utf8");
 assert.match(route,/File name must end with \.csv or \.csv\.gz/);
 assert.match(route,/Compressed feed exceeds the 8 MB upload limit/);
 assert.match(route,/The selected feed is empty/);
 assert.ok(route.indexOf("File name must end with")<route.indexOf("Compressed feed exceeds"));
 assert.ok(route.indexOf("Compressed feed exceeds")<route.indexOf("The selected feed is empty"));
});
