import {createClient} from "../supabase/server";
import {EDITORIAL_ROTATION,validPublicCampaign,type HomeCampaign} from "./homepage-policy";
export {EDITORIAL_ROTATION,DEFAULT_CAMPAIGN,validPublicCampaign} from "./homepage-policy";
export async function loadHomeCampaigns():Promise<HomeCampaign[]> {
 try{
  const db=await createClient();
  const now=new Date().toISOString();
  const {data,error}=await db.from("marketing_home_placements")
   .select("id,title,summary,cta_label,href,sponsored")
   .eq("brand_slug","avuqo").eq("status","approved")
   .lte("starts_at",now).gt("ends_at",now)
   .order("priority",{ascending:false}).order("created_at",{ascending:false}).limit(8);
  if(error||!data)return EDITORIAL_ROTATION;
  const accepted=data.map(r=>validPublicCampaign(r)).filter((r):r is HomeCampaign=>!!r);
  return accepted.length?accepted:EDITORIAL_ROTATION;
 }catch{return EDITORIAL_ROTATION}
}
