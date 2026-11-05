import test from "node:test";
import assert from "node:assert/strict";
import {uploadPrivateAwinTus,privateStorageTusEndpoint} from "../lib/awin/private-tus-upload.ts";

const key=`awin/496/89987/${"a".repeat(64)}.csv.gz`;
const base="https://tfoukwcruaamrtgxzshh.supabase.co/";
test("TUS uploads an immutable private object with validated offsets",async()=>{
 const calls=[];
 const mock=async(url,opts)=>{
  calls.push({url:String(url),opts});
  if(opts.method==="POST")return new Response(null,{status:201,headers:{
   location:"/storage/v1/upload/resumable/upload-test"
  }});
  return new Response(null,{status:204,headers:{"upload-offset":"3"}});
 };
 const result=await uploadPrivateAwinTus(Uint8Array.from([1,2,3]),key,base,"x".repeat(20),mock);
 assert.equal(result.bytes_uploaded,3);
 assert.equal(result.chunk_count,1);
 assert.equal(calls.length,2);
 assert.equal(calls[0].opts.headers["Upload-Length"],"3");
 assert.match(calls[0].opts.headers["Upload-Metadata"],/bucketName/);
 assert.equal(calls[1].opts.headers["Upload-Offset"],"0");
 assert.equal(calls[1].opts.headers["x-upsert"],undefined);
});
test("rejects malicious redirects or upload locations",async()=>{
 const mock=async()=>new Response(null,{status:201,headers:{location:"https://evil.example/upload"}});
 await assert.rejects(()=>uploadPrivateAwinTus(new Uint8Array([1]),key,base,"x".repeat(20),mock),/unsafe_location/);
});
test("offset mismatch and invalid origin fail closed",async()=>{
 const mock=async(url,opts)=>opts.method==="POST"?
  new Response(null,{status:201,headers:{location:"/storage/v1/upload/resumable/upload-test"}}):
  new Response(null,{status:204,headers:{"upload-offset":"2"}});
 await assert.rejects(()=>uploadPrivateAwinTus(new Uint8Array([1]),key,base,"x".repeat(20),mock),/offset_mismatch/);
 assert.throws(()=>privateStorageTusEndpoint("http://localhost:54321"),/invalid_storage_origin/);
});
