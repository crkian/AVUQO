/** Read-only reconciliation of canonical accepted-programme evidence with feed state.
 * Affiliate programme acceptance is not a product-price or first-release approval.
 * No signed feed URLs, raw emails or private filenames are passed to the UI.
 */
export type AwinProgrammeEvidence={
 programme_name:string;external_account_id:string|null;status:string;
 metadata:unknown;
};
export type AwinFeedObservation={
 advertiser_id:string;feed_id:string;listed_products:number;observed_at:string;
 needs_private_refresh:boolean;
};
export type AwinJoinedSource={metadata:unknown;status:string;sync_enabled:boolean};
type Json=Record<string,unknown>;
const object=(v:unknown):Json=>v&&typeof v==="object"&&!Array.isArray(v)?v as Json:{};
export function acceptedAwinPortfolio(
 programmes:AwinProgrammeEvidence[],
 feeds:AwinFeedObservation[],
 source:AwinJoinedSource|null
){
 const sourceMeta=object(source?.metadata);
 const legacy=Array.isArray(sourceMeta.awin_advertisers)?sourceMeta.awin_advertisers.map(object):[];
 return programmes.filter(p=>object(p.metadata).joined_programme_observed===true).map(p=>{
  const meta=object(p.metadata),owner=object(meta.owner_joined_accepted_attestation);
  const id=p.external_account_id??"";
  const matching=feeds.filter(f=>id!==""&&f.advertiser_id===id);
  const joinedRegistry=legacy.some(a=>a.advertiser_id===id&&a.joined_programme_observed===true);
  const accepted=owner.membership_status==="accepted";
  const newest=matching.reduce((value,f)=>!value||f.observed_at>value?f.observed_at:value,"");
  return {
   programme:p.programme_name,advertiserId:id||null,
   membership:accepted?"accepted":"requires_attestation",
   membershipEvidence:typeof meta.membership_evidence==="string"?meta.membership_evidence:"recorded_in_programme",
   acceptedOn:typeof owner.attested_on==="string"?owner.attested_on:null,
   sourceRegistryLinked:joinedRegistry,
   liveFeeds:matching.length,
   listedProducts:matching.reduce((n,f)=>n+Math.max(0,Number(f.listed_products)||0),0),
   mostRecentFeedObservation:newest||null,
   needsFeedRefresh:matching.some(f=>f.needs_private_refresh),
   releaseStatus:p.status,
   publicationReady:false as const, // A feed list or accepted membership never authorises a live offer.
   next:!id?"Map exact advertiser ID":
     !joinedRegistry?"Link ID to old source registry":
     matching.length===0?"Identify usable live feed or service referral":
     "Verify live GBP prices, stock, tracking and first product release"
  };
 }).sort((a,b)=>a.programme.localeCompare(b.programme));
}
