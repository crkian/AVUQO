import "server-only";
import {createAdminClient} from "../supabase/admin";
import {readShoppingReleases,type ShoppingRelease} from "./shopping-release-reader";
import {PARTNERS} from "../partners/advertiser-directory";
import {cleanShopSearch,SHOP_PAGE_SIZE,SHOP_MAX_PAGE} from "./shop-filters";

export async function shoppingCatalogueEnabled():Promise<boolean>{
 try{
  const {data,error}=await createAdminClient().from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion","shopping_publishing"]);
  if(error||!data)return false;
  const controls=new Map(data.map(x=>[x.control_key,x.enabled]));
  return controls.get("global_emergency_stop")===false&&controls.get("source_ingestion")===true&&controls.get("shopping_publishing")===true;
 }catch{return false;}
}
export type RetailQuery={q?:string|string[];merchant?:string|string[];page?:string|string[];sort?:string|string[]};
export async function ordinaryShoppingPage(input:RetailQuery):Promise<{enabled:boolean;offers:ShoppingRelease[];q:string;merchant:string;page:number;sort:string;hasNext:boolean}>{
 const q=cleanShopSearch(input.q);
 const pageNum=Number(Array.isArray(input.page)?input.page[0]:input.page);
 const page=Number.isInteger(pageNum)&&pageNum>=1&&pageNum<=SHOP_MAX_PAGE?pageNum:1;
 const rawSort=Array.isArray(input.sort)?input.sort[0]:input.sort;
 const sort=rawSort==="price-low"||rawSort==="price-high"?rawSort:"recent";
 const rawMerchant=Array.isArray(input.merchant)?input.merchant[0]:input.merchant;
 const partner=PARTNERS.find(p=>p.slug===rawMerchant&&p.advertiserId);
 const merchant=partner?.slug??"";
 const empty={enabled:false,offers:[] as ShoppingRelease[],q,merchant,page,sort,hasNext:false};
 if(!await shoppingCatalogueEnabled())return empty;
 try{
  const offset=(page-1)*SHOP_PAGE_SIZE;
  const db=createAdminClient();
  let query=db.from("offers").select("id,awin_shopping_release_reviews!inner(status)")
   .eq("status","active").eq("awin_shopping_release_reviews.status","approved");
  if(partner){
   const {data:matches,error}=await db.from("merchants").select("id").eq("metadata->>external_id",partner.advertiserId!).eq("status","active");
   if(error)return empty;
   if(!matches?.length)return {...empty,enabled:true};
   query=query.in("merchant_id",matches.map(m=>m.id));
  }
  if(q){
   const pattern="%"+q.split(" ").join("%")+"%";
   const {data:matches,error}=await db.from("merchants").select("id").eq("status","active").ilike("name",pattern).limit(60);
   if(error)return empty;
   const ids=(matches??[]).map(m=>m.id).filter(id=>/^[0-9a-f-]{36}$/i.test(id));
   // User text has passed cleanShopSearch (no PostgREST delimiters or wildcards).
   query=ids.length?query.or("title.ilike."+pattern+",merchant_id.in.("+ids.join(",")+")"):query.ilike("title",pattern);
  }
  query=sort==="recent"?query.order("last_seen_at",{ascending:false}):query.order("price",{ascending:sort==="price-low"});
  const {data,error}=await query.order("id",{ascending:true}).range(offset,offset+SHOP_PAGE_SIZE);
  if(error||!data)return empty;
  const ids=data.slice(0,SHOP_PAGE_SIZE).map(r=>r.id);
  const admitted=await readShoppingReleases(ids);
  const byId=new Map(admitted.map(x=>[x.offerId,x]));
  return {...empty,enabled:true,offers:ids.flatMap(id=>{const item=byId.get(id);return item?[item]:[];}),hasNext:data.length>SHOP_PAGE_SIZE&&page<SHOP_MAX_PAGE};
 }catch{return empty;}
}
