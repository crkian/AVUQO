import {identifyFormat,prepareGeneralBatch} from "../feed-imports/general-awin-large";

/** Private-first Pneus Online UK source admission. No public offers are created here. */
export const PNEUS_ADVERTISER_ID="15236";
export const PNEUS_FEED_ID="26513";
export const PNEUS_NAME="Tyres Pneus Online UK";
export const PNEUS_PRIVATE_BUCKET="awin-bulk-private-snapshots";
export const PNEUS_MAX_DOWNLOADED=36*1024*1024;
export const PNEUS_MAX_EXPANDED=180*1024*1024;
export const PNEUS_MAX_ROWS=100_000;
export const PNEUS_BATCH_SIZE=250;

type Source={
 status?:unknown;sync_enabled?:unknown;credential_status?:unknown;metadata?:unknown;
};
function object(value:unknown):Record<string,unknown>|null{
 return value&&typeof value==="object"&&!Array.isArray(value)
  ?value as Record<string,unknown>:null;
}
export type PermissionGate=
 "ready"|"source_not_paused"|"programme_not_joined"|
 "feed_permission_unconfirmed"|"approval_evidence_missing"|"approval_expired";
/** Staging permission is distinct from permission to publish images/prices/offers.
 * If evidence is absent or expired, no product download or DB write is allowed. */
export function pneusPrivateSourceGate(source:Source|null|undefined,now:Date=new Date(),ownerApprovedActive=false):PermissionGate{
 const active=ownerApprovedActive&&source?.status==="active"&&source.sync_enabled===true&&source.credential_status==="ready";
 const privateLegacy=source?.status==="paused"&&source.sync_enabled===false;
 if(!source||(!privateLegacy&&!active))return "source_not_paused";
 const data=object(source.metadata);
 const advertisers=data?.awin_advertisers;
 if(!Array.isArray(advertisers))return "programme_not_joined";
 const matching=advertisers.map(object).filter((r):r is Record<string,unknown>=>
  r!==null&&r.advertiser_id===PNEUS_ADVERTISER_ID&&r.joined_programme_observed===true);
 if(matching.length!==1)return "programme_not_joined";
 const entry=matching[0];
 // A current accepted-programme owner grant supersedes the old paused-only
 // private staging flag. It does NOT assert tyre fitment, current prices or
 // any public listing: those require a separate authenticated row adapter.
 if(!active&&entry.feed_permission_confirmed!==true)return "feed_permission_unconfirmed";
 if(!active&&(typeof entry.approval_evidence_ref!=="string"||entry.approval_evidence_ref.trim().length<8))
  return "approval_evidence_missing";
 const expiry=entry.valid_until;
 if(expiry!==null&&expiry!==undefined&&expiry!==""){
  if(typeof expiry!=="string")return "approval_expired";
  const parsed=Date.parse(expiry);
  if(!Number.isFinite(parsed)||parsed<=now.valueOf())return "approval_expired";
 }
 return "ready";
}
export function locatePneusFeed(header:string[],rows:readonly string[][]):string{
 const fields=["Advertiser ID","Membership Status","Feed ID","Datafeed Format","URL"];
 if(new Set(header).size!==header.length||!fields.every(f=>header.includes(f)))throw Error("invalid_inventory_header");
 const at=(name:string)=>header.indexOf(name);
 const matches=rows.filter(r=>r.length===header.length&&
  r[at("Advertiser ID")]?.trim()===PNEUS_ADVERTISER_ID&&
  r[at("Feed ID")]?.trim()===PNEUS_FEED_ID&&
  r[at("Membership Status")]?.trim().toLowerCase()==="active");
 if(matches.length!==1)throw Error("missing_or_ambiguous_active_feed");
 if(!/^(awin|standard)$/i.test(matches[0][at("Datafeed Format")]?.trim()??""))
  throw Error("unsupported_feed_format");
 return matches[0][at("URL")]?.trim()??"";
}
/** Product identities must be unique across batches, not merely within one batch. */
export function validatePneusIdentity(header:string[],cells:string[],seen:Set<string>){
 if(cells.length!==header.length)throw Error("invalid_product_columns");
 const idAt=header.includes("merchant_product_id")?header.indexOf("merchant_product_id"):header.indexOf("id");
 const advertiserAt=header.includes("merchant_id")?header.indexOf("merchant_id"):header.indexOf("advertiser_id");
 if(idAt<0||advertiserAt<0||cells[advertiserAt]!==PNEUS_ADVERTISER_ID)
  throw Error("cross_advertiser_product");
 const id=cells[idAt]?.trim()??"";
 if(!id||id.length>250||seen.has(id))throw Error("invalid_or_duplicate_product_id");
 seen.add(id);
}
export function pneusPrivateObjectKey(digest:string){
 if(!/^[a-f0-9]{64}$/.test(digest))throw Error("invalid_snapshot_sha256");
 return "pneus-online/15236/26513/"+digest+".csv.gz";
}

/** Awin 15236:26513 supplies a tyre catalogue but may omit currency.
 * Preserve its source prices as explicitly UNVERIFIED private exclusions.
 * Never infer GBP from UK membership or promote these rows to live offers.
 */
export function pneusPrivateHeader(header:string[]):{sourceCurrencyExplicit:boolean}{
 if(header.length<5||header.length>120||new Set(header).size!==header.length)
  throw Error("pneus_invalid_column_layout");
 const required=["merchant_id","merchant_product_id","product_name","search_price"];
 if(!required.every(field=>header.includes(field)))
  throw Error("pneus_required_fields_missing");
 if(header.includes("currency")){
  if(identifyFormat(header)!=="awin-csv")throw Error("pneus_unsupported_format");
  return {sourceCurrencyExplicit:true};
 }
 if(!header.includes("in_stock")&&!header.includes("stock_status"))
  throw Error("pneus_stock_evidence_missing");
 return {sourceCurrencyExplicit:false};
}

export function preparePneusPrivateBatch(advertiser:string,feed:string,header:string[],rows:string[][]){
 if(advertiser!==PNEUS_ADVERTISER_ID||feed!==PNEUS_FEED_ID)
  throw Error("pneus_exact_feed_required");
 const {sourceCurrencyExplicit}=pneusPrivateHeader(header);
 if(rows.some(row=>row.length!==header.length))throw Error("pneus_bad_row_shape");
 const projectedHeader=sourceCurrencyExplicit?header:[...header,"currency"];
 const projectedRows=sourceCurrencyExplicit?rows:rows.map(row=>[...row,""]);
 return prepareGeneralBatch(advertiser,feed,projectedHeader,projectedRows).map(row=>({
  ...row,
  status:!sourceCurrencyExplicit?"excluded" as const:row.status,
  reasons:!sourceCurrencyExplicit?[...new Set([...row.reasons,"explicit_currency_missing"])]:row.reasons,
  metadata:{...row.metadata,
   source_currency_explicit:sourceCurrencyExplicit,
   price_observation_kind:sourceCurrencyExplicit?"private_import":"private_unverified_currency",
   tyre_adapter:"pneus_online_private_v1",tyre_size_verified:false,
   tyre_fitment_verified:false,delivery_cost_verified:false,fitted_price_verified:false,
   release_approved:false,canonical_category_approved:false
  }
 }));
}
