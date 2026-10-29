import { createClient } from "../supabase/server";
export type HomeCampaign = {
 id:string;title:string;summary:string;ctaLabel:string;href:string;sponsored:boolean
};
export const DEFAULT_CAMPAIGN:HomeCampaign={
 id:"evergreen",title:"Find what's worth it, every day.",
 summary:"Explore buying guides, supermarket baskets, travel and everyday comparisons with AVUQO.",
 ctaLabel:"Start exploring",href:"/discover",sponsored:false
};
const localPath=(value:unknown):value is string=>
 typeof value==="string" && /^\/[a-z0-9][a-z0-9/-]*$/.test(value);
export function validPublicCampaign(value:Record<string,unknown>):HomeCampaign|null {
 if(!localPath(value.href)||typeof value.title!=="string"||typeof value.summary!=="string"||
  typeof value.cta_label!=="string"||typeof value.sponsored!=="boolean") return null;
 if(value.title.length<8||value.title.length>100||value.summary.length<15||
   value.summary.length>260||value.cta_label.length<4||value.cta_label.length>40) return null;
 return {id:String(value.id),title:value.title,summary:value.summary,
  ctaLabel:value.cta_label,href:value.href,sponsored:value.sponsored};
}
export const EDITORIAL_ROTATION:HomeCampaign[]=[
 DEFAULT_CAMPAIGN,
 {id:"groceries",title:"Make the weekly shop clearer.",
  summary:"Bring your shopping list together and see which supermarket prices have been verified.",
  ctaLabel:"Explore groceries",href:"/groceries",sponsored:false},
 {id:"total-cost",title:"Look beyond the monthly price.",
  summary:"Explore the true costs of broadband, mobile and other everyday contracts using your figures.",
  ctaLabel:"Compare contracts",href:"/compare",sponsored:false}
];
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
