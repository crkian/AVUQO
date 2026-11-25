import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {stageLiveAwinCanonicalCandidates} from "../../../../lib/awin/private-live-canonical-stage";

export const maxDuration=300;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
type Cohort={import_id:string;advertiser:string;feed:string;digest:string;merchant_product_ids:string[]};
/** Bounded exact-evidence conversion. No direct activation or publication. */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)return reply({error:"Unauthorized"},401);
 if(new URL(request.url).search)return reply({error:"No batch overrides"},400);
 if(process.env.AWIN_PUBLISHER_ID!=="3135746"||!process.env.AWIN_DATAFEED_API_KEY)return reply({status:"credential_gate"},503);
 const db=createAdminClient();
 const start=Date.now();
 const batch=process.env.AWIN_CATALOGUE_SCALE_ENABLED==="true"?50:20;
 const {data:attempt,error:claimError}=await db.rpc("claim_awin_catalogue_conversion");
 if(claimError)return reply({status:"conversion_claim_unavailable"},503);
 if(!attempt)return reply({status:"already_running"});
 let cohort:Cohort|undefined;
 let accepted=0,selected=0;
 let status="conversion_failed",http=503;
 try{
  const {data,error}=await db.rpc("next_awin_catalogue_conversion",{p_slot:Math.floor(Date.now()/60000)%6,p_limit:batch});
  if(error)throw Error("queue unavailable");
  cohort=(data as Cohort[]|null)?.[0];
  if(!cohort){status="no_current_unconverted_rows";http=200;}
  else{
   selected=cohort.merchant_product_ids.length;
   const result=await stageLiveAwinCanonicalCandidates(db,{importId:cohort.import_id,advertiser:cohort.advertiser,feed:cohort.feed,digest:cohort.digest,merchantProductIds:cohort.merchant_product_ids,limit:batch});
   accepted=result.canonicalAccepted;
   status=result.status==="canonical_held"?"canonical_held":result.status==="no_fresh_exact_feed_rows"?"no_fresh_exact_feed_rows":"canonical_conversion_rejected";
   http=status==="canonical_conversion_rejected"?503:200;
  }
 }catch{status="conversion_failed";http=503;}
 const {error:finishError}=await db.from("awin_private_cron_attempts").update({
  state:http===200?"completed":"rejected",outcome_code:status,http_status:http,
  finished_at:new Date().toISOString(),duration_ms:Math.min(3600000,Date.now()-start),
  advertiser_id:cohort?.advertiser??null,feed_id:cohort?.feed??null,
  live_verified_rows:selected,canonical_accepted:accepted
 }).eq("id",attempt).eq("state","started");
 if(finishError)return reply({status:"conversion_audit_unavailable"},503);
 return reply({status,selected,canonical_accepted:accepted,no_direct_publication:true},http);
}
