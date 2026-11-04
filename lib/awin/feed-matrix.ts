import {joinedAwinAdvertisers} from "./joined-catalogue";
export type FeedMatrixItem={advertiserId:string;advertiserName:string;feedId:string;feedName:string;format:string;products:number;lastImported:string;language?:string};
export type FeedType="Standard / legacy"|"Google / enhanced"|"Other / inspect";
export function classifyFeedFormat(format:string):FeedType{
 const f=format.toLowerCase();
 if(/google|enhanced|merchant center|gmc/.test(f))return "Google / enhanced";
 if(/awin|legacy|csv|tab|standard/.test(f))return "Standard / legacy";
 return "Other / inspect";
}
export function buildAwinFeedMatrix(feeds:FeedMatrixItem[]){
 const groups=joinedAwinAdvertisers.map(([id,name])=>{
  const items=feeds.filter(f=>f.advertiserId===id).sort((a,b)=>
   classifyFeedFormat(a.format).localeCompare(classifyFeedFormat(b.format))
   ||b.products-a.products||a.feedId.localeCompare(b.feedId));
  const types=[...new Set(items.map(f=>classifyFeedFormat(f.format)))];
  return {id,name,items,types,count:items.length,listedProducts:items.reduce((n,f)=>n+f.products,0),
   fullRangeCandidates:items.filter(f=>/all products|full catalogue|full catalog|all items/i.test(f.feedName))};
 });
 return {groups,feedsCount:groups.reduce((n,g)=>n+g.count,0),
  programmesWithFeeds:groups.filter(g=>g.count>0).length,
  formatCounts:{
   standard:feeds.filter(f=>classifyFeedFormat(f.format)==="Standard / legacy").length,
   enhanced:feeds.filter(f=>classifyFeedFormat(f.format)==="Google / enhanced").length,
   other:feeds.filter(f=>classifyFeedFormat(f.format)==="Other / inspect").length
  }};
}
/** Safe, credential-free CSV for private import planning. Never include Awin URL fields. */
export function redactedFeedMatrixCsv(feeds:FeedMatrixItem[]){
 const quote=(s:string)=>String.fromCharCode(34)+s.replace(/^[=+@-]/,"'").replaceAll(String.fromCharCode(34),'""')+String.fromCharCode(34);
 const fields=["Advertiser ID","Advertiser","Feed ID","Feed name","Feed format","Format family","Products listed","Last imported","Language"];
 return [fields.map(quote).join(","),...feeds.map(f=>[
  f.advertiserId,f.advertiserName,f.feedId,f.feedName,f.format,classifyFeedFormat(f.format),
  String(f.products),f.lastImported,f.language??""
 ].map(quote).join(","))].join("\r\n");
}
