import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {sourceIngestionFailures,evaluateSourceControls} from "../../../../lib/pipeline/source-readiness";
import {POST as runPrivateImport} from "../awin-auto-import/route";

export const maxDuration=300;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{
 status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}
});

/** Small, exact-ID retail cohorts for the existing strict physical-product
 * parser. Service contracts, tyres, insurance, travel and Tooled Up full-range
 * streaming stay in their dedicated pipelines. A feed not in the fresh
 * Awin registry cannot be selected for a provider download.
 */
const PAIRS=[
 {advertiser:"101445",feed:"F5142",kind:"Google"},
 {advertiser:"101445",feed:"96428",kind:"Awin"},
 {advertiser:"77952",feed:"109051",kind:"Awin"},
 {advertiser:"77952",feed:"109652",kind:"Awin"},
 {advertiser:"77952",feed:"119210",kind:"Awin"},
 {advertiser:"45747",feed:"F1356",kind:"Google"},
 {advertiser:"736",feed:"48599",kind:"Awin"},
 {advertiser:"77952",feed:"103580",kind:"Awin"},
 {advertiser:"31539",feed:"74135",kind:"Awin"}
] as const;

export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 // Cron uses zero offset. The signed-in owner gateway can pass a bounded
 // ordinal to inspect a different supported feed after a validation failure.
 // The ordinal never supplies a feed URL, advertiser or arbitrary feed ID.
 const offsetString=new URL(request.url).searchParams.get("offset");
 const offset=offsetString===null?0:Number(offsetString);
 if((offsetString!==null&&!/^[0-8]$/.test(offsetString))||
    !Number.isSafeInteger(offset)||offset<0||offset>8)
  return reply({error:"Invalid rotation offset"},400);
 const db=createAdminClient();
 const [{data:source,error:sourceError},{data:controls,error:controlError},
  {data:programmes,error:programmesError},{data:observations,error:observationsError}]=await Promise.all([
  db.from("sources").select("status,sync_enabled,credential_status,connector_key,source_type,metadata").eq("connector_key","awin").maybeSingle(),
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion"]),
  db.from("affiliate_programs").select("external_account_id,metadata")
   .eq("provider","awin").eq("region","GB"),
  db.from("awin_feed_update_observations")
   .select("advertiser_id,feed_id,feed_format,listed_products,observed_at")
   .limit(300),
 ]);
 if(sourceError||controlError||programmesError||observationsError||!source)
  return reply({status:"source_or_portfolio_unavailable",private_only:true,no_publication:true},503);
 const controlsReady=evaluateSourceControls(controls,!!controlError);
 const pausedMode=source.status==="paused"&&source.sync_enabled===false;
 const activeMode=source.status==="active"&&source.sync_enabled===true&&
  source.credential_status==="ready";
 if((!pausedMode&&!activeMode)||!controlsReady.ingestion)
  return reply({status:"ingestion_disabled_or_source_not_ready",private_only:true,no_publication:true});
 const accepted=new Set((programmes??[]).filter(p=>{
  const m=p.metadata&&typeof p.metadata==="object"&&!Array.isArray(p.metadata)
   ?p.metadata as Record<string,unknown>:{};
  const a=m.owner_joined_accepted_attestation;
  return a&&typeof a==="object"&&!Array.isArray(a)&&
   (a as Record<string,unknown>).membership_status==="accepted";
 }).map(p=>p.external_account_id));
 const now=Date.now(),freshCutoff=now-48*3600_000;
 const available=PAIRS.filter(pair=>{
  // Active-mode staged feeds must pass the same source/advertiser readiness
  // checks as the core importer; unlike old paused-only daily rotation.
  if(activeMode&&sourceIngestionFailures(source,{
   advertiserId:pair.advertiser,
   connectorConfigured:Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_DATAFEED_API_KEY)
  }).length)return false;
  if(!accepted.has(pair.advertiser))return false;
  const observed=(observations??[]).find(o=>
   o.advertiser_id===pair.advertiser&&o.feed_id===pair.feed&&
   o.feed_format.toLowerCase()===pair.kind.toLowerCase()&&
   Number(o.listed_products)>0&&Number(o.listed_products)<=5000);
  const checked=Date.parse(observed?.observed_at??"");
  return !!observed&&Number.isFinite(checked)&&checked>=freshCutoff&&checked<=now+300000;
 });
 if(!available.length)return reply({status:"no_current_supported_retail_feeds",
  private_only:true,no_publication:true,eligible:0});
 // Rotate across supported feeds, no client-controlled feed ID, URL or token.
 // Stable 20-minute rotation, not a once-per-day selection that starves
 // publishers during frequent cron runs. Offset is limited to owner diagnostics.
 const selected=available[(Math.floor(now/1_200_000)+offset)%available.length];
 const url=new URL("/api/internal/awin-auto-import",request.url);
 url.searchParams.set("mode","stage");
 url.searchParams.set("advertiser_id",selected.advertiser);
 url.searchParams.set("feed_id",selected.feed);
 const result=await runPrivateImport(new NextRequest(url,{
  method:"POST",headers:{authorization:`Bearer ${secret}`}
 }));
 let body:Record<string,unknown>={};
 try{const data=await result.json();if(data&&typeof data==="object"&&!Array.isArray(data))body=data;}catch{}
 const canonical=body.canonical&&typeof body.canonical==="object"&&!Array.isArray(body.canonical)
  ?body.canonical as Record<string,unknown>:{};
 const safeCount=(v:unknown)=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0&&v<=5000?v:0;
 const safeStatus=(v:unknown)=>typeof v==="string"&&/^[a-z_0-9]{1,80}$/.test(v)?v:"unavailable";
 // The importer uses fixed, internal failure messages. Return the structured
 // validation code, rather than the generic "unavailable" shown on HTTP 422.
 const importerReason=safeStatus(body.reason);
 const failureKind=safeStatus(body.failure_kind);
 const safeColumnNames=Array.isArray(body.column_names)?
  body.column_names.filter((v:unknown):v is string=>typeof v==="string"&&
   /^[A-Za-z][A-Za-z0-9_ -]{0,63}$/.test(v)).slice(0,60):[];
 const knownErrorCodes:Record<string,string>={
  "Feed preflight failed; nothing imported":"feed_preflight_failed",
  "Feed format not supported by pilot":"feed_format_unsupported",
  "Awin product download failed":"awin_product_download_failed",
  "Selected active feed missing or ambiguous":"feed_inventory_binding_missing",
  "Exact live feed recheck could not be recorded":"exact_live_recheck_failed",
  "Awin feed credentials not configured":"awin_feed_credentials_unavailable",
  "Advertiser not in canonical accepted membership registry":"accepted_membership_missing"
 };
 const safeError=typeof body.error==="string"?
  knownErrorCodes[body.error]??"import_validation_or_provider_failure":"unknown";
 return reply({status:result.ok?"private_rotation_checked":"private_rotation_failed",
  advertiser_id:selected.advertiser,feed_id:selected.feed,
  eligible:available.length,upstream_http_status:result.status,
  importer_status:safeStatus(body.status),importer_error:safeError,
  reason:importerReason,failure_kind:failureKind,
  diagnostic_stage:safeStatus(body.diagnostic_stage),
  detected_delimiter:safeStatus(body.detected_delimiter),
  parsed_rows:safeCount(body.parsed_rows),column_names:safeColumnNames,
  live_verified_rows:safeCount(body.live_verified_rows),
  canonical_status:safeStatus(canonical.status),
  canonical_accepted:safeCount(canonical.canonicalAccepted),
  private_only:true,no_publication:true,source_mode:activeMode?"active":"paused"},result.status);
}
