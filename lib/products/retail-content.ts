import {cleanAwinDescription,publicAwinDescription} from "../awin/product-description-evidence.ts";
const rec=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const labels:Record<string,string>={colour:"Colour",color:"Colour",size:"Size",material:"Material",pattern:"Pattern",age_group:"Age group",gender:"Intended gender",condition:"Supplier-reported condition",product_model:"Model",model_number:"Model number",ean:"EAN",gtin:"GTIN",product_GTIN:"GTIN",mpn:"Manufacturer part number",upc:"UPC",item_group_id:"Supplier variant group",unit_pricing_measure:"Pack measure",unit_pricing_base_measure:"Base measure",product_detail:"Supplier product detail"};
export type RetailContent={description:string|null;specifications:[string,string][]};
export function exactRetailContent(metadata:unknown,digest:string,programmeMetadata:unknown):RetailContent{
 const m=rec(metadata),p=rec(programmeMetadata),att=rec(p.owner_joined_accepted_attestation);
 const empty:RetailContent={description:null,specifications:[]};
 if(p.product_description_rights_verified!==true||p.publication_approved!==true||att.membership_status!=="accepted"||!/^[a-f0-9]{64}$/.test(digest)||m.live_feed_digest!==digest||m.live_feed_verification!=="exact_authenticated_feed_digest_rechecked")return empty;
 const description=publicAwinDescription(m,digest);
 // Earlier general-feed rechecks captured source_catalogue_fields in the same
 // authenticated digest transaction. The current owner grant covers those factual
 // fields. Explicit negative rights or contradictory digest always override.
 const legacyGeneral=m.source_format==="google-retail"||m.source_format==="awin-csv";
 const catalogueAllowed=m.source_catalogue_rights_confirmed!==false&&
  (m.source_catalogue_verified_digest===digest||(m.source_catalogue_verified_digest===undefined&&legacyGeneral));
 const values=rec(m.source_catalogue_fields),specifications:[string,string][]=[];
 if(catalogueAllowed){
  const seen=new Set<string>();
  for(const [key,label] of Object.entries(labels)){
   const v=values[key];if(typeof v!=="string"||v.length>500)continue;
   const value=v.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
   if(!value||value.length>500||/[\u0000-\u001f\u007f]/.test(value)||/https?:\/\/|\b(?:token|api[_ -]?key|secret|authorization)\b/i.test(value)||seen.has(label))continue;
   seen.add(label);specifications.push([label,value]);
  }
 }
 return {description:description?cleanAwinDescription(description):null,specifications};
}
