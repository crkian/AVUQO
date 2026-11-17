import "server-only";
import {createAdminClient} from "../supabase/admin";
import {ebayPrivacyReadiness,EBAY_WORK_SURFACES} from "./privacy-control-tower";
import type {CountEvidence,EbayPrivacySignals,SourceEvidence} from "./privacy-control-tower";
import {ebayPilotReadiness} from "./private-uk-browse";

const statuses=["pending","leased","awaiting_evidence","blocked"] as const;
type Db=ReturnType<typeof createAdminClient>;
async function count(db:Db,table:string,filter?:[string,string]):Promise<CountEvidence>{
 try{
  let q=db.from(table).select("*",{count:"exact",head:true});
  if(filter)q=q.eq(filter[0],filter[1]);
  const {count,error}=await q;
  return {value:error?null:count??null,error:Boolean(error)||count===null};
 }catch{return {value:null,error:true};}
}
export async function loadEbayPrivacyControlTower(){
 const db=createAdminClient();
 let source:SourceEvidence={status:null,syncEnabled:null,error:true};
 let sourceId:string|null=null;
 try{
  const {data,error}=await db.from("sources")
   .select("id,status,sync_enabled").eq("connector_key","ebay").maybeSingle();
  if(!error&&data&&typeof data.id==="string"){
   sourceId=data.id;
   source={status:data.status,syncEnabled:data.sync_enabled,error:false};
  }
 }catch{ /* never treat provider errors as healthy */ }

 // Count only. Never fetch receipt digests, account identifiers, user events,
 // payloads, session IDs, log bodies, or eBay provider credentials.
 const [receipts,links,...queue]=await Promise.all([
  count(db,"ebay_deletion_receipts"),
  count(db,"ebay_account_item_links"),
  ...statuses.map(status=>count(db,"ebay_erasure_work_items",["state",status])),
  ...EBAY_WORK_SURFACES.map(([surface])=>
   count(db,"ebay_erasure_work_items",["surface",surface]))
 ]);
 const [offers,ingestion,price,matches]=await Promise.all([
  sourceId?count(db,"offers",["source_id",sourceId]):Promise.resolve({value:null,error:true}),
  sourceId?count(db,"source_ingestion_items",["source_id",sourceId]):Promise.resolve({value:null,error:true}),
  sourceId?count(db,"price_history",["source_id",sourceId]):Promise.resolve({value:null,error:true}),
  sourceId?count(db,"product_matches",["source_id",sourceId]):Promise.resolve({value:null,error:true})
 ]);
 const workByState=Object.fromEntries(statuses.map((key,i)=>[key,queue[i]])) as EbayPrivacySignals["workByState"];
 const workBySurface=Object.fromEntries(EBAY_WORK_SURFACES.map(([key],i)=>[
  key,queue[statuses.length+i]
 ])) as EbayPrivacySignals["workBySurface"];
 const signals:EbayPrivacySignals={
  source,receipts,links,
  catalogue:{offers,source_ingestion_items:ingestion,price_history:price,product_matches:matches},
  workByState,workBySurface,
  verificationTokenConfigured:Boolean(
   process.env.EBAY_DELETION_VERIFICATION_TOKEN&&
   /^[A-Za-z0-9_-]{32,80}$/.test(process.env.EBAY_DELETION_VERIFICATION_TOKEN)
  ),
  endpointUrlMatches:process.env.EBAY_DELETION_ENDPOINT_URL===
   "https://www.avuqo.com/api/ebay/account-deletion",
  browse:(()=>{
   const cfg=ebayPilotReadiness();
   return {environment:cfg.environment,credentialsConfigured:cfg.credentialsConfigured,
    productionFlag:cfg.productionApproved,campaignConfigured:cfg.campaignConfigured};
  })()
 };
 return {signals,readiness:ebayPrivacyReadiness(signals)};
}
