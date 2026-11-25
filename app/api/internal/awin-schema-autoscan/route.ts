import {NextRequest,NextResponse} from "next/server";
import {GET as probeFeed} from "../awin-feed-schema-probe/route";

export const maxDuration=300;
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
/** Private, bounded inventory scan. Never stages products or changes source controls.
 * Stop when all accepted observed feed entries have a current schema result.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return respond({error:"Unauthorized"},401);
 const outcomes:Record<string,number>={schema_profiled:0,recognised_specialist_route:0,
  schema_probe_quarantined:0,inventory_unavailable:0,feed_not_uniquely_active:0,other:0};
 let examined=0,finished=false;
 for(let i=0;i<8;i++){
  const url=new URL("/api/internal/awin-feed-schema-probe",request.url);
  url.searchParams.set("offset","next");
  url.searchParams.set("only_new","1");
  const response=await probeFeed(new NextRequest(url,{method:"GET",headers:{authorization:`Bearer ${secret}`}}));
  let data:Record<string,unknown>={};
  try{data=await response.json() as Record<string,unknown>;}catch{}
  const state=typeof data.status==="string"?data.status:"other";
  if(state==="all_accepted_feeds_inspected"){finished=true;break;}
  if(state==="registry_or_profile_ledger_unavailable"||state==="profile_recording_failed"||
     state==="credentials_unavailable"||state==="no_accepted_feed_observations")
   return respond({status:"scan_blocked",reason:state,examined,private_only:true,no_publication:true},503);
  outcomes[Object.prototype.hasOwnProperty.call(outcomes,state)?state:"other"]++;
  examined++;
 }
 return respond({status:finished?"scan_inventory_complete":"scan_batch_recorded",examined,
  outcomes,private_only:true,no_publication:true});
}
