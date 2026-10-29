"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { generateMarketingCaption, generateMarketingImage, marketingAiAllowed, MAX_DAILY_AI_CALLS } from "../../../lib/marketing/creative";
import { listBufferChannels } from "../../../lib/marketing/buffer";
import { reviewDraft } from "../../../lib/marketing/policy";

const HOME="/control-centre/marketing";
const field=(f:FormData,k:string,max=500)=>String(f.get(k)??"").trim().slice(0,max);
function fail(message:string):never {throw new Error("Marketing: "+message)}
function next(tab:string,brand:string,notice:string):never {
 redirect(HOME+"?tab="+encodeURIComponent(tab)+"&brand="+encodeURIComponent(brand)+"&notice="+notice);
}
async function owner() {
 const session=await requireControlCentreAccess();
 if(session.role!=="owner") fail("Only the owner may use this control");
 return session.user;
}
async function brandCheck(f:FormData) {
 const brand=field(f,"brand",60);
 if(!["avuqo","fantasy-lockr","capshur","cluedoku"].includes(brand)) fail("Unknown brand");
 return brand;
}
async function aiPreflight(brand:string) {
 if(!marketingAiAllowed()) fail("AI must be enabled in the server environment first");
 const db=await createClient();
 const [sysResult,brandResult]=await Promise.all([
  db.from("marketing_system").select("ai_enabled").eq("singleton",true).maybeSingle(),
  db.from("marketing_brands").select("ai_enabled,monthly_ai_call_cap").eq("slug",brand).maybeSingle()
 ]);
 if(sysResult.error||brandResult.error||!sysResult.data?.ai_enabled||!brandResult.data?.ai_enabled) fail("AI creation is currently disabled");
 const today=new Date();const startDay=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate())).toISOString();
 const startMonth=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1)).toISOString();
 const [{count:daily,error:dailyErr},{count:monthly,error:monthlyErr}]=await Promise.all([
  db.from("marketing_ai_runs").select("*",{count:"exact",head:true}).eq("brand_slug",brand).gte("created_at",startDay),
  db.from("marketing_ai_runs").select("*",{count:"exact",head:true}).eq("brand_slug",brand).gte("created_at",startMonth)
 ]);
 if(dailyErr||monthlyErr) fail("Cannot validate AI usage caps");
 if((daily??0)>=MAX_DAILY_AI_CALLS || (monthly??0)>=brandResult.data.monthly_ai_call_cap) {
   fail("Daily or monthly AI usage limit reached");
 }
 return db;
}
async function factForBrand(brand:string,factId:string) {
 const db=await createClient();
 const [fr,br]=await Promise.all([
  db.from("marketing_facts").select("id,claim,status,expires_at,brand_slug")
    .eq("id",factId).eq("brand_slug",brand).eq("status","approved").maybeSingle(),
  db.from("marketing_brands").select("name,audience,tone").eq("slug",brand).maybeSingle()
 ]);
 if(fr.error||br.error||!fr.data||!br.data||
   (fr.data.expires_at&&Date.parse(fr.data.expires_at)<=Date.now())) fail("Select a current, approved fact");
 return {fact:fr.data,profile:br.data,db};
}
async function recordAi(brand:string,kind:"caption"|"image",userId:string,model:string,
 usage?:{input_tokens?:number;output_tokens?:number},status:"succeeded"|"failed"="succeeded") {
 const admin=createAdminClient();
 const {error}=await admin.from("marketing_ai_runs").insert({
  brand_slug:brand,kind,model,input_tokens:usage?.input_tokens??null,
  output_tokens:usage?.output_tokens??null,
  estimated_cost_pence:null,status,created_by:userId
 });
 if(error) throw error;
}
export async function createAIMarketingDraft(form:FormData) {
 const user=await owner();const brand=await brandCheck(form);
 const platform=field(form,"platform",30);
 if(!["facebook","instagram","website"].includes(platform)) fail("Invalid channel");
 const factId=field(form,"fact_id",100);
 await aiPreflight(brand);
 const {fact,profile,db}=await factForBrand(brand,factId);
 const model=process.env.MARKETING_TEXT_MODEL||"gpt-6-luna";
 // Never approve AI output automatically, regardless of semantic checks.
 const generated=await generateMarketingCaption({
  brand:profile.name,platform:platform as "facebook"|"instagram"|"website",
  audience:profile.audience,tone:profile.tone,fact:fact.claim
 });
 await recordAi(brand,"caption",user.id,model,generated.usage);
 const {error}=await db.from("marketing_posts").insert({
  brand_slug:brand,kind:platform==="website"?"website_article":"social",
  platform,caption:generated.text.slice(0,2500),source_fact_id:fact.id,
  status:"draft",ai_assisted:true,created_by:user.id
 });
 if(error) fail(error.message);
 revalidatePath(HOME);next(platform==="website"?"website":"studio",brand,"ai-draft");
}
export async function createAIMarketingImage(form:FormData) {
 const user=await owner();const brand=await brandCheck(form);
 await aiPreflight(brand);
 const factId=field(form,"fact_id",100);
 const visualStyle=field(form,"visual_style",250);
 const {fact,profile,db}=await factForBrand(brand,factId);
 const model=process.env.MARKETING_IMAGE_MODEL||"gpt-image-2.5-flare";
 const image=await generateMarketingImage({
  brand:profile.name,headline:fact.claim,visualStyle:visualStyle||profile.tone
 });
 await recordAi(brand,"image",user.id,model);
 const id=crypto.randomUUID();
 const storagePath=brand+"/"+id+".png";
 const admin=createAdminClient();
 const {error:uploadError}=await admin.storage.from("marketing-media")
  .upload(storagePath,image,{contentType:"image/png",upsert:false});
 if(uploadError) fail("Image storage failed");
 const {error}=await db.from("marketing_assets").insert({
  brand_slug:brand,storage_path:storagePath,
  alt_text:fact.claim.slice(0,300),description:visualStyle,
  source_type:"ai_generated",status:"draft",created_by:user.id
 });
 if(error) fail(error.message);
 revalidatePath(HOME);next("media",brand,"image-draft");
}
export async function uploadMarketingImage(form:FormData) {
 const user=await owner();const brand=await brandCheck(form);
 const file=form.get("image");
 if(!(file instanceof File) || file.size<100 || file.size>5_000_000 ||
  !["image/png","image/jpeg"].includes(file.type)) fail("Use a PNG/JPEG below 5MB");
 const alt=field(form,"alt_text",300);
 if(alt.length<5) fail("Add meaningful alternative text");
 const ext=file.type==="image/png"?"png":"jpg";
 const path=brand+"/"+crypto.randomUUID()+"."+ext;
 const admin=createAdminClient();
 const {error:uploadError}=await admin.storage.from("marketing-media")
  .upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,upsert:false});
 if(uploadError) fail("Image upload failed");
 const db=await createClient();
 const {error}=await db.from("marketing_assets").insert({
  brand_slug:brand,storage_path:path,media_type:file.type,
  alt_text:alt,source_type:"owner_approved",created_by:user.id,status:"draft"
 });
 if(error) fail(error.message);
 revalidatePath(HOME);next("media",brand,"image-draft");
}
export async function approveMarketingImage(form:FormData) {
 const user=await owner();const brand=await brandCheck(form);
 const rights=field(form,"rights_note",400);
 if(rights.length<8) fail("Record the image licence or owner permission");
 const id=field(form,"asset_id",100);
 const db=await createClient();
 const {data:asset,error}=await db.from("marketing_assets").select("id,storage_path,media_type,status")
  .eq("id",id).eq("brand_slug",brand).eq("status","draft").maybeSingle();
 if(error||!asset) fail("Unapproved asset not found");
 const admin=createAdminClient();
 const download=await admin.storage.from("marketing-media").download(asset.storage_path);
 if(download.error||!download.data) fail("Private asset unavailable");
 // Only explicitly approved media is copied to the public hosting bucket.
 const uploaded=await admin.storage.from("marketing-media-approved")
  .upload(asset.storage_path,await download.data.arrayBuffer(),{
    contentType:asset.media_type,upsert:false
  });
 if(uploaded.error) fail("Could not make approved asset available");
 const publicUrl=admin.storage.from("marketing-media-approved").getPublicUrl(asset.storage_path).data.publicUrl;
 const {data, error:updateError}=await db.from("marketing_assets").update({
   status:"approved",rights_note:rights,approved_by:user.id,
   approved_at:new Date().toISOString(),public_url:publicUrl
 }).eq("id",id).eq("brand_slug",brand).eq("status","draft").select("id");
 if(updateError||!data?.length) fail("Media approval could not be saved");
 revalidatePath(HOME);next("media",brand,"image-approved");
}
export async function attachMarketingImage(form:FormData) {
 await owner();const brand=await brandCheck(form);
 const postId=field(form,"post_id",100);const assetId=field(form,"asset_id",100);
 const db=await createClient();
 const {data:asset}=await db.from("marketing_assets").select("id")
  .eq("id",assetId).eq("brand_slug",brand).eq("status","approved").maybeSingle();
 if(!asset) fail("Approved media required");
 const {data,error}=await db.from("marketing_posts").update({asset_id:assetId})
  .eq("id",postId).eq("brand_slug",brand).eq("status","draft").select("id");
 if(error||!data?.length) fail("Only social drafts can be updated");
 revalidatePath(HOME);next("studio",brand,"image-attached");
}
export async function verifyMarketingBufferChannel(form:FormData) {
 await owner();const brand=await brandCheck(form);
 if(process.env.MARKETING_CONNECT_PROVIDERS!=="YES") fail("Provider verification is disabled");
 const id=field(form,"channel_id",100);
 const mappedId=field(form,"buffer_channel_id",200);
 const db=await createClient();
 const {data:channel,error}=await db.from("marketing_channels")
  .select("id,platform,handle,connection_state").eq("id",id).eq("brand_slug",brand).maybeSingle();
 if(error||!channel||channel.connection_state!=="unconnected") fail("Channel must be unconnected");
 const available=await listBufferChannels();
 const selected=available.find(c=>c.id===mappedId);
 if(!selected || selected.service!==channel.platform ||
  selected.name.trim().toLowerCase()!==channel.handle.trim().toLowerCase()) {
   fail("Buffer channel must match its recorded account and platform");
 }
 const {data,error:updateErr}=await db.from("marketing_channels").update({
   buffer_channel_id:selected.id,connection_state:"verified",
   last_verified_at:new Date().toISOString(),publishing_enabled:false
 }).eq("id",id).eq("brand_slug",brand).select("id");
 if(updateErr||!data?.length) fail("Channel verification failed");
 revalidatePath(HOME);next("channels",brand,"channel-verified");
}
export async function setMarketingSwitch(form:FormData) {
 await owner();const brand=await brandCheck(form);
 const scope=field(form,"scope",30),turnOn=field(form,"enabled",5)==="true";
 const db=await createClient();
 if(turnOn && process.env.MARKETING_LIVE_PUBLISH!=="YES" && scope!=="ai") fail("Live publishing must first be explicitly enabled in server configuration");
 if(scope==="global") {
  const {error}=await db.from("marketing_system").update({
    publishing_enabled:turnOn,emergency_stop:!turnOn,updated_at:new Date().toISOString()
  }).eq("singleton",true);
  if(error) fail(error.message);
 } else if(scope==="brand") {
  const {error}=await db.from("marketing_brands").update({publishing_enabled:turnOn})
   .eq("slug",brand);
  if(error) fail(error.message);
 } else if(scope==="channel") {
  const id=field(form,"channel_id",100);
  const {data:channel}=await db.from("marketing_channels").select("connection_state")
    .eq("id",id).eq("brand_slug",brand).maybeSingle();
  if(turnOn&&channel?.connection_state!=="verified") fail("Verify the channel first");
  const {error}=await db.from("marketing_channels").update({publishing_enabled:turnOn})
   .eq("id",id).eq("brand_slug",brand);
  if(error) fail(error.message);
 } else if(scope==="ai") {
  if(turnOn&&!marketingAiAllowed()) fail("Set the AI server configuration before enabling AI");
  const {error}=await db.from("marketing_system").update({ai_enabled:turnOn})
    .eq("singleton",true);
  if(error) fail(error.message);
  const {error:brandError}=await db.from("marketing_brands").update({ai_enabled:turnOn})
    .eq("slug",brand);
  if(brandError) fail(brandError.message);
 } else fail("Unknown control");
 revalidatePath(HOME);next("automation",brand,"switch-saved");
}
export async function queueMarketingPost(form:FormData) {
 const user=await owner();const brand=await brandCheck(form);
 const postId=field(form,"post_id",100);
 const channelId=field(form,"channel_id",100);
 const when=field(form,"due_at",35);
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)) fail("Enter a valid UTC date/time");
 const dueAt=new Date(when+"Z");
 if(!Number.isFinite(dueAt.getTime())||dueAt.getTime()<Date.now()+20*60000
   ||dueAt.getTime()>Date.now()+14*86400000) fail("Choose a UTC time 20 minutes to 14 days from now");
 const db=await createClient();
 const [postResult,channelResult,brandResult,sysResult]=await Promise.all([
  db.from("marketing_posts").select("*").eq("id",postId).eq("brand_slug",brand).maybeSingle(),
  db.from("marketing_channels").select("*").eq("id",channelId).eq("brand_slug",brand).maybeSingle(),
  db.from("marketing_brands").select("publishing_enabled,weekly_post_cap").eq("slug",brand).maybeSingle(),
  db.from("marketing_system").select("publishing_enabled,emergency_stop").eq("singleton",true).maybeSingle()
 ]);
 const post=postResult.data,channel=channelResult.data,br=brandResult.data,sys=sysResult.data;
 if(!post||!channel||!br||!sys || post.status!=="approved"||post.kind!=="social"||
  post.platform!==channel.platform) fail("Approved content must match this brand and channel");
 if(!sys.publishing_enabled||sys.emergency_stop||!br.publishing_enabled||
  !channel.publishing_enabled||channel.connection_state!=="verified"||
  process.env.MARKETING_LIVE_PUBLISH!=="YES") fail("Publishing controls are not all enabled");
 const {data:fact}=await db.from("marketing_facts").select("id,brand_slug,claim,status,expires_at")
  .eq("id",post.source_fact_id??"").maybeSingle();
 const {data:recent,error:recentError}=await db.from("marketing_posts").select("caption")
  .eq("brand_slug",brand).neq("id",post.id)
  .gte("created_at",new Date(Date.now()-28*86400000).toISOString()).limit(300);
 if(recentError) fail("Unable to verify duplicates");
 const check=reviewDraft(post,fact,(recent??[]).map(row=>row.caption));
 if(!check.ok) fail(check.reasons.join("; "));
 if(post.platform==="instagram") {
  const {data:asset}=await db.from("marketing_assets").select("status,public_url,brand_slug")
    .eq("id",post.asset_id??"").eq("brand_slug",brand).maybeSingle();
  if(!asset||asset.status!=="approved"||!asset.public_url) fail("Approved public image required for Instagram");
 }
 const start=new Date(Date.now()-7*86400000).toISOString();
 const {count}=await db.from("marketing_publication_jobs").select("*",{count:"exact",head:true})
  .eq("brand_slug",brand).in("state",["queued","dispatching","scheduled","published"])
  .gte("created_at",start);
 if((count??0)>=br.weekly_post_cap) fail("Brand's weekly cap has been reached");
 const {error}=await db.from("marketing_publication_jobs").insert({
  post_id:postId,channel_id:channelId,brand_slug:brand,
  due_at:dueAt.toISOString(),state:"queued",created_by:user.id
 });
 if(error) fail(error.message);
 revalidatePath(HOME);next("queue",brand,"post-queued");
}
