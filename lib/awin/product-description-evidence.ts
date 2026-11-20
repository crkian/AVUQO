/** Awin-supplied prose is commercial source data, not AVUQO editorial copy.
 * Capture it only in private stage; release requires separate text-use rights
 * and an exact freshly authenticated feed digest. Never invent missing facts.
 */
const descriptionKeys=["description","structured_description","product_short_description"] as const;
const entities:Record<string,string>={amp:"&",quot:'"',apos:"'",lt:"<",gt:">",nbsp:" "};
export function cleanAwinDescription(value:unknown):string|null{
 if(typeof value!=="string"||value.length>10000)return null;
 const cleaned=value
  .replace(/<(script|style|iframe|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi," ")
  .replace(/<[^>]*>/g," ")
  .replace(/&(?:amp|quot|apos|lt|gt|nbsp|#39|#x27);/gi,entity=>{
   const key=entity.slice(1,-1).toLowerCase();
   return key==="#39"||key==="#x27"?"'":entities[key]??" ";
  })
  .replace(/[\u0000-\u001f\u007f]+/g," ")
  .replace(/\s+/g," ").trim();
 if(cleaned.length<32||/^(?:n\/?a|no description|description not available|tbc|coming soon)$/i.test(cleaned))return null;
 if(/^https?:\/\/\S+$/i.test(cleaned))return null;
 return cleaned.length>1800?cleaned.slice(0,1800).trimEnd():cleaned;
}
export function privateAwinDescription(row:Record<string,string>):string|null{
 for(const key of descriptionKeys){
  const text=cleanAwinDescription(row[key]);
  if(text)return text;
 }
 return null;
}
const record=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function publicAwinDescription(metadata:unknown,verifiedDigest:string):string|null{
 const m=record(metadata);
 if(m.source_description_rights_confirmed!==true||
    m.source_description_verified_digest!==verifiedDigest||
    !/^[a-f0-9]{64}$/.test(verifiedDigest))return null;
 return cleanAwinDescription(m.source_description);
}
