import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {POST as importFeed} from "../../internal/awin-auto-import/route";
import {POST as captureMaster} from "../../internal/awin-tooled-up-snapshot/route";
import {POST as validateMaster} from "../../internal/awin-snapshot-validate/route";
import {GET as bridgeFreshOffers} from "../../internal/awin-fresh-private-canonical-bridge/route";
import {AWIN_PRIVATE_SNAPSHOT_BUCKET} from "../../../../lib/awin/private-snapshot";
import {newestRecentTooledUpSnapshot} from "../../../../lib/awin/tooled-up-recent-snapshot";

export const maxDuration=300;
const result=(data:unknown,status=200)=>NextResponse.json(data,{
 status,headers:{"Cache-Control":"private, no-store"}
});
const FEEDS:Record<string,readonly [string,string]>={
 petlibro:["77952","103580"],mozillion:["31539","74135"],
 cadbury:["736","48599"],craftbuddy:["45747","F1356"]
};
const OUTPUT_KEYS=["status","error","reason","failure_kind","diagnostic_stage","detected_delimiter","columns","parsed_rows","rows","records","seen_total","held_total","no_first_publication",
 "advertiser_id","feed_id","currency_source","source_currency_explicit",
 "critical_issues","compressed_bytes","actual_rows","duplicate_product_ids",
 "invalid_price_rows","unverified_affiliate_links","private_only","no_publication"] as const;

async function sanitized(response:Promise<Response>){
 const r=await response;
 let payload:unknown;
 try{payload=await r.json();}catch{payload=null;}
 const src=payload&&typeof payload==="object"&&!Array.isArray(payload)
  ?payload as Record<string,unknown>:{};
 const safe:Record<string,string|number|boolean>={private_only:true,no_publication:true};
 for(const key of OUTPUT_KEYS){
  const value=src[key];
  if(typeof value==="boolean"||typeof value==="number"&&Number.isFinite(value))
   safe[key]=value;
  else if(typeof value==="string"&&value.length<=100&&
   /^[a-zA-Z0-9 _-]{1,100}$/.test(value))safe[key]=value;
 }
 return result(safe,r.status);
}

/** Authenticated owner-only immediate checks; no public source activation. */
export async function POST(request:NextRequest){
 try{
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return result({error:"Sign in required"},401);
  const {data:role,error:roleError}=await db.from("user_roles")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return result({error:"Owner permission required"},403);
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)
   return result({error:"Same origin required"},403);
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
   return result({error:"JSON required"},415);
  if(new URL(request.url).search||Number(request.headers.get("content-length")??0)>256)
   return result({error:"Invalid request"},400);
  const raw=await request.text();
  if(raw.length>256)return result({error:"Request too long"},413);
  const body=JSON.parse(raw) as Record<string,unknown>;
  if(!body||typeof body!=="object"||Array.isArray(body)||
   Object.keys(body).some(key=>!["task","confirm"].includes(key))||
   typeof body.task!=="string")return result({error:"Invalid task"},400);
  const task=body.task;
  const parts=task.split("_");
  const action=parts.pop();
  const merchant=parts.join("_");
  const pair=Object.prototype.hasOwnProperty.call(FEEDS,merchant)?FEEDS[merchant]:null;
  const isPilot=!!pair&&(action==="preflight"||action==="stage");
  const isTooledUp=merchant==="tooled_up"&&(action==="snapshot"||action==="validate");
  const isBridge=task==="canonical_bridge";
  if(!isPilot&&!isTooledUp&&!isBridge)return result({error:"Task not approved"},403);
  if(action==="preflight"){
   if(body.confirm!==undefined)return result({error:"Unexpected confirmation"},400);
  }else if(body.confirm!=="private-only-"+task)
   return result({error:"Explicit private confirmation required"},400);
  const secret=process.env.CRON_SECRET;
  if(!secret||secret.length<16)return result({error:"Importer unavailable"},503);
  const auth={authorization:`Bearer ${secret}`};
  if(isBridge){
   const url=new URL("/api/internal/awin-fresh-private-canonical-bridge",request.url);
   return sanitized(bridgeFreshOffers(new NextRequest(url,{method:"GET",headers:auth})));
  }
  if(pair){
   const [advertiser,feed]=pair;
   const url=new URL("/api/internal/awin-auto-import",request.url);
   url.searchParams.set("mode",action!);
   url.searchParams.set("advertiser_id",advertiser);
   url.searchParams.set("feed_id",feed);
   return sanitized(importFeed(new NextRequest(url,{method:"POST",headers:auth})));
  }
  if(action==="snapshot"){
   const url=new URL("/api/internal/awin-tooled-up-snapshot",request.url);
   return sanitized(captureMaster(new NextRequest(url,{method:"POST",headers:auth})));
  }
  // No user-supplied signed URL or hash; always latest recent immutable key.
  const admin=createAdminClient();
  const {data,error}=await admin.storage.from(AWIN_PRIVATE_SNAPSHOT_BUCKET)
   .list("awin/496/89987",{limit:100,offset:0,
     sortBy:{column:"created_at",order:"desc"}});
  if(error)return result({error:"Snapshot listing unavailable"},503);
  const latest=newestRecentTooledUpSnapshot(data);
  if(!latest)return result({status:"no_recent_private_snapshot",private_only:true,no_publication:true});
  const url=new URL("/api/internal/awin-snapshot-validate",request.url);
  return sanitized(validateMaster(new NextRequest(url,{
   method:"POST",headers:{...auth,"content-type":"application/json"},
   body:JSON.stringify({snapshot_sha256:latest.snapshot_sha256})
  })));
 }catch{
  return result({error:"Owner private task unavailable"},503);
 }
}
