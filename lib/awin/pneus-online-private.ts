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
 status?:unknown;sync_enabled?:unknown;metadata?:unknown;
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
export function pneusPrivateSourceGate(source:Source|null|undefined,now:Date=new Date()):PermissionGate{
 if(!source||source.status!=="paused"||source.sync_enabled!==false)return "source_not_paused";
 const data=object(source.metadata);
 const advertisers=data?.awin_advertisers;
 if(!Array.isArray(advertisers))return "programme_not_joined";
 const matching=advertisers.map(object).filter((r):r is Record<string,unknown>=>
  r!==null&&r.advertiser_id===PNEUS_ADVERTISER_ID&&r.joined_programme_observed===true);
 if(matching.length!==1)return "programme_not_joined";
 const entry=matching[0];
 if(entry.feed_permission_confirmed!==true)return "feed_permission_unconfirmed";
 if(typeof entry.approval_evidence_ref!=="string"||entry.approval_evidence_ref.trim().length<8)
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
