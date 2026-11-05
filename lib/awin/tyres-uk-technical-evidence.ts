/**
 * Exact private Tyres UK standard Awin CSV evidence. This mapping has been
 * corroborated against all 29,026 rows containing complete standard
 * dimension/load/speed notation in the owner-supplied 86-column gzip export.
 * It is NOT proof of vehicle fitment or current feed accuracy.
 */
export function candidateTyresUkTechnicalSpecs(row:Record<string,string>){
 const width=row.custom_1?.trim()??"";
 const profile=row.custom_2?.trim()??"";
 const rim=row.custom_3?.trim()??"";
 const load=row.custom_4?.trim().toUpperCase()??"";
 const speed=row.custom_5?.trim().toUpperCase()??"";
 const desc=row.description??"";
 const pattern=/(?<!\d)(\d{3})\s*\/\s*(\d{2})\s*(?:ZR|R)\s*(\d{2})\s+(\d{2,3}(?:\/\d{2,3})?)([A-Z])\b/i;
 const matches=[...desc.matchAll(new RegExp(pattern.source,"gi"))];
 const wellFormed=/^\d{3}$/.test(width)&&/^\d{2}$/.test(profile)&&
  /^\d{2}$/.test(rim)&&/^\d{2,3}(?:\/\d{2,3})?$/.test(load)&&
  /^[A-Z]$/.test(speed);
 const same=matches.length===1&&wellFormed&&
  [width,profile,rim,load,speed].every((v,i)=>v===matches[0][i+1].toUpperCase());
 // Some commercial van tyres have e.g. 185 R14 102/100R without an
 // aspect ratio. Do not guess profile=80 or other missing specifications.
 return {
  source_columns:"custom_1...custom_5",
  column_semantics:"width_profile_rim_load_speed_candidate" as const,
  cross_checked_against_description:same,
  width_mm:same?Number(width):null,
  aspect_ratio:same?Number(profile):null,
  rim_inches:same?Number(rim):null,
  load_index_candidate:same?load:null,
  speed_rating_candidate:same?speed:null,
  load_index_verified:false as const,
  speed_rating_verified:false as const,
  fitment_verified:false as const,
  season_verified:false as const,
  tyre_label_verified:false as const,
  fitted_price_verified:false as const
 };
}
