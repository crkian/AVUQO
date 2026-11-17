import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {evaluateSourceControls} from "../../../../lib/pipeline/source-readiness";
import {runDealIntelligencePipeline} from "../../../../lib/pipeline/run";
import {fromFreshPrivateAwinRecord} from "../../../../lib/awin/fresh-private-canonical-row";

export const maxDuration=300;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{
 status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}
});

/** Awin signed-feed physical SKU routes ONLY. Tyres need fitted/delivered
 * price interpretation; services need booking/contract adapters. Third-party
 * character licences are never presumed from a feed download.
 */
const FEEDS=[
 {id:"31539",feed:"74135",name:"Mozillion"},
 {id:"77952",feed:"103580",name:"Petlibro UK Affiliate Program"},
 {id:"736",feed:"48599",name:"Cadbury Gifts Direct"},
 {id:"45747",feed:"F1356",name:"Craft Buddy Shop"}
] as const;
const restricted=/\b(harry potter|disney|marvel|star wars)\b/i;

/** Reuse the production canonical pipeline. This fetches NO customer-facing
 * data itself and never grants rights, unpauses Awin, or first-publishes.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
   request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 const db=createAdminClient();
 const [{data:source,error:sourceError},{data:controls,error:controlError}]=await Promise.all([
  db.from("sources").select("id,status,sync_enabled,credential_status,metadata")
   .eq("connector_key","awin").maybeSingle(),
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["source_ingestion","deal_publishing","global_emergency_stop"])
 ]);
 if(sourceError||controlError||!source)return reply({status:"readiness_unavailable",no_publication:true},503);
 const flags=evaluateSourceControls(controls);
 if(!flags.ingestion||!flags.publishing||source.status!=="active"||source.sync_enabled!==true||
   source.credential_status!=="ready")
  return reply({status:"paused",no_import:true,no_publication:true});
 if(!process.env.AWIN_DATAFEED_API_KEY||!process.env.AWIN_PUBLISHER_ID)
  return reply({status:"datafeed_key_unavailable",no_import:true,no_publication:true},503);

 const {data:programmes,error:programmeError}=await db.from("affiliate_programs")
  .select("external_account_id,region,metadata").eq("provider","awin")
  .in("external_account_id",FEEDS.map(f=>f.id)).eq("region","GB");
 if(programmeError)return reply({status:"accepted_programmes_unavailable",no_import:true},503);
 const accepted=new Set((programmes??[]).filter(p=>{
  const m=p.metadata&&typeof p.metadata==="object"&&!Array.isArray(p.metadata)?
   p.metadata as Record<string,unknown>:{};
  const a=m.owner_joined_accepted_attestation;
  return a&&typeof a==="object"&&!Array.isArray(a)&&
   (a as Record<string,unknown>).membership_status==="accepted";
 }).map(p=>p.external_account_id));

 const cutoff=new Date(Date.now()-6*3600_000).toISOString();
 const outcomes:{advertiser_id:string;status:string;seen?:number;held?:number}[]=[];
 for(const pair of FEEDS){
  if(!accepted.has(pair.id)){
   outcomes.push({advertiser_id:pair.id,status:"not_accepted_in_canonical_registry"});continue;
  }
  const {data:runs,error:runError}=await db.from("feed_import_runs")
   .select("id").eq("merchant_id",pair.id).eq("status","private_review")
   .gte("created_at",cutoff).order("created_at",{ascending:false}).limit(1);
  if(runError||!runs?.length){
   outcomes.push({advertiser_id:pair.id,status:runError?"private_run_unavailable":"no_fresh_completed_private_run"});
   continue;
  }
  const {data:privateRows,error:rowsError}=await db.from("feed_import_records")
   .select("merchant_id,merchant_product_id,title,price,currency,status,brand,category,created_at,metadata")
   .eq("import_id",runs[0].id).eq("merchant_id",pair.id).eq("status","review")
   .order("created_at",{ascending:false}).limit(100);
  if(rowsError){
   outcomes.push({advertiser_id:pair.id,status:"private_rows_unavailable"});continue;
  }
  const verified=(privateRows??[]).filter(row=>pair.id!=="45747"||!restricted.test(row.title??""))
   .map(row=>fromFreshPrivateAwinRecord(row,pair.name,pair.id,pair.feed))
   .filter((x):x is NonNullable<typeof x>=>Boolean(x)).slice(0,10);
  if(!verified.length){
   outcomes.push({advertiser_id:pair.id,status:"no_current_verified_gbp_tracked_stocked_rows"});continue;
  }
  // The shared pipeline rechecks exact advertiser rights and global source
  // controls before every write and keeps first-time Awin offers HELD.
  try{
   const result=await runDealIntelligencePipeline(db,{
    sourceKey:"awin",limit:10,awinAdvertiserId:pair.id,awinVerifiedRows:verified
   });
   outcomes.push({advertiser_id:pair.id,status:result.status,
    seen:result.seen,held:result.accepted});
  }catch{
   outcomes.push({advertiser_id:pair.id,status:"canonical_admission_blocked"});
  }
 }
 const seen_total=outcomes.reduce((n,x)=>n+(x.seen??0),0);
 const held_total=outcomes.reduce((n,x)=>n+(x.held??0),0);
 return reply({status:"private_to_held_canonical_checked",no_first_publication:true,
  notes:"No tyres, services, unverified links, or historical prices were imported",
  seen_total,held_total,outcomes});
}
