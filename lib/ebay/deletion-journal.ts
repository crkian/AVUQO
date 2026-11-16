import "server-only";
import {createHmac} from "node:crypto";
import {ebayAccountDigests} from "./deletion-identity";
import {createAdminClient} from "../supabase/admin";

type EventData={userId?:unknown;username?:unknown;eiasToken?:unknown};
function validated(value:unknown,max:number):string|null{
 return typeof value==="string" && value.length>=1 && value.length<=max &&
  !/[\x00-\x1f\x7f]/.test(value)?value:null;
}

/**
 * Only record a verified eBay notification, never raw user identifiers.
 * A successful insert is NOT account deletion completion.
 *
 * A separate future privacy processor must make deletion/suppression durable
 * and demonstrate legal-retention exclusions before a success response.
 */
export async function journalVerifiedEbayDeletion(
 notificationId:unknown,data:EventData
):Promise<"recorded"|"duplicate"|"unavailable">{
 const event=validated(notificationId,128);
 if(!event||!data||typeof data!=="object"||Array.isArray(data))return "unavailable";
 const identities=ebayAccountDigests(data);
 if(!identities)return "unavailable";
 const secret=process.env.EBAY_DELETION_HMAC_SECRET;
 if(!secret||secret.length<32||secret.length>512)return "unavailable";
 const digest=(label:string,value:string)=>createHmac("sha256",secret)
  .update(label+"\0"+value,"utf8").digest("hex");
 const row={
  notification_digest:digest("notificationId",event),
  ...identities,
  state:"pending_privacy_review" as const
 };
 try{
  const db=createAdminClient();
  const {error}=await db.from("ebay_deletion_receipts").insert(row);
  if(!error)return "recorded";
  if(error.code!=="23505")return "unavailable";
  // Do not silently ignore collision: check exactly one prior receipt.
  const {data:prior,error:lookupError}=await db.from("ebay_deletion_receipts")
   .select("notification_digest,user_id_digest,username_digest,eias_token_digest")
   .eq("notification_digest",row.notification_digest).maybeSingle();
  if(lookupError||!prior)return "unavailable";
  return prior.user_id_digest===row.user_id_digest &&
   prior.username_digest===row.username_digest &&
   prior.eias_token_digest===row.eias_token_digest?"duplicate":"unavailable";
 }catch{return "unavailable";}
}
