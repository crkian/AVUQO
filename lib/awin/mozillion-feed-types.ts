/** Exact Awin feed IDs, not merchant-wide assumptions. All are private until
 * independently licensed and provided with a format-specific validator.
 */
export const MOZILLION_FEED_CLASSES={
 "74135":{kind:"physical_handset",name:"Mozillion SIM Free Phones",auto_import_allowed:true},
 "97090":{kind:"monthly_contract_phone",name:"Pay Monthly Contract Phones",auto_import_allowed:false},
 "97136":{kind:"sim_only_plan",name:"SIM Only Plans Hosted Feed",auto_import_allowed:false},
 "114910":{kind:"travel_esim",name:"Mozillion Travel eSIM Feed",auto_import_allowed:false},
 "118311":{kind:"monthly_sim_only",name:"Pay Monthly Plus SIM Only Plans",auto_import_allowed:false}
} as const;

export function mozillionPhysicalFeedAllowed(advertiserId:string,feedId:string,feedName:string){
 if(advertiserId!=="31539"||feedId!=="74135")return false;
 return feedName.trim().toLowerCase()===MOZILLION_FEED_CLASSES["74135"].name.toLowerCase();
}
