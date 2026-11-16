import "server-only";
import {createVerify} from "node:crypto";

/**
 * eBay notification signature verification. Based on eBay's own Node
 * event-notification SDK flow: decode X-EBAY-SIGNATURE JSON, resolve kid
 * through the fixed Notification API, verify canonical JSON message bytes.
 *
 * NOTE: This establishes authenticity ONLY. The route still returns 503
 * until deletion and durable acceptance have been completed.
 */
type SignatureEnvelope={kid:string;signature:string};
const KEY_TTL=60*60*1000;
const keyCache=new Map<string,{key:string;until:number}>();
const tokenCache:{token?:string;until?:number}={};

function parseSignature(header:string|null):SignatureEnvelope|null{
 if(!header||header.length>4096||!/^[A-Za-z0-9+/=]+$/.test(header))return null;
 try{
  const decoded=Buffer.from(header,"base64");
  if(decoded.length<20||decoded.length>2048)return null;
  const o=JSON.parse(decoded.toString("utf8"));
  if(!o||typeof o!=="object"||Array.isArray(o))return null;
  if(typeof o.kid!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(o.kid))return null;
  if(typeof o.signature!=="string"||o.signature.length>2048||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(o.signature))return null;
  return {kid:o.kid,signature:o.signature};
 }catch{return null;}
}

async function applicationToken():Promise<string>{
 const client=process.env.EBAY_CLIENT_ID;
 const secret=process.env.EBAY_CLIENT_SECRET;
 if(!client||!secret)throw new Error("eBay production OAuth not configured");
 if(tokenCache.token&&Date.now()<(tokenCache.until??0))return tokenCache.token;
 const basic=Buffer.from(client+":"+secret).toString("base64");
 const response=await fetch("https://api.ebay.com/identity/v1/oauth2/token",{
  method:"POST",
  headers:{"Authorization":"Basic "+basic,"Content-Type":"application/x-www-form-urlencoded"},
  body:"grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  signal:AbortSignal.timeout(8000),
  cache:"no-store"
 });
 if(!response.ok)throw new Error("eBay OAuth unavailable");
 const o=await response.json() as {access_token?:unknown;expires_in?:unknown};
 if(typeof o.access_token!=="string"||o.access_token.length<16)
  throw new Error("Invalid OAuth result");
 tokenCache.token=o.access_token;
 tokenCache.until=Date.now()+Math.min(Math.max(Number(o.expires_in)||300,60),7200)*1000-30_000;
 return o.access_token;
}

async function getPublicKey(kid:string):Promise<string>{
 const cached=keyCache.get(kid);
 if(cached&&cached.until>Date.now())return cached.key;
 const response=await fetch(
  "https://api.ebay.com/commerce/notification/v1/public_key/"+encodeURIComponent(kid),{
  headers:{"Authorization":"Bearer "+await applicationToken(),
   "Accept":"application/json"},
  cache:"no-store",signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw new Error("eBay signature key unavailable");
 const o=await response.json() as {key?:unknown};
 if(typeof o.key!=="string"||o.key.length>8192||o.key.length<60)
  throw new Error("Invalid eBay signature key");
 // The eBay SDK receives PEM without the usual newlines around markers.
 const key=o.key.replace("-----BEGIN PUBLIC KEY-----","-----BEGIN PUBLIC KEY-----\n")
  .replace("-----END PUBLIC KEY-----","\n-----END PUBLIC KEY-----");
 if(!key.includes("-----BEGIN PUBLIC KEY-----")||
  !key.includes("-----END PUBLIC KEY-----"))
  throw new Error("Invalid eBay public key");
 keyCache.set(kid,{key,until:Date.now()+KEY_TTL});
 if(keyCache.size>100)keyCache.delete(keyCache.keys().next().value!);
 return key;
}

export async function verifyEbaySignature(
 payload:unknown,header:string|null
):Promise<boolean>{
 const envelope=parseSignature(header);
 if(!envelope)return false;
 try{
  const key=await getPublicKey(envelope.kid);
  // eBay's published official Node validator uses the SHA-1 digest
  // for its EC notification signatures (constant 'ssl3-sha1').
  const verifier=createVerify("sha1");
  verifier.update(JSON.stringify(payload),"utf8");
  return verifier.verify(key,envelope.signature,"base64");
 }catch{return false;}
}
