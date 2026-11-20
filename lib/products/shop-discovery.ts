import "server-only";
import {createAdminClient} from "../supabase/admin";
import {PARTNERS} from "../partners/advertiser-directory";
import {verifiedOffers,type PublicOffer,type PublicProduct} from "./public-catalog";
import {SHOP_PAGE_SIZE,shopFilters,type ShopFacet,type ShopQuery,type ShopFilters} from "./shop-filters";

type PublishedCandidate={offer_id:string;product_id:string;current_price:number;merchant:string;category:string;updated_at:string};
export type ShopEntry={product:PublicProduct;offers:PublicOffer[]};
export type ShopPage={
 filters:ShopFilters;merchants:ShopFacet[];categories:ShopFacet[];
 products:ShopEntry[];shownOfferCount:number;candidateCount:number;pageCount:number;hasNext:boolean;hasPrevious:boolean;
 resultsState:"ready"|"no_verified_candidates"|"source_unavailable";
};
const PRODUCT_FIELDS="id,slug,canonical_title,brand,model,description,primary_image_url,specifications,status,product_type";
const validSlug=(value:string)=>/^[a-z0-9][a-z0-9-]{2,159}$/.test(value);
const meta=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
const labels:Record<string,string>={tools:"Tools & DIY",fashion:"Workwear & fashion",gifts:"Gifts & toys",home:"Home",garden:"Garden & outdoors",tech:"Phones & technology",motoring:"Motoring"};
function facets(rows:readonly {category:string|null;merchant:string|null}[],approvedNames:Map<string,string>){
 const merchants=new Map<string,number>(),categories=new Map<string,number>();
 for(const row of rows){
  if(!row.merchant||!approvedNames.has(row.merchant))continue;
  merchants.set(row.merchant,(merchants.get(row.merchant)??0)+1);
  if(row.category&&/^[a-z][a-z0-9-]{1,40}$/.test(row.category))
   categories.set(row.category,(categories.get(row.category)??0)+1);
 }
 return {
  merchants:[...merchants].map(([value,count])=>({value,count,label:approvedNames.get(value)??value}))
   .sort((a,b)=>a.label.localeCompare(b.label,"en-GB")),
  categories:[...categories].map(([value,count])=>({value,count,label:labels[value]??value.replaceAll("-"," ")}))
   .sort((a,b)=>a.label.localeCompare(b.label,"en-GB"))
 };
}

/** Browse all *published candidates* in deterministic slices, then pass every
 * item through the same immutable public admission gates as product details.
 * A candidate is never a claim of live stock, source rights or valid currency.
 * Pagination is over candidates to prevent bypassing release/revocation checks.
 * No private stage or signed feed URL is read or sent to the customer. */
