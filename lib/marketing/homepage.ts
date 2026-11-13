import {createClient} from "../supabase/server";
import {createAdminClient} from "../supabase/admin";
import {EDITORIAL_ROTATION,homeCampaignsWithCurrentFacts,type HomeCampaign} from "./homepage-policy";
export {EDITORIAL_ROTATION,DEFAULT_CAMPAIGN,validPublicCampaign} from "./homepage-policy";
export type {HomeCampaign} from "./homepage-policy";

/**
 * Public placements are first selected through the existing column-limited RLS
 * grant. Supporting facts are private and are verified server-side by ID only.
 * A withdrawn or expired claim must never keep a homepage placement live.
 */
export async function loadHomeCampaigns():Promise<HomeCampaign[]> {
 try{
  const db=await createClient();
  const now=new Date().toISOString();
  const {data,error}=await db.from("marketing_home_placements")
   .select("id,title,summary,cta_label,href,sponsored")
   .eq("brand_slug","avuqo").eq("status","approved")
   .lte("starts_at",now).gt("ends_at",now)
   .order("priority",{ascending:false}).order("starts_at",{ascending:false}).order("id",{ascending:true}).limit(8);
  if(error||!data?.length)return EDITORIAL_ROTATION;

  // Never ask the anonymous database client for fact_id or private claim data.
  // Recheck the placement status/window after the public RLS read, then fetch
  // only the evidence status required for release. Nothing private is returned.
  const admin=createAdminClient();
  const {data:links,error:linkError}=await admin.from("marketing_home_placements")
   .select("id,fact_id")
   .in("id",data.map(row=>row.id))
   .eq("brand_slug","avuqo").eq("status","approved")
   .lte("starts_at",now).gt("ends_at",now);
  if(linkError||!links?.length)return EDITORIAL_ROTATION;
  const factIds=[...new Set(links.map(row=>row.fact_id).filter((id):id is string=>typeof id==="string"))];
  if(!factIds.length)return EDITORIAL_ROTATION;
  const {data:facts,error:factError}=await admin.from("marketing_facts")
   .select("id,brand_slug,status,expires_at")
   .in("id",factIds).eq("brand_slug","avuqo").eq("status","approved");
  if(factError||!facts)return EDITORIAL_ROTATION;
  const accepted=homeCampaignsWithCurrentFacts(data,links,facts,new Date(now));
  return accepted.length?accepted:EDITORIAL_ROTATION;
 }catch{return EDITORIAL_ROTATION}
}
