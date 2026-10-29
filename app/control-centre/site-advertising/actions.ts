"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {AD_ZONES,validAdvertiserSite,validCampaignWindow,readyForEditorialApproval} from "../../../lib/site-advertising/policy";
const HOME="/control-centre/site-advertising";
const field=(f:FormData,k:string,max=500)=>String(f.get(k)??"").trim().slice(0,max);
function fail(m:string):never {throw Error("Site advertising: "+m)}
async function owner(){
 const {user,role}=await requireControlCentreAccess();
 if(role!=="owner")fail("Only the owner may manage advertiser records and approval");
 return user;
}
function done(n:string):never {
 revalidatePath(HOME);
 redirect(HOME+"?notice="+encodeURIComponent(n));
}
export async function addSiteAdvertiser(f:FormData){
 const user=await owner();
 const company_name=field(f,"company_name",120);
 const contact_name=field(f,"contact_name",120);
 const contact_email=field(f,"contact_email",200);
 const website=field(f,"website",500);
 if(company_name.length<2||contact_name.length<2||!/^.+@[^@\s]+\.[^@\s]+$/.test(contact_email)||
  !validAdvertiserSite(website))fail("Enter a company, business contact, email and public HTTPS website");
 const db=await createClient();
 const {error}=await db.from("site_advertisers").insert({
  company_name,contact_name,contact_email,website,status:"prospect",created_by:user.id
 });
 if(error)fail(error.message);
 done("advertiser-added");
}
export async function verifySiteAdvertiser(f:FormData){
 const user=await owner();
 const id=field(f,"advertiser_id",80),decision=field(f,"decision",16);
 const note=field(f,"verification_note",750);
 if(!["verify","decline"].includes(decision)||note.length<8)fail("An explicit decision and meaningful verification note are required");
 const db=await createClient();
 const {data,error}=await db.from("site_advertisers").update({
  status:decision==="verify"?"verified":"declined",
  verification_note:note,
  verified_by:decision==="verify"?user.id:null,
  verified_at:decision==="verify"?new Date().toISOString():null,
  updated_at:new Date().toISOString()
 }).eq("id",id).eq("status","prospect").select("id");
 if(error||!data?.length)fail("Advertiser decision could not be saved");
 done("advertiser-reviewed");
}
export async function addSiteAdCampaign(f:FormData){
 const user=await owner();
 const advertiser_id=field(f,"advertiser_id",80);
 const title=field(f,"title",110),headline=field(f,"headline",120);
 const body=field(f,"body",350),cta_label=field(f,"cta_label",35);
 const target_url=field(f,"target_url",500),zone=field(f,"zone",40);
 const from=field(f,"starts_at",40),to=field(f,"ends_at",40);
 const starts_at=new Date(from.endsWith("Z")?from:from+"Z").toISOString();
 const ends_at=new Date(to.endsWith("Z")?to:to+"Z").toISOString();
 if(title.length<6||headline.length<8||body.length<15||cta_label.length<3 ||
  !AD_ZONES.some(z=>z.id===zone)||!validAdvertiserSite(target_url)||
  !validCampaignWindow(starts_at,ends_at))fail("Complete the campaign brief, future schedule, HTTPS destination and ad zone");
 const db=await createClient();
 const {data:advertiser}=await db.from("site_advertisers").select("id").eq("id",advertiser_id).maybeSingle();
 if(!advertiser)fail("Select an existing advertiser");
 const {error}=await db.from("site_ad_campaigns").insert({
  advertiser_id,title,headline,body,cta_label,target_url,zone,
  starts_at,ends_at,status:"draft",created_by:user.id
 });
 if(error)fail(error.message);
 done("campaign-added");
}
export async function reviewSiteAdCampaign(f:FormData){
 const user=await owner();
 const id=field(f,"campaign_id",80),decision=field(f,"decision",20);
 if(!["review","approve","pause","decline"].includes(decision))fail("Unknown campaign decision");
 const db=await createClient();
 const {data:campaign,error:fetchError}=await db.from("site_ad_campaigns").select("*").eq("id",id).maybeSingle();
 if(fetchError||!campaign)fail("Campaign not found");
 const now=new Date().toISOString();
 let update:Record<string,unknown>={updated_at:now};
 if(decision==="review"&&campaign.status==="draft")update.status="in_review";
 else if(decision==="decline"&&["draft","in_review"].includes(campaign.status))update.status="declined";
 else if(decision==="pause"&&campaign.status==="ready")update.status="paused";
 else if(decision==="approve"&&campaign.status==="in_review"){
  const {data:advertiser}=await db.from("site_advertisers").select("status").eq("id",campaign.advertiser_id).maybeSingle();
  const rightsNote=field(f,"rights_note",750);
  const gate=readyForEditorialApproval({
   advertiserVerified:advertiser?.status==="verified",rightsNote,
   disclosure:campaign.disclosure_text,destination:campaign.target_url,end:campaign.ends_at
  });
  if(!gate.ok)fail(gate.reasons.join("; "));
  update={...update,status:"ready",rights_note:rightsNote,approved_by:user.id,approved_at:now};
 } else fail("Invalid state transition. The campaign may already have been reviewed.");
 const {data,error}=await db.from("site_ad_campaigns").update(update)
   .eq("id",id).eq("status",campaign.status).select("id");
 if(error||!data?.length)fail("Campaign status could not be updated");
 done("campaign-reviewed");
}
