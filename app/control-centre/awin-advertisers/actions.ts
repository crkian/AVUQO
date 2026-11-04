"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {awinConnector} from "../../../lib/connectors/awin";
import {sourceEvidenceFailures,evaluateSourceControls} from "../../../lib/pipeline/source-readiness";
import {
 UUID,advertiserIdValid,nameValid,evidenceRef,validFuture,
 advertisersFromMetadata,releaseIssues
} from "../../../lib/awin/advertiser-onboarding";

const page="/control-centre/awin-advertisers";
const stamp=()=>new Date().toISOString();
const asRecord=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
const refresh=()=>{for(const path of [page,"/control-centre/source-readiness","/control-centre/sources","/control-centre/pipeline","/products","/live"])revalidatePath(path);};
async function owner() {
 const actor=await requireControlCentreAccess();
 if(actor.role!=="owner")throw Error("Only the AVUQO owner may approve Awin advertisers and release offers");
 return actor.user;
}
async function awin() {
 const db=createAdminClient();
 const {data,error}=await db.from("sources")
  .select("id,status,sync_enabled,credential_status,source_type,connector_key,metadata")
  .eq("connector_key","awin").single();
 if(error||!data)throw Error("Awin source is not registered");
 return {db,source:data};
}
function configured(){return Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_ADVERTISER_ID&&process.env.AWIN_ACCESS_TOKEN);}
const envAdvertiser=()=>process.env.AWIN_ADVERTISER_ID;
async function controls(db:ReturnType<typeof createAdminClient>){
 const {data,error}=await db.from("system_controls").select("control_key,enabled")
  .in("control_key",["global_emergency_stop","source_ingestion","deal_publishing"]);
 return evaluateSourceControls(data,!!error);
}
async function evidenceAndOffer(db:ReturnType<typeof createAdminClient>, sourceId:string,offerId:string) {
 const {data:offer,error}=await db.from("offers")
  .select("id,source_id,product_id,merchant_id,status,price,currency,affiliate_url,source_url,stock_status,last_seen_at,match_confidence")
  .eq("id",offerId).eq("source_id",sourceId).single();
 if(error||!offer)throw Error("Selected Awin offer does not exist");
 const [{data:product},{data:merchant},{data:score},{data:staging}]=await Promise.all([
  db.from("products").select("id,slug,status").eq("id",offer.product_id).single(),
  db.from("merchants").select("id,metadata").eq("id",offer.merchant_id).single(),
  db.from("deal_scores").select("score,confidence,calculated_at").eq("offer_id",offer.id).single(),
  db.from("published_deals").select("offer_id,status").eq("offer_id",offer.id).single(),
 ]);
 if(!product||!merchant||!score||!staging)throw Error("Canonical product, scoring or staged release missing");
 return {offer,product,score,staging,merchantExternalId:String(asRecord(merchant.metadata).external_id??"")};
}

export async function registerAwinAdvertiser(form:FormData){
 const user=await owner();
 const id=String(form.get("advertiser_id")??"").trim();
 const name=String(form.get("advertiser_name")??"").trim();
 if(!advertiserIdValid(id)||!nameValid(name))throw Error("Enter the numeric Awin advertiser ID and official programme name");
 const {db,source}=await awin();
 const old=asRecord(source.metadata),entries=advertisersFromMetadata(old);
 if(entries.some(x=>x.advertiser_id===id))throw Error("This advertiser is already registered");
 // Switching an advertiser must never carry over approvals or enable ingestion.
 const next={
   ...old, awin_advertisers:[...entries,{
    advertiser_id:id,advertiser_name:name,feed_permission_confirmed:false,
    approval_evidence_ref:"",allowed_territory:"GB",valid_until:"",
    registered_by:user.id,registered_at:stamp(),
   }],
   publication_permission:"pending",price_evidence_status:"pending",
   manual_release_required:true,
 };
 const {error}=await db.from("sources").update({
   metadata:next,status:"paused",sync_enabled:false,credential_status:"not_configured",
   health_status:"unknown",updated_at:stamp(),
 }).eq("id",source.id);
 if(error)throw Error("Could not save the paused advertiser draft");
 refresh();
 redirect(page+"?event=registered");
}

