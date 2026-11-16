import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {runInNewContext} from "node:vm";
import {generateKeyPairSync,createSign} from "node:crypto";

const require=createRequire(import.meta.url);
const ts=require("typescript");
const source=readFileSync(new URL("../lib/ebay/deletion-signature.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText;
const {publicKey,privateKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
const pem=publicKey.export({format:"pem",type:"spki"});
const compactPem=pem.replace(/\n/g,"");
const notice={
 metadata:{topic:"MARKETPLACE_ACCOUNT_DELETION",schemaVersion:"1.0",deprecated:false},
 notification:{
  notificationId:"test-notification-001",eventDate:"2026-11-16T12:00:00.000Z",
  publishDate:"2026-11-16T12:00:00.000Z",publishAttemptCount:1,
  data:{userId:"synthetic-user"}
 }
};
const headerFor=(payload,kid="synthetic-key")=>{
 const signature=createSign("sha1").update(JSON.stringify(payload)).sign(privateKey,"base64");
 return Buffer.from(JSON.stringify({kid,signature})).toString("base64");
};

function harness({invalidKey=false,oauthFailure=false}={}){
 const calls={oauth:0,keys:0};
 const env={
  EBAY_CLIENT_ID:"synthetic-production-client",
  EBAY_CLIENT_SECRET:"synthetic-production-secret"
 };
 const fetch=async(url,opts)=>{
  if(url==="https://api.ebay.com/identity/v1/oauth2/token"){
   calls.oauth++;
   assert.equal(opts.method,"POST");
   assert.match(opts.headers.Authorization,/^Basic /);
   return {ok:!oauthFailure,json:async()=>({access_token:"synthetic_access_token_1234",expires_in:3600})};
  }
  if(url==="https://api.ebay.com/commerce/notification/v1/public_key/synthetic-key"){
   calls.keys++;
   assert.match(opts.headers.Authorization,/^Bearer /);
   return {ok:true,json:async()=>({key:invalidKey?"invalid":compactPem})};
  }
  throw new Error("Unexpected outbound request");
 };
 const exports={};
 runInNewContext(compiled,{
  exports,
  require(id){
   if(id==="server-only")return {};
   if(id==="node:crypto")return require("node:crypto");
   throw new Error("Unexpected import "+id);
  },
  process:{env},
  Buffer,Date,Map,Number,Object,Array,String,JSON,Error,AbortSignal,
  encodeURIComponent,fetch
 },{filename:"deletion-signature.compiled.cjs",timeout:5000});
 return {verify:exports.verifyEbaySignature,calls};
}

test("genuine synthetic signed eBay JSON succeeds with fake OAuth and public key",async()=>{
 const h=harness();
 assert.equal(await h.verify(notice,headerFor(notice)),true);
 assert.equal(h.calls.oauth,1);
 assert.equal(h.calls.keys,1);
 assert.equal(await h.verify(notice,headerFor(notice)),true);
 assert.equal(h.calls.oauth,1);
 assert.equal(h.calls.keys,1);
});

test("tampered message and missing/malformed headers are rejected",async()=>{
 const h=harness();
 const sig=headerFor(notice);
 assert.equal(await h.verify({...notice,extra:"tampered"},sig),false);
 assert.equal(await h.verify(notice,null),false);
 assert.equal(await h.verify(notice,"%%!bad-signature!"),false);
 assert.equal(await h.verify(notice,Buffer.from(JSON.stringify({kid:"../path",signature:"abc"})).toString("base64")),false);
 assert.equal(await h.verify(notice,Buffer.from(JSON.stringify({kid:"synthetic-key",signature:"not-valid!!!"})).toString("base64")),false);
});

test("public key lookup failures and OAuth failures fail closed",async()=>{
 const h1=harness({invalidKey:true});
 assert.equal(await h1.verify(notice,headerFor(notice)),false);
 const h2=harness({oauthFailure:true});
 assert.equal(await h2.verify(notice,headerFor(notice)),false);
});

test("signed payload from different EC key fails verification",async()=>{
 const h=harness();
 const other=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const signature=createSign("sha1").update(JSON.stringify(notice))
  .sign(other.privateKey,"base64");
 const header=Buffer.from(JSON.stringify({kid:"synthetic-key",signature})).toString("base64");
 assert.equal(await h.verify(notice,header),false);
});
