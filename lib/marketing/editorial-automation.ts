/** Owner-controlled, scheduled editorial generation. This NEVER publishes or sends content. */
import {createAdminClient} from "../supabase/admin";
import {evergreenCaption,normaliseCaption,reviewDraft} from "./policy";
import {nextEditorialRun} from "./editorial-automation-policy";

export async function runEditorialDraftAutomation() {
 if(process.env.MARKETING_AUTOMATION_DRAFTS!=="YES") return {enabled:false,drafts:0};
 const db=createAdminClient();
 const {data:rules,error}=await db.from("marketing_automation_rules")
  .select("id,brand_slug,platform,cadence_days,next_run_at,created_by")
  .eq("enabled",true).lte("next_run_at",new Date().toISOString())
  .order("next_run_at",{ascending:true}).limit(8);
 if(error)throw error;
 let drafts=0;let skipped=0;
 for(const rule of rules??[]) {
  const newNext=nextEditorialRun(new Date(),rule.cadence_days);
  const {data:claimed,error:claimError}=await db.from("marketing_automation_rules")
   .update({next_run_at:newNext,last_run_at:new Date().toISOString(),last_error:null})
   .eq("id",rule.id).eq("enabled",true).eq("next_run_at",rule.next_run_at).select("id");
  if(claimError)throw claimError;
  if(!claimed?.length)continue;
  try {
   if(!rule.created_by)throw Error("Owner identity missing");
   const [factsR,brandR,recentR]=await Promise.all([
    db.from("marketing_facts").select("id,claim,status,expires_at,brand_slug")
     .eq("brand_slug",rule.brand_slug).eq("status","approved")
     .order("approved_at",{ascending:true}).limit(150),
    db.from("marketing_brands").select("name,weekly_post_cap")
     .eq("slug",rule.brand_slug).maybeSingle(),
    db.from("marketing_posts").select("caption,id,created_at").eq("brand_slug",rule.brand_slug)
     .gte("created_at",new Date(Date.now()-28*86400000).toISOString()).limit(500)
   ]);
   if(factsR.error||brandR.error||recentR.error||!brandR.data)throw Error("Cannot verify brand data");
   const posts=recentR.data??[];
   const active=posts.filter(p=>Date.parse(p.created_at)>=Date.now()-7*86400000).length;
   if(active>=brandR.data.weekly_post_cap)throw Error("Weekly editorial cap reached");
   const known=posts.map(p=>p.caption);
   let chosen:{id:string;caption:string}|null=null;
   for(const fact of factsR.data??[]) {
    if(fact.expires_at&&Date.parse(fact.expires_at)<=Date.now())continue;
    const caption=evergreenCaption(fact,brandR.data.name);
    if(known.some(c=>normaliseCaption(c)===normaliseCaption(caption)))continue;
    if(!reviewDraft({brand_slug:rule.brand_slug,platform:rule.platform,kind:"social",
     caption,source_fact_id:fact.id},fact,known).ok)continue;
    chosen={id:fact.id,caption};break;
   }
   if(!chosen)throw Error("No fresh, approved evergreen content is available");
   const {error:insertError}=await db.from("marketing_posts").insert({
    brand_slug:rule.brand_slug,platform:rule.platform,kind:"social",
    source_fact_id:chosen.id,caption:chosen.caption,
    status:"draft",created_by:rule.created_by,
    planned_date:new Date(Date.now()+86400000).toISOString().slice(0,10)
   });
   if(insertError)throw insertError;
   drafts++;
  }catch(error) {
   skipped++;
   await db.from("marketing_automation_rules").update({
    last_error:(error instanceof Error?error.message:"Editorial draft failed").slice(0,280)
   }).eq("id",rule.id);
  }
 }
 return {enabled:true,drafts,skipped};
}
