import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizedFeedFilename,recognisedPilotMerchant} from "../lib/feed-imports/filename.ts";

test("numbered Cadbury duplicate filenames preserve canonical merchant",()=>{
 for(const suffix of [""," (1)"," (2)"," (10)"," (999)"]){
  const name=`736-48599-en_GB-Cadbury_Shopping_Feed${suffix}.csv.gz`;
  assert.equal(recognisedPilotMerchant(name)?.id,"736");
  assert.equal(normalizedFeedFilename(name),"736-48599-en_GB-Cadbury_Shopping_Feed.csv.gz");
 }
});
test("normalise numbered Google Craft Buddy and Petlibro names",()=>{
 assert.equal(recognisedPilotMerchant("45747-retail-en_GB (3).csv.gz")?.id,"45747");
 assert.equal(recognisedPilotMerchant("datafeed_3135746 (12).csv.gz")?.id,"77952");
 assert.equal(recognisedPilotMerchant("datafeed_3135746.csv")?.id,"77952");
});
test("unknown merchant and malicious/suspicious variations cannot impersonate Cadbury",()=>{
 assert.equal(recognisedPilotMerchant("736-Cadbury-anything (1).csv.gz"),null);
 assert.equal(recognisedPilotMerchant("736-48599-en_GB-Cadbury_Shopping_Feed (0).csv.gz"),null);
 assert.equal(recognisedPilotMerchant("736-48599-en_GB-Cadbury_Shopping_Feed (1).csv.gz.exe"),null);
 assert.equal(recognisedPilotMerchant("random (2).csv.gz"),null);
});
test("importer validates content merchant ID after filename recognition and shows precise errors",()=>{
 const source=readFileSync("app/api/control-centre/feed-imports/route.ts","utf8");
 assert.ok(source.indexOf("recognisedPilotMerchant(file.name)")<source.indexOf("records.some(r => r.merchant_id !== merchantId)"));
 assert.match(source,/File name must end with \.csv or \.csv.gz/);
 assert.match(source,/Compressed feed exceeds the 8 MB upload limit/);
});
