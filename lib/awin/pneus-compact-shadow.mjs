import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import {csvRowsFromChunks} from "../feed-imports/stream-csv.ts";
import {
 PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,PNEUS_MAX_DOWNLOADED,PNEUS_MAX_EXPANDED,
 PNEUS_MAX_ROWS,PNEUS_BATCH_SIZE,pneusPrivateHeader,validatePneusIdentity,
 preparePneusPrivateBatch
} from "./pneus-online-private.ts";

// Offline, private-only shadow replay. No DB client, network, archive deletion,
// or admission route. Caller must separately establish current source rights.
const VERSION="pneus-shadow-v1";
const SCOPE="awin:15236:26513";
const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
function canonical(value){
 if(value===null||typeof value==="string"||typeof value==="boolean")return JSON.stringify(value);
 if(typeof value==="number"&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&Object.getPrototypeOf(value)===Object.prototype)
  return "{"+Object.keys(value).sort().map(key=>JSON.stringify(key)+":"+canonical(value[key])).join(",")+"}";
 throw Error("unsupported_shadow_value");
}
const fingerprint=(kind,value)=>digest(VERSION+"\n"+kind+"\n"+canonical(value));
const terms=new Set(["rrp_price","store_price","sale_price","sale_price_effective_date",
 "saving","savings_percent","delivery_cost","delivery_time","shipping",
 "unit_pricing_measure","unit_pricing_base_measure","stock_quantity","valid_from","valid_to"]);
function splitRow(row){
 const {merchant_id,merchant_product_id,price,currency,status,reasons,metadata,...details}=row;
 if(merchant_id!==PNEUS_ADVERTISER_ID||metadata.feed_id!==PNEUS_FEED_ID||
  metadata.release_approved!==false||metadata.tyre_fitment_verified!==false||
  metadata.source_image_rights_confirmed!==false||metadata.source_description_rights_confirmed!==false||
  (metadata.source_currency_explicit!==true&&(status!=="excluded"||currency!=="")))
  throw Error("shadow_private_gate_failed");
 const {availability,availability_source,source_updated_at,source_catalogue_fields,
  source_currency_explicit,price_observation_kind,...contentMetadata}=metadata;
 const contentFields={},termFields={};
 for(const [key,value] of Object.entries(source_catalogue_fields)){
  (terms.has(key)?termFields:contentFields)[key]=value;
 }
 return {sku:merchant_product_id,sourceUpdatedAt:source_updated_at,
  content:{...details,metadata:{...contentMetadata,source_catalogue_fields:contentFields}},
  observation:{price,currency,status,reasons,availability,availability_source,
   source_currency_explicit,price_observation_kind,termFields}};
}
function addPayload(pool,kind,payload){
 const hash=fingerprint(kind,payload);
 if(!pool.has(hash))pool.set(hash,payload);
 else if(canonical(pool.get(hash))!==canonical(payload))throw Error("shadow_hash_collision");
 return hash;
}
function assertManifest(snapshot){
 if(snapshot?.version!==VERSION||snapshot.scope!==SCOPE||snapshot.privateOnly!==true||
  snapshot.noPublication!==true||!/^([a-f0-9]{64})$/.test(snapshot.sha256)||
  !Number.isFinite(Date.parse(snapshot.observedAt))||
  !(snapshot.members instanceof Map)||snapshot.members.size!==snapshot.expectedRows||
  snapshot.expectedRows<1||snapshot.expectedRows>PNEUS_MAX_ROWS||
  !(snapshot.contents instanceof Map)||!(snapshot.observations instanceof Map))
  throw Error("invalid_shadow_manifest");
}

/** The expected digest is SHA-256 of the decompressed bytes, exactly as the
 * existing Pneus worker records it. A complete validated count is mandatory.
 * This is a bounded in-memory pilot, not a durable transaction or lease.
 */
