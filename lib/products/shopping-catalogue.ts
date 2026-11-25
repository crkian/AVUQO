import "server-only";
import {createAdminClient} from "../supabase/admin";
import {readShoppingReleases,type ShoppingRelease} from "./shopping-release-reader";
import {departmentBySlug} from "../categories/browse-tree";
import {PARTNERS} from "../partners/advertiser-directory";
import {cleanShopSearch,SHOP_PAGE_SIZE} from "./shop-filters";

export async function shoppingCatalogueEnabled():Promise<boolean>{
 try{
  const {data,error}=await createAdminClient().from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion","shopping_publishing"]);
  if(error||!data)return false;
  const controls=new Map(data.map(x=>[x.control_key,x.enabled]));
  return controls.get("global_emergency_stop")===false&&controls.get("source_ingestion")===true&&controls.get("shopping_publishing")===true;
 }catch{return false;}
}
export type RetailQuery={q?:string|string[];merchant?:string|string[];page?:string|string[];sort?:string|string[];department?:string|string[]};
export async function ordinaryShoppingPage(input:RetailQuery):Promise<{enabled:boolean;offers:ShoppingRelease[];q:string;merchant:string;department:string;page:number;sort:string;hasNext:boolean;maxPage:number}>{
 const q=cleanShopSearch(input.q);
 const rawDepartment=Array.isArray(input.department)?input.department[0]:input.department;
 const department=typeof rawDepartment==="string"?departmentBySlug(rawDepartment)?.slug??"":"";
 const maxPage=process.env.AWIN_CATALOGUE_SCALE_ENABLED==="true"?1000:100;
 const pageNum=Number(Array.isArray(input.page)?input.page[0]:input.page);
 const page=Number.isInteger(pageNum)&&pageNum>=1&&pageNum<=maxPage?pageNum:1;
 const rawSort=Array.isArray(input.sort)?input.sort[0]:input.sort;
 const sort=rawSort==="price-low"||rawSort==="price-high"?rawSort:"recent";
 const rawMerchant=Array.isArray(input.merchant)?input.merchant[0]:input.merchant;
 const partner=PARTNERS.find(p=>p.slug===rawMerchant&&p.advertiserId);
 const merchant=partner?.slug??"";
 const empty={enabled:false,offers:[] as ShoppingRelease[],q,merchant,department,page,sort,hasNext:false,maxPage};
 if(!await shoppingCatalogueEnabled())return empty;
 try{
  const offset=(page-1)*SHOP_PAGE_SIZE;
  const db=createAdminClient();
  const args={p_query:q,p_advertiser:partner?.advertiserId??"",p_sort:sort,p_offset:offset,p_limit:SHOP_PAGE_SIZE+1};
  const {data,error}=department?await db.rpc("shopping_catalogue_department_page_ids",{...args,p_department:department}):await db.rpc("shopping_catalogue_page_ids",args);
  if(error||!Array.isArray(data))return empty;
  const ids=(data as {offer_id:string}[]).slice(0,SHOP_PAGE_SIZE).map(r=>r.offer_id);
  const admitted=await readShoppingReleases(ids);
  const byId=new Map(admitted.map(x=>[x.offerId,x]));
  return {...empty,enabled:true,offers:ids.flatMap(id=>{const item=byId.get(id);return item&&(!department||item.department===department)?[item]:[];}),hasNext:data.length>SHOP_PAGE_SIZE&&page<maxPage};
 }catch{return empty;}
}
