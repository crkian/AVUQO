import {identifyFormat,prepareGeneralBatch} from "../feed-imports/general-awin-large";

export const TOOLED_UP_ADVERTISER="496";
export const TOOLED_UP_MASTER_FEED="89987";
export const TOOLED_UP_SOURCE_FIELDS=[
 "data_feed_id","merchant_id","merchant_name","aw_product_id","aw_deep_link",
 "aw_image_url","aw_thumb_url","category_id","category_name","brand_id",
 "brand_name","merchant_product_id","merchant_category","ean","mpn",
 "product_name","description","merchant_deep_link","merchant_image_url",
 "search_price","rrp_price","delivery_cost","in_stock","colour",
 "custom_1","custom_2","custom_3","merchant_product_category_path","stock_status"
] as const;

export type TooledUpCurrencyEvidence={
 advertiser_id:"496";
 feed_id:"89987";
 currency:"GBP";
 evidence_ref:string;
 approved_for_private_staging:true;
};

/**
 * No default currency assumption: a GBP evidence object is REQUIRED.
 * The already-observed header alone does not establish price currency.
 * Does not download, stage or publish anything.
 */
export function normalizeTooledUpMasterChunk(
 advertiser:string,feed:string,header:string[],rows:string[][],
 currencyEvidence?:TooledUpCurrencyEvidence
){
 if(advertiser!==TOOLED_UP_ADVERTISER||feed!==TOOLED_UP_MASTER_FEED)
  throw Error("tooled_up_feed_not_allowlisted");
 if(header.length!==TOOLED_UP_SOURCE_FIELDS.length||
   new Set(header).size!==header.length||
   !TOOLED_UP_SOURCE_FIELDS.every(name=>header.includes(name)))
  throw Error("tooled_up_schema_mismatch");
 if(!currencyEvidence||currencyEvidence.advertiser_id!==advertiser||
   currencyEvidence.feed_id!==feed||currencyEvidence.currency!=="GBP"||
   currencyEvidence.approved_for_private_staging!==true||
   !/^[A-Za-z0-9][A-Za-z0-9_./:-]{7,159}$/.test(currencyEvidence.evidence_ref))
  throw Error("tooled_up_currency_evidence_required");
 if(rows.length<1||rows.length>250)throw Error("invalid_tooled_up_chunk_size");
 const merchantAt=header.indexOf("merchant_id");
 const projectedHeader=[...header,"currency"];
 const projectedRows=rows.map(row=>{
  if(row.length!==header.length)throw Error("tooled_up_column_mismatch");
  if(row[merchantAt]?.trim()!==TOOLED_UP_ADVERTISER)
   throw Error("tooled_up_advertiser_mismatch");
  return [...row,"GBP"];
 });
 identifyFormat(projectedHeader);
 return {
  header:projectedHeader,rows:projectedRows,
  currencySource:"tooled_up_approved_uk_gbp_evidence" as const,
  sourceCurrencyExplicit:false as const,
  evidenceRef:currencyEvidence.evidence_ref
 };
}

/** Existing strict Awin validator remains authoritative for each bounded chunk. */
export function validateTooledUpMasterChunk(
 advertiser:string,feed:string,header:string[],rows:string[][],
 evidence?:TooledUpCurrencyEvidence
){
 const normalized=normalizeTooledUpMasterChunk(advertiser,feed,header,rows,evidence);
 const records=prepareGeneralBatch(advertiser,feed,normalized.header,normalized.rows);
 return records.map(record=>({...record,metadata:{
  ...record.metadata,
  currency_source:normalized.currencySource,
  source_currency_explicit:false,
  currency_evidence_ref:normalized.evidenceRef,
  source_image_rights_confirmed:false,
  permission_status:"unverified"
 }}));
}
