/** Tyre catalogue presentation rules. Never promote staged metadata to verified fitment. */
export const TYRES_UK_IMPORT_ID="8ea807f1-7050-4dfb-af51-e08dc7c7bbd5";
export const TYRES_UK_MERCHANT_ID="12715";

export const tyreCollections=[
 {title:"Car tyres",slug:"car",description:"Start with the size and ratings recommended for your vehicle.",readiness:"Category mapping required"},
 {title:"All-season tyres",slug:"all-season",description:"Explore year-round tyre options once the exact season specification is confirmed.",readiness:"Season evidence required"},
 {title:"Summer tyres",slug:"summer",description:"Compare summer tyre models only after the manufacturer specification is checked.",readiness:"Season evidence required"},
 {title:"Winter tyres",slug:"winter",description:"Winter-use products require clear season and marking verification.",readiness:"Season evidence required"},
 {title:"SUV & 4×4 tyres",slug:"suv",description:"Find the correct load, size and model for your vehicle.",readiness:"Vehicle and tyre-type evidence required"},
 {title:"Van & commercial tyres",slug:"van",description:"Commercial tyres need carefully checked load and vehicle suitability.",readiness:"Load and fitment evidence required"},
 {title:"Run-flat tyres",slug:"run-flat",description:"Run-flat technology must be confirmed for the exact product variant.",readiness:"Run-flat evidence required"},
 {title:"Performance tyres",slug:"performance",description:"Compare performance models without assuming a speed rating or fitment.",readiness:"Independent ratings required"}
] as const;

export function tyreBrandSlug(brand:string){
 return brand.trim().normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/&/g,"-and-").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80);
}
export function resolveTyreBrand(slug:string,brands:readonly string[]){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>80)return null;
 const matches=brands.filter(b=>tyreBrandSlug(b)===slug);
 return matches.length===1?matches[0]:null;
}
export type TyreEvidence={
 size:string|null;width:number|null;profile:number|null;rim:number|null;
 load:string|null;speed:string|null;source:string;hasConflict:boolean;
};
const record=(input:unknown):Record<string,unknown>=>
 input&&typeof input==="object"&&!Array.isArray(input)?input as Record<string,unknown>:{};
const asRange=(value:unknown,min:number,max:number)=>{
 const numeric=typeof value==="number"?value:typeof value==="string"&&/^\d{1,3}$/.test(value)?Number(value):NaN;
 return Number.isInteger(numeric)&&numeric>=min&&numeric<=max?numeric:null;
};
export function tyreEvidence(metadata:unknown):TyreEvidence{
 const data=record(metadata),size=record(data.tyre_size_candidate);
 const width=asRange(size.width_mm,125,385);
 const profile=asRange(size.aspect_ratio,20,95);
 const rim=asRange(size.rim_inches,10,26);
 const hasConflict=data.tyre_size_conflict===true;
 const load=typeof data.load_index_candidate==="string"&&/^\d{2,3}(?:\/\d{2,3})?$/.test(data.load_index_candidate)
  ?data.load_index_candidate:null;
 const speed=typeof data.speed_rating_candidate==="string"&&/^[A-Z]$/.test(data.speed_rating_candidate)
  ?data.speed_rating_candidate:null;
 return {
  size:!hasConflict&&width&&profile&&rim?`${width}/${profile} R${rim}`:null,
  width:hasConflict?null:width,profile:hasConflict?null:profile,rim:hasConflict?null:rim,
  load, speed, source:"Tyres UK historical feed · unverified",hasConflict
 };
}
export function tyreSizeQuery(value:unknown,min:number,max:number):string{
 if(typeof value!=="string"||!/^\d{2,3}$/.test(value))return "";
 const number=Number(value);
 return number>=min&&number<=max?String(number):"";
}
export function tyreSizeHref(e:TyreEvidence){
 if(!e.width||!e.profile||!e.rim)return "/preview/tyres/sizes";
 return `/preview/tyres/sizes?width=${e.width}&profile=${e.profile}&rim=${e.rim}`;
}
