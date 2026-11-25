import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {recoverPneusSnapshot,recoveryResponse} from "../../../../lib/awin/pneus-snapshot-recovery";
export const maxDuration=300;
const outcomes=new Set(["exact_normalized_parity","normalized_parity_mismatch","source_rights_or_controls_blocked","completed_snapshot_unavailable","journal_binding_mismatch","archive_unavailable_or_size_limit","parity_time_limit","legacy_page_incomplete","legacy_count_changed","recovery_unavailable"]);
const bounded=(v:unknown,min:number,max:number)=>typeof v==="number"&&Number.isInteger(v)&&v>=min&&v<=max?v:null;
/** One automatic aggregate audit per UTC day. Insert-first unique daily claim. */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!=="Bearer "+secret)
  return recoveryResponse({status:"unauthorized"},401);
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")return recoveryResponse({status:"disabled"});
 const db=createAdminClient(),day=new Date().toISOString().slice(0,10);
 const {error:claimError}=await db.from("awin_pneus_archive_audits").insert({audit_day:day});
 if(claimError)return recoveryResponse({status:claimError.code==="23505"?"already_audited_or_running":"audit_register_unavailable"},claimError.code==="23505"?200:503);
 const result=await recoverPneusSnapshot("latest");
 const body=await result.clone().json();
 const outcome=typeof body.status==="string"&&outcomes.has(body.status)?body.status:"unexpected_result";
 const observed=typeof body.observed_at==="string"&&Number.isFinite(Date.parse(body.observed_at))?body.observed_at:null;
 const {data:finished,error:finishError}=await db.from("awin_pneus_archive_audits").update({
  finished_at:new Date().toISOString(),outcome,observed_at:observed,
  archive_digest_verified:body.archive_digest_verified===true,
  archive_rows:bounded(body.archive_rows,1,25000),checked:bounded(body.checked,0,25000),
  matched:bounded(body.matched,0,25000),mismatched:bounded(body.mismatched,0,25000),
  compressed_bytes:bounded(body.compressed_bytes,2,37748736)
 }).eq("audit_day",day).eq("outcome","started").select("audit_day").maybeSingle();
 if(finishError||!finished)return NextResponse.json({status:"audit_register_completion_unavailable",private_only:true,no_publication:true,no_catalogue_writes:true},{status:503,headers:{"Cache-Control":"private,no-store"}});
 const diagnostic={...body,no_database_writes:false,no_catalogue_writes:true,audit_recorded:true};
 console.info("pneus_archive_recovery_audit",JSON.stringify(diagnostic));
 return NextResponse.json(diagnostic,{status:result.status,headers:{"Cache-Control":"private,no-store"}});
}