export async function verifiedShopPage(raw:ShopQuery):Promise<ShopPage>{
 const empty=(filters:ShopFilters,merchants:ShopFacet[]=[],categories:ShopFacet[]=[],state:ShopPage["resultsState"]="source_unavailable"):ShopPage=>({
  filters,merchants,categories,products:[],shownOfferCount:0,candidateCount:0,pageCount:0,hasNext:false,hasPrevious:filters.page>1,resultsState:state
 });
 const db=createAdminClient();
 const [publishedFacetRows,programmeResult,merchantResult]=await Promise.all([
  db.from("published_deals").select("merchant,category").eq("status","published").limit(2500),
  db.from("affiliate_programs").select("external_account_id,region,metadata").eq("provider","awin").limit(120),
  db.from("merchants").select("name,metadata,status").limit(150)
 ]);
 if(publishedFacetRows.error||programmeResult.error||merchantResult.error)
  return empty(shopFilters(raw,[],[]));
 const accepted=new Set((programmeResult.data??[]).filter(p=>
  p.region==="GB"&&meta(meta(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted"&&
  meta(p.metadata).publication_approved===true
 ).map(p=>p.external_account_id).filter((id):id is string=>typeof id==="string"&&/^[0-9]{2,12}$/.test(id)));
 const knownPartners=new Map(PARTNERS.filter(p=>p.advertiserId).map(p=>[p.advertiserId!,p.name]));
 const approvedNames=new Map<string,string>();
 for(const m of merchantResult.data??[]){
  const id=meta(m.metadata).external_id;
  if(m.status==="active"&&typeof id==="string"&&accepted.has(id))
   approvedNames.set(m.name,knownPartners.get(id)??m.name);
 }
 const options=facets(publishedFacetRows.data??[],approvedNames);
 const filters=shopFilters(raw,options.merchants,options.categories);
 if(!approvedNames.size)return empty(filters,options.merchants,options.categories);
 const offset=(filters.page-1)*SHOP_PAGE_SIZE;
 let query=db.from("published_deals").select("offer_id,product_id,current_price,merchant,category,updated_at",{count:"exact"})
  .eq("status","published").range(offset,offset+SHOP_PAGE_SIZE-1);
 // Only from a documented, accepted real merchant. Never let dummy publisher
 // rows create live catalogue tiles merely by having status='published'.
 query=query.in("merchant",[...approvedNames.keys()]);
 if(filters.merchant)query=query.eq("merchant",filters.merchant);
 if(filters.category)query=query.eq("category",filters.category);
 if(filters.q)query=query.ilike("title","%"+filters.q.split(" ").join("%")+"%");
 if(filters.sort==="price-low")query=query.order("current_price",{ascending:true, nullsFirst:false});
 else if(filters.sort==="price-high")query=query.order("current_price",{ascending:false,nullsFirst:false});
 else query=query.order("updated_at",{ascending:false});
 query=query.order("offer_id",{ascending:true});
 const {data,error,count}=await query;
 if(error)return empty(filters,options.merchants,options.categories);
 const candidates=(data??[]) as PublishedCandidate[];
 const total=count??0,offerIds=candidates.map(row=>row.offer_id);
 const hasNext=offset+candidates.length<total;
 if(!offerIds.length)return {...empty(filters,options.merchants,options.categories,"no_verified_candidates"),
  candidateCount:total,pageCount:Math.ceil(total/SHOP_PAGE_SIZE),hasNext,hasPrevious:filters.page>1};
 const admitted=await verifiedOffers({offerIds,limit:SHOP_PAGE_SIZE});
 const admittedById=new Map(admitted.map(o=>[o.offer.id,o]));
 const productIds=[...new Set(admitted.map(o=>o.published.product_id))];
 if(!productIds.length)return {...empty(filters,options.merchants,options.categories,"no_verified_candidates"),
  candidateCount:total,pageCount:Math.ceil(total/SHOP_PAGE_SIZE),hasNext,hasPrevious:filters.page>1};
 const {data:productRows,error:productsError}=await db.from("products").select(PRODUCT_FIELDS).in("id",productIds).eq("status","active");
 if(productsError)return empty(filters,options.merchants,options.categories);
 const products=new Map((productRows??[]).filter(p=>validSlug(p.slug)).map(p=>[p.id,p as PublicProduct]));
 const byProduct=new Map<string,ShopEntry>();let eligibleOffers=0;
 // Preserve selected price/date order, not affiliate commission ranking.
 for(const candidate of candidates){
  const offer=admittedById.get(candidate.offer_id);
  if(!offer||!products.has(offer.published.product_id)||!approvedNames.has(candidate.merchant))continue;
  eligibleOffers++;
  const id=offer.published.product_id;
  const previous=byProduct.get(id);
  if(previous)previous.offers.push(offer);
  else byProduct.set(id,{product:products.get(id)!,offers:[offer]});
 }
 return {filters,merchants:options.merchants,categories:options.categories,products:[...byProduct.values()],
  shownOfferCount:eligibleOffers,candidateCount:total,pageCount:Math.ceil(total/SHOP_PAGE_SIZE),
  hasNext,hasPrevious:filters.page>1,resultsState:"ready"};
}
