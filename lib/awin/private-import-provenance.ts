/** Currency provenance is supplied by the exact current normalized feed, never an old row. */
export type PilotCurrencySource="feed_column"|"petlibro_uk_programme_gbp"|"cadbury_uk_programme_gbp"|"playpress_uk_programme_gbp_private_only";
export function currentCurrencyEvidence(source:PilotCurrencySource,currency:string){
 return {currency_source:source,source_currency_explicit:source==="feed_column"&&currency==="GBP"};
}
/** The append RPC requires private unapproved records. Rights may be attached
 * only during the later exact authenticated digest recheck. */
export function privateImportProvenance(source:PilotCurrencySource,currency:string){
 return {...currentCurrencyEvidence(source,currency),import_actor:"awin_auto_import_worker",
  source_image_rights_confirmed:false,source_description_rights_confirmed:false,
  source_description_verified_digest:null,permission_status:"unverified"};
}
export function recheckedImageEvidence(approved:boolean,images:unknown){
 return {source_image_rights_confirmed:approved,
  image_permission_basis:approved?"owner_attested_all_accepted_programmes_2026_11_17":null,
  supplied_image_gallery:Array.isArray(images)?images:[]};
}