export async function replayPneusSnapshot({compressed,sha256,expectedRows,observedAt}){
 if(!(compressed instanceof Uint8Array)||compressed.length<2||compressed.length>PNEUS_MAX_DOWNLOADED||
  compressed[0]!==0x1f||compressed[1]!==0x8b||typeof sha256!=="string"||!/^[a-f0-9]{64}$/.test(sha256)||
  !Number.isSafeInteger(expectedRows)||expectedRows<1||expectedRows>PNEUS_MAX_ROWS||
  typeof observedAt!=="string"||!Number.isFinite(Date.parse(observedAt)))
  throw Error("invalid_shadow_input");
 const plain=gunzipSync(compressed,{maxOutputLength:PNEUS_MAX_EXPANDED});
 if(digest(plain)!==sha256)throw Error("shadow_digest_mismatch");
 const text=new TextDecoder("utf-8",{fatal:true}).decode(plain);
 const delimiter=text.slice(0,15000).split("\n",1)[0].includes("\t")?"\t":",";
 const seen=new Set(),members=new Map(),contents=new Map(),observations=new Map();
 let header=null,batch=[];
 let excluded=0;
 function flush(){
  if(!batch.length)return;
  const mapped=preparePneusPrivateBatch(PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,header,batch);
  for(const row of mapped){
   const {sku,sourceUpdatedAt,content,observation}=splitRow(row);
   if(members.has(sku))throw Error("shadow_duplicate_normalized_sku");
   const contentHash=addPayload(contents,"content",content);
   const observationHash=addPayload(observations,"observation",observation);
   members.set(sku,{contentHash,observationHash,sourceUpdatedAt});
   if(observation.status==="excluded")excluded++;
  }
  batch=[];
 }
 for await(const cells of csvRowsFromChunks((async function*(){yield text;})(),delimiter,120,10000)){
  if(!header){header=cells.map(x=>x.trim());pneusPrivateHeader(header);continue;}
  validatePneusIdentity(header,cells,seen);
  if(seen.size>expectedRows)throw Error("shadow_count_mismatch");
  batch.push(cells);
  if(batch.length===PNEUS_BATCH_SIZE)flush();
 }
 flush();
 if(!header||seen.size!==expectedRows||members.size!==expectedRows)throw Error("shadow_count_mismatch");
 const snapshot={version:VERSION,scope:SCOPE,privateOnly:true,noPublication:true,
  sha256,expectedRows,observedAt:new Date(observedAt).toISOString(),excluded,members,contents,observations};
 assertManifest(snapshot);
 return snapshot;
}

/** Reconstruct the exact normalized private row (not the original CSV bytes).
 * Original bytes remain in the immutable archive. Verify both payload hashes.
 */
export function restorePneusRow(snapshot,sku){
 assertManifest(snapshot);
 const member=snapshot.members.get(sku);
 if(!member)throw Error("shadow_sku_missing");
 const c=snapshot.contents.get(member.contentHash),o=snapshot.observations.get(member.observationHash);
 if(!c||!o||fingerprint("content",c)!==member.contentHash||
  fingerprint("observation",o)!==member.observationHash)throw Error("shadow_payload_mismatch");
 const {metadata,...details}=c;
 const {source_catalogue_fields,...otherMetadata}=metadata;
 const {price,currency,status,reasons,termFields,...evidence}=o;
 return structuredClone({merchant_id:PNEUS_ADVERTISER_ID,merchant_product_id:sku,...details,
  price,currency,status,reasons,metadata:{...otherMetadata,...evidence,
   source_updated_at:member.sourceUpdatedAt,source_catalogue_fields:{...source_catalogue_fields,...termFields}}});
}

/** Compare only two complete manifests of the same source. A missing SKU is
 * absence from this feed, not an asserted public stock withdrawal.
 */
export function comparePneusSnapshots(previous,current){
 assertManifest(previous);assertManifest(current);
 if(Date.parse(current.observedAt)<=Date.parse(previous.observedAt))throw Error("shadow_snapshot_order");
 const result={added:0,absent:0,unchanged:0,contentChanged:0,observationChanged:0,
  bothChanged:0,sourceTimestampOnly:0,privateOnly:true,noPublication:true};
 for(const [sku,member] of current.members){
  const prior=previous.members.get(sku);
  if(!prior){result.added++;continue;}
  const content=prior.contentHash!==member.contentHash;
  const observation=prior.observationHash!==member.observationHash;
  if(content&&observation)result.bothChanged++;
  else if(content)result.contentChanged++;
  else if(observation)result.observationChanged++;
  else if(prior.sourceUpdatedAt!==member.sourceUpdatedAt)result.sourceTimestampOnly++;
  else result.unchanged++;
 }
 for(const sku of previous.members.keys())if(!current.members.has(sku))result.absent++;
 return result;
}


/** Compare the exact normalized insert contract, including metadata and rights.
 * PostgreSQL numeric transport may return number instead of decimal string.
 * No other differences are discarded; historical adapter drift must fail parity.
 */
export function compareLegacyPneusRow(replayed,legacy){
 const price=value=>{
  if(value===null)return null;
  if(typeof value!=="number"&&typeof value!=="string")throw Error("invalid_legacy_price");
  const raw=String(value);
  if(!/^\d+(?:\.\d{1,2})?$/.test(raw))throw Error("invalid_legacy_price");
  return Number(raw).toFixed(2);
 };
 const fields=["merchant_id","merchant_product_id","awin_product_id","title","price","currency",
  "brand","category","status","reasons","image_url","metadata"];
 try{
  const project=row=>Object.fromEntries(fields.map(key=>[key,key==="price"?price(row[key]):row[key]]));
  return canonical(project(replayed))===canonical(project(legacy));
 }catch{return false;}
}