export async function attestAwinAdvertiserRights(form:FormData){
 const user=await owner();
 const id=String(form.get("advertiser_id")??"").trim();
 const networkEvidence=String(form.get("network_rights_evidence")??"").trim();
 const feedEvidence=String(form.get("feed_rights_evidence")??"").trim();
 const advertiserEvidence=String(form.get("advertiser_approval_evidence")??"").trim();
 const validUntil=String(form.get("rights_valid_until")??"").trim();
 const advertiserUntil=String(form.get("advertiser_valid_until")??"").trim();
 const imageAllowed=form.get("image_rights")==="yes";
 if(form.get("confirmed")!=="yes"||!advertiserIdValid(id)||
    !evidenceRef(networkEvidence)||!evidenceRef(feedEvidence)||!evidenceRef(advertiserEvidence)||
    !validFuture(validUntil)||!validFuture(advertiserUntil))
   throw Error("Owner confirmation and current permission references with future expiry dates are required; do not paste tokens");
 const {db,source}=await awin(),metadata=asRecord(source.metadata);
 const entries=advertisersFromMetadata(metadata),entry=entries.find(x=>x.advertiser_id===id);
 if(!entry)throw Error("Register this advertiser as a paused draft first");
 if(envAdvertiser()!==id)throw Error("The environment's AWIN_ADVERTISER_ID must match the exact advertiser being approved");
 const changed=entries.map(x=>x.advertiser_id===id?{
   ...x,feed_permission_confirmed:true,approval_evidence_ref:advertiserEvidence,
   allowed_territory:"GB",valid_until:advertiserUntil,
   approved_by:user.id,approved_at:stamp(),
 }:x);
 const next={
  ...metadata,awin_advertisers:changed,
  usage_rights_confirmed:true,rights_evidence_ref:networkEvidence,
  feed_permission_confirmed:true,feed_evidence_ref:feedEvidence,
  allowed_territories:["GB"],rights_valid_until:validUntil,
  image_rights_confirmed:imageAllowed,
  publication_permission:"pending",price_evidence_status:"pending",
  manual_release_required:true,recorded_by:user.id,recorded_at:stamp(),
 };
 const {error}=await db.from("sources").update({
   metadata:next,status:"paused",sync_enabled:false,credential_status:"not_configured",
   health_status:"unknown",updated_at:stamp()
 }).eq("id",source.id);
 if(error)throw Error("Could not store the permission evidence");
 refresh();
 redirect(page+"?event=rights");
}

/** Read-only provider test; returns no product records and never changes publication. */
export async function testAwinFeedConnection(){
 await owner();
 const {db,source}=await awin();
 if(!configured())throw Error("Publisher ID, advertiser ID and private token must be present in Vercel");
 const failures=sourceEvidenceFailures({...source,credential_status:"ready"},{
  advertiserId:envAdvertiser(),connectorConfigured:true
 });
 if(failures.length)throw Error("Awin rights must be recorded before a provider API test: "+failures.join("; "));
 let verified=false;
 try{
  const sample=await awinConnector.fetchOffers({limit:3});
  if(!sample.length||sample.some(x=>x.merchantExternalId!==envAdvertiser()))throw Error("Feed had no matching advertiser offers");
  verified=true;
 }catch{
  // Failure is never evidence of valid credentials; don't expose API response bodies.
  await db.from("sources").update({credential_status:"not_configured",health_status:"error",updated_at:stamp()}).eq("id",source.id);
 }
 if(!verified){refresh();redirect(page+"?event=probe-failed");}
 const {error}=await db.from("sources").update({
  credential_status:"ready",health_status:"healthy",
  metadata:{...asRecord(source.metadata),api_tested_at:stamp()},
  status:"paused",sync_enabled:false,updated_at:stamp(),
 }).eq("id",source.id);
 if(error)throw Error("Could not record successful provider connectivity");
 refresh();
 redirect(page+"?event=connected");
}

