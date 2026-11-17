/**
 * Reconcile historic Awin joined-programme evidence with CURRENT internal
 * release permissions. Membership and publication are separate legal states.
 * Pure, owner-dashboard-only evidence summary: never activates a source or
 * publishes an offer and never exposes credentials.
 */
import {joinedAwinAdvertisers,joinedInSource} from "./joined-catalogue.ts";
import {advertisersFromMetadata} from "./advertiser-onboarding.ts";

export type AwinProgrammeEvidence={
 external_account_id:string|null;programme_name:string;status:string;
 terms_checked_at:string|null;
};
export type AwinImportEvidence={
 merchant_id:string;merchant_name:string;status:string;
 permission_status:string;total_count:number;
};
export type AwinJoinedReleaseRow={
 id:string;name:string;joinedObserved:boolean;
 internalStatus:string;termsChecked:boolean;historicalImportRows:number;
 privateImportRuns:number;feedRightsRecorded:boolean;
 advertiserEvidenceRecorded:boolean;permissionExpiresInFuture:boolean;
 needsEvidence:string[];
};

export function reconcileJoinedAwin(
 sourceMetadata:unknown,
 programmes:readonly AwinProgrammeEvidence[],
 imports:readonly AwinImportEvidence[],
 now=Date.now()
):AwinJoinedReleaseRow[]{
 const advertisers=advertisersFromMetadata(sourceMetadata);
 const byId=new Map(programmes.filter(p=>p.external_account_id)
  .map(p=>[p.external_account_id!,p]));
 return joinedAwinAdvertisers.map(([id,name])=>{
  const membership=joinedInSource(sourceMetadata,id);
  const permission=advertisers.find(a=>a.advertiser_id===id);
  const programme=byId.get(id);
  const runs=imports.filter(r=>r.merchant_id===id);
  const expires=permission?.valid_until;
  const validUntil=typeof expires==="string"&&Date.parse(expires+"T23:59:59Z")>now;
  const feedRights=permission?.feed_permission_confirmed===true;
  const ref=typeof permission?.approval_evidence_ref==="string"&&
   permission.approval_evidence_ref.trim().length>=8;
  const issues=[
   ...(!membership?["Historical joined membership not observed in source registry"]:[]),
   ...(!programme||programme.status!=="approved"?["Internal affiliate programme release is not approved"]:[]),
   ...(!feedRights?["Feed/price-data use permission not yet recorded"]:[]),
   ...(!ref?["Advertiser approval evidence reference missing"]:[]),
   ...(!validUntil?["Current permission expiry not recorded"]:[]),
   ...(runs.length>0&&runs.some(r=>r.permission_status!=="verified")?
     ["Private import permissions remain unverified"]:[]),
  ];
  return {
   id,name,joinedObserved:membership,
   internalStatus:programme?.status??"not recorded",
   termsChecked:Boolean(programme?.terms_checked_at),
   historicalImportRows:runs.reduce((n,r)=>n+Math.max(0,Number(r.total_count)||0),0),
   privateImportRuns:runs.length,
   feedRightsRecorded:feedRights,
   advertiserEvidenceRecorded:Boolean(ref),
   permissionExpiresInFuture:Boolean(validUntil),
   needsEvidence:issues,
  };
 });
}
