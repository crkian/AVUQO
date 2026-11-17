import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {sourceIngestionFailures,evaluateSourceControls} from "../../../../lib/pipeline/source-readiness";
import {runDealIntelligencePipeline} from "../../../../lib/pipeline/run";
import {autoReleaseEligibleAwinOffers} from "../../../../lib/awin/auto-first-publication";

export const maxDuration=300;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{
 status,headers:{"Cache-Control":"private, no-store"}
});

/**
 * Existing Awin Enhanced API pipeline, not a second importer.
 * Never activates the Awin source, grants merchant rights, auto-approves
 * first public offers, or downloads private CSV feed-list URLs.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
    request.headers.get("authorization")!== `Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 const admin=createAdminClient();
 const [{data:source,error:sourceError},{data:controls,error:controlsError}]=await Promise.all([
  admin.from("sources").select("id,status,sync_enabled,credential_status,connector_key,source_type,metadata")
   .eq("connector_key","awin").maybeSingle(),
  admin.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion","deal_publishing"])
 ]);
 // This job must remain dormant in today's paused, unapproved production state.
 if(sourceError||!source||controlsError)return reply({status:"readiness_unavailable",no_import:true,no_publication:true},503);
 const flags=evaluateSourceControls(controls,!!controlsError);
 if(!flags.ingestion||!flags.publishing||source.status!=="active"||source.sync_enabled!==true)
  return reply({status:"paused",no_import:true,no_publication:true});
 // Multi-merchant held offers must not depend on one default Enhanced API
 // advertiser. The automatic publisher independently validates each merchant.
 const publication=await autoReleaseEligibleAwinOffers(admin,15);
 const advertiser=process.env.AWIN_ADVERTISER_ID??"";
 const configured=/^\d{3,15}$/.test(process.env.AWIN_PUBLISHER_ID??"")&&
  /^\d{2,12}$/.test(advertiser)&&Boolean(process.env.AWIN_ACCESS_TOKEN);
 const problems=sourceIngestionFailures(source,{
  advertiserId:advertiser,connectorConfigured:configured
 });
 if(problems.length)return reply({status:"approval_pending",no_import:true,
  automatic_publication:publication,enhanced_api_skipped:true});
 try{
  // Bounded first-cohort refresh. The existing worker validates the
  // advertiser, source controls, matches, scores and release status per row.
  const run=await runDealIntelligencePipeline(admin,{sourceKey:"awin",limit:25});
  // Only after the normal authenticated source refresh, evaluate other
  // held GBP offers from accepted advertisers against the recorded standing
  // owner grant. The existing atomic release RPC remains the only publisher.
  return reply({status:run.status,seen:run.seen,accepted:run.accepted,
   rejected:run.rejected,private_details:false,automatic_publication:publication,
   first_time_publication_requires_verified_source_and_owner_grant:true});
 }catch{
  return reply({error:"Enhanced Awin refresh failed",automatic_publication:publication,
   no_unverified_publication_claim:true},503);
 }
}
