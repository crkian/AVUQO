/**
 * Awin tyre feed contracts. This is an exact allowlist for read-only source
 * diagnostics, NOT a licence or import/publishing approval.
 */
export const PRIVATE_TYRE_FEEDS={
 "12715:93988":{advertiser_id:"12715",feed_id:"93988",merchant:"Tyres UK",listed_rows:32053},
 "15236:26513":{advertiser_id:"15236",feed_id:"26513",merchant:"Tyres Pneus Online UK",listed_rows:20062}
} as const;
export type TyreFeedKey=keyof typeof PRIVATE_TYRE_FEEDS;
export function exactTyreFeed(advertiser:string,feed:string){
 const key=`${advertiser}:${feed}` as TyreFeedKey;
 return Object.prototype.hasOwnProperty.call(PRIVATE_TYRE_FEEDS,key)?PRIVATE_TYRE_FEEDS[key]:null;
}
export const TYRE_FIELDS={
 size:["tyre_size","tire_size","size","dimension","dimensions"],
 width:["width","tyre_width","tire_width"],
 aspect:["aspect_ratio","profile","series"],
 rim:["rim","rim_size","diameter","wheel_size"],
 load:["load_index","load_rating","load"],
 speed:["speed_index","speed_rating","speed"],
 wet:["wet_grip","wet_grip_rating","wetbraking"],
 fuel:["fuel_efficiency","rolling_resistance","fuel_rating"],
 noise:["external_noise","noise_db","noise_level"],
 label:["eu_tyre_label","eu_label_url","tyre_label"],
 fitment:["fitting_cost","fitted_price","fully_fitted_price"],
 delivery:["delivery_cost","shipping_cost","delivery_price"]
} as const;
const sizePattern=/(?:^|[^0-9])([1-3][0-9]{2})\s*\/\s*([2-9][0-9])\s*(?:Z?R|ZR|r)\s*([1-2][0-9])(?:\s|$|[^0-9])/i;
/** A title-derived size is a *candidate* and cannot confer tyre match approval. */
export function candidateTyreSize(title:string){
 const m=title.match(sizePattern);
 if(!m)return null;
 const [width,aspect,rim]=m.slice(1,4).map(Number);
 if(width<115||width>395||aspect<25||aspect>90||rim<12||rim>24)return null;
 return {width_mm:width,aspect_ratio:aspect,rim_inches:rim,verified:false as const};
}
export function inspectTyreHeader(header:string[],advertiser:string,feed:string){
 if(!exactTyreFeed(advertiser,feed))throw Error("tyre_feed_not_allowlisted");
 const clean=header.map(x=>x.trim());
 if(clean.length<5||clean.length>256||new Set(clean).size!==clean.length||
    clean.some(x=>!/^[A-Za-z][A-Za-z0-9_ -]{0,63}$/.test(x)))
   throw Error("tyre_feed_schema_invalid");
 const lower=new Set(clean.map(x=>x.toLowerCase()));
 const present=(aliases:readonly string[])=>aliases.some(k=>lower.has(k));
 const detail=Object.fromEntries(Object.entries(TYRE_FIELDS)
   .map(([name,aliases])=>[name,present(aliases)]));
 return {
  status:"private_tyre_header_inspected",
  advertiser_id:advertiser,feed_id:feed,source_columns:clean.length,
  safe_header_names:clean,
  field_presence:detail,
  explicit_size:detail.size||(detail.width&&detail.aspect&&detail.rim),
  explicit_load_rating:detail.load,explicit_speed_rating:detail.speed,
  fitted_price_column:detail.fitment,delivery_price_column:detail.delivery,
  tyre_specs_verified:false,price_basis_verified:false,
  currency_verified:false,rights_verified:false,
  ready_to_import:false,ready_to_publish:false,
  private_only:true,no_product_rows_returned:true,
  no_database_writes:true,no_publication:true
 };
}
