import { createAdminClient } from "../supabase/admin";
import { getBufferPost, scheduleBufferPost } from "./buffer";
import { publishingGate, stateAfterBuffer } from "./gates";
import { normaliseCaption } from "./policy";

function enabled() {
  return process.env.MARKETING_LIVE_PUBLISH === "YES" &&
    process.env.MARKETING_WORKER_ENABLED === "YES";
}
async function systemReady() {
  const db=createAdminClient();
  const {data,error}=await db.from("marketing_system").select("publishing_enabled,emergency_stop")
    .eq("singleton",true).maybeSingle();
  if(error) throw error;
  return !!data?.publishing_enabled && !data.emergency_stop;
}

async function validateJob(id:string) {
  const db=createAdminClient();
  const {data:job,error}=await db.from("marketing_publication_jobs").select("*").eq("id",id).maybeSingle();
  if(error||!job) throw new Error("Missing publication job");
  const [postR,channelR,brandR,systemR]=await Promise.all([
    db.from("marketing_posts").select("*").eq("id",job.post_id).maybeSingle(),
    db.from("marketing_channels").select("*").eq("id",job.channel_id).maybeSingle(),
    db.from("marketing_brands").select("*").eq("slug",job.brand_slug).maybeSingle(),
    db.from("marketing_system").select("*").eq("singleton",true).maybeSingle()
  ]);
  if([postR,channelR,brandR,systemR].some(r=>r.error)) throw new Error("Cannot verify marketing policy state");
  const post=postR.data,channel=channelR.data,brand=brandR.data,settings=systemR.data;
  if(!post||!channel||!brand||!settings) throw new Error("Missing ownership or publishing policy");
  const {data:fact,error:factError}=await db.from("marketing_facts")
    .select("id,brand_slug,status,expires_at").eq("id",post.source_fact_id??"").maybeSingle();
  if(factError) throw factError;
  const {data:asset,error:assetError}=post.asset_id?
    await db.from("marketing_assets").select("brand_slug,status,public_url")
      .eq("id",post.asset_id).maybeSingle():{data:null,error:null};
  if(assetError) throw assetError;
  const start=new Date(Date.now()-7*86400000).toISOString();
  const {count,error:countError}=await db.from("marketing_publication_jobs")
    .select("*",{count:"exact",head:true}).eq("brand_slug",job.brand_slug)
    .in("state",["scheduled","published"]).gte("created_at",start);
  if(countError) throw countError;
  const {data:recent,error:recentError}=await db.from("marketing_posts")
    .select("caption,id").eq("brand_slug",job.brand_slug)
    .gte("created_at",new Date(Date.now()-28*86400000).toISOString()).limit(300);
  if(recentError) throw recentError;
  const duplicate=(recent??[]).some(p=>p.id!==post.id &&
    normaliseCaption(p.caption)===normaliseCaption(post.caption));
  const state=publishingGate({
    globalEnabled:settings.publishing_enabled&&!settings.emergency_stop,
    brandEnabled:brand.publishing_enabled,
    channelEnabled:channel.publishing_enabled,
    channelVerified:channel.connection_state==="verified" && !!channel.buffer_channel_id,
    approved:post.status==="approved" && post.kind==="social",
    factApproved:fact?.status==="approved",
    factCurrent:!!fact && (!fact.expires_at||Date.parse(fact.expires_at)>Date.now()),
    brandMatches:post.brand_slug===job.brand_slug && fact?.brand_slug===job.brand_slug &&
      (!asset||asset.brand_slug===job.brand_slug),
    channelMatches:channel.brand_slug===job.brand_slug && channel.platform===post.platform,
    platform:post.platform,hasApprovedImage:asset?.status==="approved"&&!!asset.public_url,
    withinCap:(count??0)<brand.weekly_post_cap,duplicate,dueAt:job.due_at
  },process.env.MARKETING_LIVE_PUBLISH);
  return {job,post,channel,asset,gate:state};
}
export async function runMarketingWorker() {
  if(!enabled()) return {ok:true,skipped:"Worker disabled in environment"};
  if(!(await systemReady())) return {ok:true,skipped:"Global stop or publishing disabled"};
  const db=createAdminClient();
  const {data:jobs,error}=await db.from("marketing_publication_jobs")
    .select("id,state,due_at").eq("state","queued")
    .gt("due_at",new Date(Date.now()+15*60000).toISOString())
    .lt("due_at",new Date(Date.now()+14*86400000).toISOString())
    .order("due_at",{ascending:true}).limit(5);
  if(error) throw error;
  let queued=0,blocked=0,uncertain=0;
  for(const candidate of jobs??[]) {
    const verified=await validateJob(candidate.id);
    if(!verified.gate.ok) {
      await db.from("marketing_publication_jobs")
        .update({state:"blocked",last_error:verified.gate.reasons.join("; ").slice(0,800)})
        .eq("id",candidate.id).eq("state","queued");
      blocked++;continue;
    }
    // Atomic claim: only one concurrent worker can transition queued -> dispatching.
    const {data:claimed,error:claimError}=await db.from("marketing_publication_jobs")
      .update({state:"dispatching",dispatch_started_at:new Date().toISOString(),
        attempt_count:verified.job.attempt_count+1,last_error:null})
      .eq("id",candidate.id).eq("state","queued").select("id");
    if(claimError) throw claimError;
    if(!claimed?.length) continue;
    try {
      // Recheck kill switch as close to provider call as possible.
      if(!(await systemReady()) || !enabled()) throw new Error("Publishing stopped before dispatch");
      const ack=await scheduleBufferPost({
        text:verified.post.caption,channelId:verified.channel.buffer_channel_id,
        dueAt:verified.job.due_at,imageUrl:verified.asset?.public_url||undefined,
        aiAssisted:verified.post.ai_assisted
      });
      await db.from("marketing_publication_jobs")
        .update({state:"scheduled",provider_post_id:ack.id,updated_at:new Date().toISOString()})
        .eq("id",candidate.id).eq("state","dispatching");
      queued++;
    } catch (e) {
      // Unknown network outcome: NEVER blindly retry. A provider may have accepted it.
      await db.from("marketing_publication_jobs")
        .update({state:"needs_reconciliation",
          last_error:String(e instanceof Error?e.message:e).slice(0,800)})
        .eq("id",candidate.id).eq("state","dispatching");
      uncertain++;
    }
  }
  return {ok:true,queued,blocked,uncertain};
}

