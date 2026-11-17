import {NextResponse} from "next/server";
import {createAdminClient} from "../supabase/admin";
import {safePrivateCronOutcome} from "./private-cron-outcome";

export type PrivateCronJob=
 "pilot_petlibro"|"pilot_mozillion"|"pilot_cadbury"|"pilot_craftbuddy"|
 "tooled_up_snapshot"|"tooled_up_validation"|"tooled_up_cohort"|"tyres_uk_recheck";

const problem=(message:string)=>NextResponse.json({error:message,private_only:true},{
 status:503,headers:{"Cache-Control":"private, no-store"}
});

/**
 * Journal only server-authenticated, fixed private feed cron jobs.
 * Start is committed BEFORE the supplier request; unfinished entries reveal
 * interruptions/timeouts. No raw bodies or external URL data are stored.
 * Fail closed if the audit is unavailable, rather than silently importing.
 */
export async function recordPrivateCronAttempt(
 job:PrivateCronJob,
 task:()=>Promise<Response>
):Promise<Response>{
 const db=createAdminClient();
 const start=Date.now();
 const {data:attempt,error:insertError}=await db.from("awin_private_cron_attempts")
  .insert({job_key:job,state:"started"}).select("id").single();
 if(insertError||!attempt?.id)return problem("Private cron attempt journal unavailable");
 const attemptId=attempt.id;

 async function finish(state:"completed"|"disabled"|"rejected"|"exception",code:string,httpStatus:number){
  const {error}=await db.from("awin_private_cron_attempts")
   .update({
    state,outcome_code:code,http_status:httpStatus,
    duration_ms:Math.min(3600000,Math.max(0,Date.now()-start)),
    finished_at:new Date().toISOString()
   }).eq("id",attemptId).eq("state","started");
  return !error;
 }
 let response:Response;
 try{
  response=await task();
 }catch{
  if(!(await finish("exception","unhandled_exception",503)))
   return problem("Private cron audit completion unavailable");
  return problem("Private cron execution rejected");
 }
 let body:unknown=null;
 try{body=await response.clone().json();}catch{}
 const classification=safePrivateCronOutcome(response.status,body);
 if(!(await finish(classification.state,classification.code,response.status)))
  return problem("Private cron audit completion unavailable");
 return response;
}