/** Owner attests the selected, already imported GBP offer has fresh price evidence. */
export async function approveAwinPriceEvidence(form:FormData){
 const user=await owner();
 const offerId=String(form.get("offer_id")??"").trim();
 const ref=String(form.get("price_evidence_ref")??"").trim();
 if(!UUID.test(offerId)||!evidenceRef(ref)||form.get("confirmed")!=="yes")
  throw Error("Choose a current staged offer and document the checked price evidence");
 const {db,source}=await awin();
 const failures=sourceEvidenceFailures(source,{advertiserId:envAdvertiser(),connectorConfigured:configured()});
 if(failures.length||source.status!=="active"||source.sync_enabled!==true)throw Error("Awin must be permitted and running before price approval");
 const {data:run}=await db.from("source_sync_runs")
   .select("id,status,records_accepted,started_at").eq("source_id",source.id)
   .eq("status","completed").gt("records_accepted",0).order("started_at",{ascending:false}).limit(1).maybeSingle();
 if(!run||!run.started_at||Date.now()-Date.parse(run.started_at)>48*3600000)
  throw Error("A successful, recent Awin feed run is required");
 const sample=await evidenceAndOffer(db,source.id,offerId);
 const m=asRecord(source.metadata);
 const issues=releaseIssues({source:{...source,metadata:{...m,publication_permission:"verified",price_evidence_status:"verified"}},
  advertiserId:envAdvertiser(),envConfigured:configured(),controls:await controls(db),
  offer:{...sample.offer,merchantExternalId:sample.merchantExternalId},
  product:sample.product,score:sample.score});
 if(issues.length)throw Error("Price evidence sample not eligible: "+issues.join("; "));
 const {error}=await db.from("sources").update({
  metadata:{...m,publication_permission:"verified",price_evidence_status:"verified",
   publication_evidence_ref:ref,price_approved_by:user.id,price_approved_at:stamp(),
   manual_release_required:true},updated_at:stamp(),
 }).eq("id",source.id);
 if(error)throw Error("Could not record reviewed pricing evidence");
 refresh();
 redirect(page+"?event=pricing");
}

export async function setAwinOfferRelease(form:FormData){
 const user=await owner();
 const id=String(form.get("offer_id")??"");
 const decision=String(form.get("decision")??"");
 const note=String(form.get("review_note")??"").trim();
 if(!UUID.test(id)||!["approved","paused"].includes(decision)||note.length>300)
  throw Error("Invalid owner release decision");
 const {db,source}=await awin();
 const info=await evidenceAndOffer(db,source.id,id);
 const externalId=envAdvertiser();
 if(decision==="approved"){
  if(form.get("confirmed")!=="yes")throw Error("Confirm the merchant, price, score and destination before publishing");
  const issues=releaseIssues({
   source,advertiserId:externalId,envConfigured:configured(),
   controls:await controls(db),
   offer:{...info.offer,merchantExternalId:info.merchantExternalId},
   product:info.product,score:info.score
  });
  if(issues.length||info.staging.status!=="held")
   throw Error("Offer cannot be released: "+(issues.join("; ")||"it must be held for manual review"));
 }
 if(!advertiserIdValid(externalId))throw Error("Awin advertiser is not configured");
 const {error}=await db.rpc("record_awin_owner_release",{
  p_offer_id:id,p_source_id:source.id,p_advertiser_id:externalId,
  p_status:decision,p_actor_id:user.id,p_review_note:note,
  p_reviewed_price:Number(info.offer.price),
  p_reviewed_offer_at:info.offer.last_seen_at,
  p_reviewed_score_at:info.score.calculated_at,
 });
 if(error)throw Error("Atomic owner release could not be recorded: "+error.message);
 refresh();
 redirect(page+"?event="+(decision==="approved"?"published":"paused"));
}
