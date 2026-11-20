/** Private owner-workspace classification. Observed data and right to publish
 * are separate dimensions: no status here can activate an importer or offer.
 */
export type SupplierReadiness={
 programme:string;advertiser_id:string|null;registry_status:string;
 observed_feeds:number;feeds_with_description_column:number;
 supplier_reported_items:number;refresh_flags:number;last_observation:string|null;
 private_rows:number;private_sample_rows:number;private_sample_descriptions:number;
 private_sample_rights_marked:number;last_private_import:string|null;
 active_products:number;active_described_products:number;
 published_candidates:number;held_candidates:number;product_description_rights_verified:boolean;
};
const physical=new Set(["496","77952","31539","736","45747","101445","12715","15236","35299"]);
const tyres=new Set(["12715","15236"]);
const mobile=new Set(["37738","128157","115559"]);
const booking=new Set(["3496","118401"]);
export function supplierKind(row:SupplierReadiness):string{
 const id=row.advertiser_id??"";
 return tyres.has(id)?"Tyres":mobile.has(id)?"Mobile tariff":
  booking.has(id)?"Travel booking":physical.has(id)?"Retail products":"Service / referral";
}
export function supplierNextAction(row:SupplierReadiness):string{
 const id=row.advertiser_id??"";
 if(!id)return "Map exact programme ID and secure a service or quote integration.";
 if(row.observed_feeds===0)return physical.has(id)
  ?"Request authorised product feed or tracked retailer catalogue."
  :"Confirm suitable referral, white-label, booking or quote API.";
 if(!physical.has(id))return "Build a specialist live-term or quote adapter; not an ordinary product import.";
 if(row.private_rows===0)return "Privately import and validate exact source products. Do not publish feed discovery counts.";
 if(tyres.has(id))return "Verify exact GBP currency, fitment, stock, fitting and source rights before comparing.";
 if(row.active_products===0||row.published_candidates===0)return "Review held products, image/text rights and first-release evidence; no automatic bulk approval.";
 if(row.active_described_products<row.active_products){
  if(row.feeds_with_description_column>0&&row.private_sample_descriptions===0)
   return "Repair description projection and run a rights-gated current feed recheck.";
  if(row.private_sample_descriptions>0&&!row.product_description_rights_verified)
   return "Confirm merchant-specific text reuse and reconcile exact Awin ID before description release.";
  return "Rebuild complete source-backed description and specification coverage without invented copy.";
 }
 return "Expand independently eligible live offers and variant-accurate catalogue coverage.";
}
export function supplierSummary(rows:SupplierReadiness[]){
 return {accepted:rows.length,withFeeds:rows.filter(x=>x.observed_feeds>0).length,
  imported:rows.filter(x=>x.private_rows>0).length,
  publishing:rows.filter(x=>x.published_candidates>0).length,
  described:rows.filter(x=>x.active_described_products>0).length,
  feedsWithDescriptionColumns:rows.filter(x=>x.feeds_with_description_column>0).length};
}
