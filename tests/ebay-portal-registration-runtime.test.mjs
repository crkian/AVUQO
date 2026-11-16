import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash,randomBytes} from "node:crypto";
import {createRequire} from "node:module";
import {runInNewContext} from "node:vm";

const require=createRequire(import.meta.url);
const ts=require("typescript");
const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(route,{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}
}).outputText;
const endpoint="https://www.avuqo.com/api/ebay/account-deletion";
const token=randomBytes(32).toString("hex");

function harness({
 configured=endpoint,
 verificationToken=token,
 clientId,
 clientSecret,
 signatureValid=false,
 journalResult="recorded"
}={}){
 const calls={signature:0,journal:0};
 const env={
  EBAY_DELETION_ENDPOINT_URL:configured,
  EBAY_DELETION_VERIFICATION_TOKEN:verificationToken,
  EBAY_CLIENT_ID:clientId,
  EBAY_CLIENT_SECRET:clientSecret
 };
 class Response {
  constructor(json,init={}) {
   this.status=init.status??200;
   this.headers=new Map(Object.entries(init.headers??{}));
   this.headers.set("Content-Type","application/json");
   this.payload=json;
  }
  async json(){return this.payload;}
 }
 const NextResponse={json:(json,init)=>new Response(json,init)};
 const exports={};
 runInNewContext(compiled,{
  exports,
  require(path){
   if(path==="node:crypto")return require("node:crypto");
   if(path==="next/server")return {NextResponse};
   if(path==="../../../../lib/ebay/deletion-signature")
    return {verifyEbaySignature:async()=>{calls.signature++;return signatureValid;}};
   if(path==="../../../../lib/ebay/deletion-journal")
    return {journalVerifiedEbayDeletion:async()=>{calls.journal++;return journalResult;}};
   throw new Error("Unexpected import: "+path);
  },
  process:{env}, URL, Object,Array,String,Number,JSON,Error
 },{filename:"ebay-portal-route.compiled.cjs",timeout:5000});
 const get=(suffix="?challenge_code=syntheticChallenge123")=>
  exports.GET({url:endpoint+suffix});
 const post=(body,opts={})=>
  exports.POST({
   headers:new Map(Object.entries({
    "content-type":"application/json",
    "x-ebay-signature":"synthetic-valid-signature",
    ...opts.headers
   })),
   text:async()=>typeof body==="string"?body:JSON.stringify(body)
  });
 return {get,post,calls};
}
const notice={
 metadata:{topic:"MARKETPLACE_ACCOUNT_DELETION"},
 notification:{notificationId:"synthetic-notice-123",data:{userId:"synthetic-user"}}
};

test("registration GET uses the exact canonical HTTPS URL and required hash order",async()=>{
 const h=harness();
 const r=await h.get("?challenge_code=syntheticChallenge123");
 assert.equal(r.status,200);
 assert.deepEqual(JSON.parse(JSON.stringify(await r.json())),{
  challengeResponse:createHash("sha256")
   .update("syntheticChallenge123"+token+endpoint,"utf8").digest("hex")
 });
 assert.equal(r.headers.get("Cache-Control"),"no-store");
 assert.equal(r.headers.get("X-Content-Type-Options"),"nosniff");
 assert.equal(r.headers.get("Content-Type"),"application/json");
});

test("challenge is unavailable without matching production configuration",async()=>{
 for(const h of [
  harness({configured:"https://avuqo.com/api/ebay/account-deletion"}),
  harness({configured:undefined,verificationToken:"short"}),
  harness({configured:endpoint,verificationToken:"spaces are not valid token values"})
 ]){
  const r=await h.get();
  assert.equal(r.status,503);
  assert.equal((await r.json()).error,"Endpoint unavailable");
 }
});
test("invalid or ambiguous GET challenges are rejected without leaking configuration",async()=>{
 const h=harness();
 for(const suffix of ["","?x=123","?challenge_code=","?challenge_code=a&challenge_code=b",
  "?challenge_code=a&x=extra","?challenge_code=%20"]){
  const r=await h.get(suffix);
  assert.equal(r.status,400,suffix);
  assert.deepEqual(Object.keys(await r.json()),["error"]);
 }
});
test("production POST fails closed without credentials",async()=>{
 const h=harness();
 const r=await h.post(notice);
 assert.equal(r.status,503);
 assert.equal(h.calls.signature,0);
 assert.equal(h.calls.journal,0);
});
test("even authenticated and durably journaled synthetic POST cannot falsely acknowledge deletion",async()=>{
 for(const journalResult of ["recorded","duplicate","unavailable"]){
  const h=harness({
   clientId:"synthetic-id",clientSecret:"synthetic-secret",
   signatureValid:true,journalResult
  });
  const r=await h.post(notice);
  assert.equal(r.status,503);
  assert.equal(r.headers.get("Retry-After"),"3600");
  assert.equal(h.calls.signature,1);
  assert.equal(h.calls.journal,1);
  assert.ok(![200,201,202,204].includes(r.status));
 }
});
test("invalid signature never journals or acknowledges",async()=>{
 const h=harness({clientId:"synthetic-id",clientSecret:"synthetic-secret"});
 const r=await h.post(notice);
 assert.equal(r.status,412);
 assert.equal(h.calls.journal,0);
});
test("subscription must not be enabled by test or routing code",()=>{
 assert.match(route,/const EXACT_ENDPOINT="https:\/\/www\.avuqo\.com\/api\/ebay\/account-deletion"/);
 assert.match(route,/EBAY_DELETION_VERIFICATION_TOKEN/);
 assert.match(route,/EBAY_DELETION_ENDPOINT_URL/);
 assert.match(route,/status:503/);
 assert.doesNotMatch(route.slice(route.indexOf('export async function POST')),/status:20[0124]/);
});
