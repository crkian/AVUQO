import type {PublicOffer,PublicProduct} from "../products/public-catalog";
import {chooseProductTemplate} from "../products/templates.ts";

/** Verified technical records are distinct from private feed candidates and fitment approval. */
export type VerifiedTyreSpec={
 width:number;profile:number;rim:number;load:number;speed:string;
 season:string|null;runFlat:boolean|null;xl:boolean|null;
};
const intRange=(v:unknown,min:number,max:number):number|null=>{
 if(typeof v!=="number"&&typeof v!=="string")return null;
 if(typeof v==="string"&&!/^[0-9]{1,3}$/.test(v.trim()))return null;
 const n=Number(v);return Number.isInteger(n)&&n>=min&&n<=max?n:null;
};
const asFlag=(v:unknown):boolean|null=>v===true?true:v===false?false:null;
export function verifiedTyreSpec(product:Pick<PublicProduct,"specifications">):VerifiedTyreSpec|null{
 const v=product.specifications;
 if(!v||typeof v!=="object"||Array.isArray(v))return null;
 const s=v as Record<string,unknown>;
 if(s.tyre_specs_verified!==true)return null;
 const width=intRange(s.tyre_width_mm,125,385),profile=intRange(s.tyre_profile,20,95);
 const rim=intRange(s.tyre_rim_inches,10,26),load=intRange(s.load_index,50,130);
 const speed=typeof s.speed_rating==="string"?s.speed_rating.trim().toUpperCase():"";
 if(!width||!profile||!rim||!load||!/^[A-Z]{1,2}$/.test(speed))return null;
 const season=typeof s.season==="string"&&["summer","winter","all-season"].includes(s.season.toLowerCase())
  ?s.season.toLowerCase():null;
 return {width,profile,rim,load,speed,season,runFlat:asFlag(s.run_flat),xl:asFlag(s.xl)};
}
export type TyreResult={product:PublicProduct;offers:PublicOffer[];spec:VerifiedTyreSpec};
export function eligibleTyreProducts(records:{product:PublicProduct;offers:PublicOffer[]}[]):TyreResult[]{
 return records.flatMap(item=>{
  if(!item.offers.length||chooseProductTemplate(item.product,item.offers).template!=="tyres")return [];
  const spec=verifiedTyreSpec(item.product);
  return spec?[{...item,spec}]:[];
 });
}
export function parseTyreSize(input:{width?:string;profile?:string;rim?:string}):{
 width:number;profile:number;rim:number
}|null{
 const width=intRange(input.width,125,385),profile=intRange(input.profile,20,95);
 const rim=intRange(input.rim,10,26);
 return width&&profile&&rim?{width,profile,rim}:null;
}
export function matchTyreSize(spec:VerifiedTyreSpec,size:ReturnType<typeof parseTyreSize>):boolean{
 return !size||(spec.width===size.width&&spec.profile===size.profile&&spec.rim===size.rim);
}
export function productUnitSubtotal(unit:number,quantity:1|2|4):number|null{
 return Number.isFinite(unit)&&unit>0&&unit<100000?Math.round(unit*quantity*100)/100:null;
}
export function validTyreQuantity(raw:string|undefined):1|2|4{
 return raw==="1"?1:raw==="2"?2:4;
}
export function comparableTyreOffers(offers:PublicOffer[]):PublicOffer[]{
 return [...offers].filter(o=>Number.isFinite(Number(o.offer.price))&&Number(o.offer.price)>0)
  .sort((a,b)=>Number(a.offer.price)-Number(b.offer.price));
}
export function tyreSpecLabel(spec:VerifiedTyreSpec):string{
 return `${spec.width}/${spec.profile} R${spec.rim} ${spec.load}${spec.speed}`;
}
