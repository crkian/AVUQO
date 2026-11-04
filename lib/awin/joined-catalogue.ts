/**
 * Awin programme IDs independently observed in the owner's joined-programme
 * diagnostic on 2026-11-04. Membership is NOT a feed/image/publication licence.
 */
export const joinedAwinAdvertisers = [
 ["736","Cadbury Gifts Direct"],
 ["77952","Petlibro UK Affiliate Program"],
 ["45747","Craft Buddy Shop"],
 ["496","Tooled Up"],
 ["31539","Mozillion"],
 ["12715","Tyres UK"],
 ["15236","Tyres Pneus Online UK"],
 ["3496","Holiday Extras"],
 ["23296","Onestream"],
 ["25022","EPCs, Gas Safety Certificates and Electrical Check"],
 ["35299","Christmas Letters from Santa"],
 ["36276","AutoAid Breakdown"],
 ["37738","1pMobile"],
 ["115559","Chattr Sim Only"],
 ["118401","Compare Parking Prices UK"],
 ["128157","Lyca Mobile UK"]
] as const;
export function joinedName(advertiserId:string){
 return joinedAwinAdvertisers.find(([id])=>id===advertiserId)?.[1]??null;
}
export function joinedInSource(sourceMetadata:unknown,advertiserId:string){
 if(!sourceMetadata||typeof sourceMetadata!=="object"||Array.isArray(sourceMetadata))return false;
 const advertisers=(sourceMetadata as {awin_advertisers?:unknown}).awin_advertisers;
 return Array.isArray(advertisers)&&advertisers.some(entry=>
  Boolean(entry&&typeof entry==="object"&&!Array.isArray(entry)&&
  (entry as {advertiser_id?:unknown}).advertiser_id===advertiserId&&
  (entry as {joined_programme_observed?:unknown}).joined_programme_observed===true));
}
