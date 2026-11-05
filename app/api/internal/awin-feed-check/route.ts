import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { inspectAwinFeedList } from "../../../../lib/awin/feed-list-audit";
import { joinedAwinAdvertisers } from "../../../../lib/awin/joined-catalogue";

/**
 * Metadata discovery only. Never download retailer product feeds or persist Awin
 * signed download links. The Awin source remains paused until separate rights
 * and source activation workflows are approved.
 */
const send=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
async function readLimitedCsv(response:Response,limit=2_500_000){
 if(!response.body)throw Error("Awin response unavailable");
 const reader=response.body.getReader();const decoder=new TextDecoder();
 const chunks:string[]=[];let length=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   length+=value.byteLength;
   if(length>limit)throw Error("Feed inventory limit exceeded");
   chunks.push(decoder.decode(value,{stream:true}));
  }
  chunks.push(decoder.decode());
  return chunks.join("");
 }finally{await reader.cancel().catch(()=>{});}
}
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return send({error:"Unauthorized"},401);
 if(process.env.AWIN_FEED_MONITOR_ENABLED!=="true")
  return send({status:"disabled",metadata_only:true},200);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 // The key is never returned, logged or included in errors. Require the
 // dedicated product-data key, not generic Awin Partner API credentials.
 if(!/^[a-zA-Z0-9_-]{16,200}$/.test(key))
  return send({error:"Awin datafeed key not configured"},503);
 const admin=createAdminClient();
 const {data:source,error:sourceError}=await admin.from("sources")
  .select("metadata").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)return send({error:"Awin source registry unavailable"},503);
 const metadata=source.metadata&&typeof source.metadata==="object"&&!Array.isArray(source.metadata)
  ?source.metadata as {awin_advertisers?:unknown}:{};
 const joined=new Set<string>();
 if(Array.isArray(metadata.awin_advertisers)){
  for(const row of metadata.awin_advertisers){
   if(!row||typeof row!=="object"||Array.isArray(row))continue;
   const entry=row as {advertiser_id?:unknown;joined_programme_observed?:unknown};
   if(entry.joined_programme_observed===true&&typeof entry.advertiser_id==="string"
     &&joinedAwinAdvertisers.some(([id])=>id===entry.advertiser_id))joined.add(entry.advertiser_id);
  }
 }
 if(joined.size===0)return send({error:"No observed joined advertisers"},403);
 // Retry through the documented publisher download endpoint if the productdata
 // host times out, redirects, or returns a non-CSV payload. Neither endpoint
 // accepts user-supplied hosts or redirect targets.
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^\\d{3,15}$/.test(publisher))return send({error:"Awin publisher ID not configured"},503);
 const candidates=[
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`,
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`
 ];
 let lastFailure:"network_or_timeout"|"upstream_http"|"invalid_inventory"="network_or_timeout";
 let lastStatus:number|null=null;
 for(const [index,url] of candidates.entries()){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const result=await fetch(url,{method:"GET",cache:"no-store",redirect:"error",signal:controller.signal,
    headers:{Accept:"text/csv"}});
   if(!result.ok){
    lastFailure="upstream_http";
    lastStatus=result.status;
    continue;
   }
   const csv=await readLimitedCsv(result);
   let report:ReturnType<typeof inspectAwinFeedList>;
   try{report=inspectAwinFeedList(csv,joined);}
   catch{lastFailure="invalid_inventory";continue;}
   if(report.invalidRows>0)return send({error:"Awin feed inventory contains malformed entries"},422);
   const {data,error}=await admin.rpc("record_awin_feed_discovery",{
    p_feeds:report.feeds,p_active:report.activeRows
   });
   if(error)return send({error:"Unable to record feed changes"},503);
   return send({status:"checked",metadata_only:true,...data,
    checked_advertisers:report.byMerchant.length,
    provider_endpoint:index===0?"productdata":"publisher_download",
    no_product_downloads:true,no_publication:true});
  }catch{
   lastFailure="network_or_timeout";
   lastStatus=null;
  }finally{clearTimeout(timeout);}
 }
 // Only reveal fixed error categories and HTTP status, never URLs or upstream
 // response bodies containing credential-bearing links.
 return send({error:"Awin feed inventory unavailable",failure_kind:lastFailure,
  upstream_status:lastFailure==="upstream_http"?lastStatus:null},502);
}