export async function reconcileMarketingWorker() {
  if(!enabled()) return {ok:true,skipped:"Worker disabled in environment"};
  if(!(await systemReady())) return {ok:true,skipped:"Global stop or publishing disabled"};
  const db=createAdminClient();
  const {data:jobs,error}=await db.from("marketing_publication_jobs")
    .select("id,provider_post_id,state,due_at,channel_id")
    .in("state",["scheduled","needs_reconciliation"])
    .not("provider_post_id","is",null)
    .lt("due_at",new Date(Date.now()+3600000).toISOString())
    .order("due_at",{ascending:true}).limit(15);
  if(error) throw error;
  let checked=0;
  for(const job of jobs??[]) {
    try {
      const result=await getBufferPost(job.provider_post_id);
      const {data:channel}=await db.from("marketing_channels").select("buffer_channel_id")
        .eq("id",job.channel_id).maybeSingle();
      if(!channel||result.channelId!==channel.buffer_channel_id) throw new Error("Provider channel mismatch");
      const next=stateAfterBuffer(result.status);
      const update:Record<string,unknown>={
        state:next,last_checked_at:new Date().toISOString(),
        provider_metrics:result.metrics??null,
        metrics_updated_at:result.metricsUpdatedAt??null,
        last_error:null
      };
      if(next==="published") update.published_at=new Date().toISOString();
      await db.from("marketing_publication_jobs").update(update).eq("id",job.id)
        .in("state",["scheduled","needs_reconciliation"]);
      checked++;
    } catch {
      await db.from("marketing_publication_jobs").update({
        state:"needs_reconciliation",last_checked_at:new Date().toISOString(),
        last_error:"Provider status could not be confirmed; manual review required"
      }).eq("id",job.id).in("state",["scheduled","needs_reconciliation"]);
    }
  }
  return {ok:true,checked};
}
