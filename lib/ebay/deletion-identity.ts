import "server-only";
import {createHmac} from "node:crypto";

export type EbayAccountIdentifiers={
 userId?:unknown;
 username?:unknown;
 eiasToken?:unknown;
};
export type EbayDigestField="user_id_digest"|"username_digest"|"eias_token_digest";

export function validEbayIdentifier(value:unknown,maxLength:number):string|null{
 return typeof value==="string" && value.length>0 &&
  value.length<=maxLength && !/[\x00-\x1f\x7f]/.test(value)
  ?value:null;
}

/**
 * Keep domain separation exactly compatible with existing journal receipts.
 * HMAC key is server-side only and must remain stable while receipts exist.
 */
export function ebayAccountDigests(data:EbayAccountIdentifiers):
 Record<EbayDigestField,string|null>|null{
 const secret=process.env.EBAY_DELETION_HMAC_SECRET;
 if(!secret || secret.length<32 || secret.length>512)return null;
 if(data===null||typeof data!=="object"||Array.isArray(data))return null;
 const id=validEbayIdentifier(data.userId,256);
 const username=validEbayIdentifier(data.username,256);
 const eias=validEbayIdentifier(data.eiasToken,1024);
 if(!id&&!username&&!eias)return null;
 const digest=(domain:string,value:string)=>createHmac("sha256",secret)
  .update(domain+"\0"+value,"utf8").digest("hex");
 return {
  user_id_digest:id?digest("userId",id):null,
  username_digest:username?digest("username",username):null,
  eias_token_digest:eias?digest("eiasToken",eias):null
 };
}
