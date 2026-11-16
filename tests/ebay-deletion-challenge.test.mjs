import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");

test("eBay callback is bound to the canonical AVUQO production URL",()=>{
 assert.match(route,/EXACT_ENDPOINT="https:\/\/www\.avuqo\.com\/api\/ebay\/account-deletion"/);
 assert.match(route,/configured!==EXACT_ENDPOINT/);
 assert.match(route,/EBAY_DELETION_VERIFICATION_TOKEN/);
 assert.match(route,/\{32,80\}/);
 assert.match(route,/challenge_code/);
 assert.match(route,/url\.searchParams\.size!==1/);
});

test("eBay challenge digest uses SHA256 in documented code, token, endpoint order",()=>{
 assert.match(route,/createHash\("sha256"\)/);
 assert.match(route,/\.update\(code\+token\+EXACT_ENDPOINT,"utf8"\)\.digest\("hex"\)/);
 const code="challenge123";
 const token="verifytoken_abcdefghijklmnopqrstuvwxyz123";
 const endpoint="https://www.avuqo.com/api/ebay/account-deletion";
 const value=createHash("sha256").update(code+token+endpoint,"utf8").digest("hex");
 assert.match(value,/^[a-f0-9]{64}$/);
 assert.notEqual(value,createHash("sha256").update(endpoint+token+code).digest("hex"));
});

test("notifications are not acknowledged until verified processing exists",()=>{
 assert.match(route,/export async function POST\(\)/);
 assert.match(route,/error:"Deletion receiver not enabled"/);
 assert.match(route,/status:503/);
 assert.doesNotMatch(route,/status:200[^]*Deletion receiver not enabled/);
});
