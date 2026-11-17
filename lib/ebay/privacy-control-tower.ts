/**
 * AVUQO eBay privacy control-tower policy.
 *
 * This deliberately cannot grant permission to activate eBay or complete
 * provider deletion. Technical DB signals never substitute for signed eBay
 * provider evidence, full retention/processor review, and operator approval.
 */
export type CountEvidence={value:number|null;error:boolean};
export type SourceEvidence={
 status:string|null;syncEnabled:boolean|null;error:boolean
};
export type EbayPrivacySignals={
 source:SourceEvidence;
 receipts:CountEvidence;
 links:CountEvidence;
 catalogue:Record<"offers"|"source_ingestion_items"|"price_history"|"product_matches",CountEvidence>;
 workByState:Record<"pending"|"leased"|"awaiting_evidence"|"blocked",CountEvidence>;
 workBySurface:Record<
  "mapped_catalogue"|"indirect_identifiers"|"analytics_attribution"|
  "storage_media"|"application_cdn_logs"|"backups_restoration"|"external_processors",
  CountEvidence>;
 verificationTokenConfigured:boolean;
 endpointUrlMatches:boolean;
 browse:{environment:"sandbox"|"production";credentialsConfigured:boolean;productionFlag:boolean;campaignConfigured:boolean};
};
export const EBAY_WORK_SURFACES=[
 ["mapped_catalogue","Mapped catalogue and ownership"],
 ["indirect_identifiers","Indirect account identifiers"],
 ["analytics_attribution","Analytics and attribution"],
 ["storage_media","Stored media and files"],
 ["application_cdn_logs","Application and CDN logs"],
 ["backups_restoration","Backups and restoration"],
 ["external_processors","External processors"]
] as const;

export function ebayPrivacyReadiness(s:EbayPrivacySignals){
 const sourceQuarantined=!s.source.error&&
  s.source.status==="paused"&&s.source.syncEnabled===false;
 const counts=[
  s.receipts,s.links,...Object.values(s.catalogue),
  ...Object.values(s.workByState),...Object.values(s.workBySurface)
 ];
 const countsKnown=counts.every(c=>!c.error&&c.value!==null&&
  Number.isSafeInteger(c.value)&&c.value>=0);
 const journalReadable=Object.values(s.workByState).every(c=>!c.error&&c.value!==null);
 const activeWork=journalReadable?(s.workByState.pending.value??0)+
  (s.workByState.leased.value??0)+(s.workByState.blocked.value??0):null;
 const outstandingReview=journalReadable?(s.workByState.awaiting_evidence.value??0):null;
 const receiptCount=s.receipts.error?null:s.receipts.value;
 const configurationComplete=s.verificationTokenConfigured&&s.endpointUrlMatches;
 const receiptCountKnown=!s.receipts.error&&s.receipts.value!==null;
 // Aggregate counts are only a necessary signal. They cannot certify exact per-receipt
 // queue coverage or establish lawful erasure, even when all counts are zero.
 const queueAggregateComplete=receiptCountKnown&&s.receipts.value!>0&&
  Object.values(s.workBySurface).length===EBAY_WORK_SURFACES.length&&
  Object.values(s.workBySurface).every(c=>!c.error&&c.value===s.receipts.value);
 const browseConfigurationPresent=s.browse.environment==="production"&&
  s.browse.credentialsConfigured&&s.browse.productionFlag&&s.browse.campaignConfigured;
 // NEVER infer production eBay approval from local credentials and counts.
 const blockers=[
  ...(!sourceQuarantined?["Source quarantine not verified"] : []),
  ...(!countsKnown?["Database evidence unavailable or work journal unapplied"] : []),
  ...(!configurationComplete?["eBay verification configuration intentionally incomplete"] : []),
  ...(!queueAggregateComplete?["Seven-surface work queue coverage not evidenced"] : []),
  ...(!browseConfigurationPresent?["Production Browse credentials, approval flag or EPN campaign not fully configured"] : []),
  "Full account erasure and lawful retention are not independently certified",
  "Genuine provider-signed notification acceptance is not proven",
  "eBay subscription is not approved for activation"
 ];
 return {
  sourceQuarantined,countsKnown,journalReadable,activeWork,outstandingReview,
  receiptCount,configurationComplete,queueAggregateComplete,browseConfigurationPresent,
  registrationReady:false as const,
  completionAuthorised:false as const,
  blockers
 };
}
