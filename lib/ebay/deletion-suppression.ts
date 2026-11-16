import "server-only";
import {createAdminClient} from "../supabase/admin";
import {ebayAccountDigests,type EbayAccountIdentifiers} from "./deletion-identity";

export type EbayAdmissionDecision="clear"|"suppressed"|"unavailable";

/**
 * This is a mandatory gate for any future eBay account-identified ingestion.
 * Never interpret unavailable as clear. A pending receipt also suppresses.
 * Identifiers must come from a trusted, authenticated eBay API record.
 */
export async function ebayDeletionSuppressionStatus(
 identifiers:EbayAccountIdentifiers
):Promise<EbayAdmissionDecision>{
 const digests=ebayAccountDigests(identifiers);
 if(!digests)return "unavailable";
 try{
  const db=createAdminClient();
  for(const [field,value] of Object.entries(digests)){
   if(!value)continue;
   const {data,error}=await db.from("ebay_deletion_receipts")
    .select("id").eq(field,value).limit(1);
   if(error)return "unavailable";
   if(!Array.isArray(data))return "unavailable";
   if(data.length>0)return "suppressed";
  }
  return "clear";
 }catch{return "unavailable";}
}

/**
 * Future eBay ingestion must call this prior to persisting user/seller content
 * and reject BOTH suppressed and unavailable. This helper has no network writes.
 */
export async function requireUnsuppressedEbayAccount(
 identifiers:EbayAccountIdentifiers
):Promise<boolean>{
 return await ebayDeletionSuppressionStatus(identifiers)==="clear";
}
