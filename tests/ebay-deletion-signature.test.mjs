import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {generateKeyPairSync,createSign,createVerify} from "node:crypto";
const read=(file)=>readFileSync(new URL("../"+file,import.meta.url),"utf8");
const verifier=read("lib/ebay/deletion-signature.ts");
const handler=read("app/api/ebay/account-deletion/route.ts");

test("eBay signature path uses fixed production endpoints and strict key ID",()=>{
 assert.match(verifier,/https:\/\/api\.ebay\.com\/identity\/v1\/oauth2\/token/);
 assert.match(verifier,/https:\/\/api\.ebay\.com\/commerce\/notification\/v1\/public_key\//);
 assert.match(verifier,/\^\[A-Za-z0-9_-\]\{1,128\}\$/);
 assert.match(verifier,/EBAY_CLIENT_ID/);
 assert.match(verifier,/EBAY_CLIENT_SECRET/);
 assert.match(verifier,/AbortSignal\.timeout\(8000\)/);
 assert.match(verifier,/const KEY_TTL=60\*60\*1000/);
 assert.doesNotMatch(verifier,/sandbox\.ebay\.com/);
});

test("signed POST never acknowledges merely because the signature passes",()=>{
 assert.match(handler,/verifyEbaySignature\(payload,request\.headers\.get\("x-ebay-signature"\)\)/);
 assert.match(handler,/metadata\?\.topic!=="MARKETPLACE_ACCOUNT_DELETION"/);
 assert.match(handler,/error:"Signature invalid"/);
 assert.match(handler,/status:412/);
 assert.match(handler,/error:"Deletion processing not enabled"/);
 assert.match(handler,/status:503/);
 assert.doesNotMatch(handler,/return new Response\(null,\{status:204\}/);
});

test("eBay-style EC signature verification uses SHA1 compatible digest",()=>{
 const {publicKey,privateKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const payload={metadata:{topic:"MARKETPLACE_ACCOUNT_DELETION"},notification:{notificationId:"synthetic"}};
 const signed=createSign("sha1").update(JSON.stringify(payload)).sign(privateKey);
 assert.ok(createVerify("sha1").update(JSON.stringify(payload)).verify(publicKey,signed));
 assert.ok(!createVerify("sha1").update(JSON.stringify({...payload,extra:true})).verify(publicKey,signed));
 assert.match(verifier,/createVerify\("sha1"\)/);
 assert.match(verifier,/verifier\.update\(JSON\.stringify\(payload\),"utf8"\)/);
});
