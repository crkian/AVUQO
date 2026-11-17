import {inspectAwinFeedList} from "./feed-list-audit.ts";
import type {SafeFeed} from "./feed-list-audit";

export type AwinLiveInventoryResult={
 rowsInspected:number;activeRows:number;activeOutsideJoined:number;
 invalidRows:number;feeds:SafeFeed[];
 byMerchant:{advertiserId:string;advertiserName:string;feedCount:number;allProductsFeedId:string|null}[];
 warning:string;tooledUpRule:string;
};

/**
 * Fetch the publisher-specific feed inventory directly from Awin.
 * This uses the separate DATAFEED key, not the OAuth publisher API token.
 * Never return/log the signed provider URL, full feed list, or key.
 * This is owner-only discovery, not product publication or rights approval.
 */
export async function fetchAwinLiveFeedInventory(joinedIds:ReadonlySet<string>):Promise<AwinLiveInventoryResult>{
 const publisherId=process.env.AWIN_PUBLISHER_ID;
 const key=process.env.AWIN_DATAFEED_API_KEY;
 if(!publisherId||!/^[0-9]{3,15}$/.test(publisherId)||!key||
  key.length>300||!/^[A-Za-z0-9_-]+$/.test(key))
  throw new Error("Awin feed-list credentials are unavailable or invalid");
 const url=new URL(
  `https://ui.awin.com/productdata-darwin-download/publisher/${encodeURIComponent(publisherId)}/${encodeURIComponent(key)}/1/feedList`
 );
 let response:Response;
 try{
  response=await fetch(url,{
   method:"GET",cache:"no-store",redirect:"error",
   headers:{"Accept":"text/csv,text/plain;q=0.9"},
   signal:AbortSignal.timeout(20000)
  });
 }catch{
  throw new Error("Awin feed-list connection failed or timed out");
 }
 if(!response.ok||!response.body)
  throw new Error("Awin feed list is unavailable (provider status "+response.status+")");
 const length=Number(response.headers.get("content-length"));
 if(Number.isFinite(length)&&length>2_500_000)
  throw new Error("Awin feed-list response is larger than 2.5 MB");
 const reader=response.body.getReader();
 const decoder=new TextDecoder("utf-8",{fatal:true});
 let bytes=0,text="";
 try{
  while(true){
   const {value,done}=await reader.read();
   if(done)break;
   bytes+=value.byteLength;
   if(bytes>2_500_000)throw new Error("Awin feed-list exceeds 2.5 MB limit");
   text+=decoder.decode(value,{stream:true});
  }
  text+=decoder.decode();
 }finally{
  await reader.cancel().catch(()=>{});
 }
 try{
  return inspectAwinFeedList(text,joinedIds);
 }catch{
  throw new Error("Awin feed-list response did not match the expected CSV structure");
 }
}
