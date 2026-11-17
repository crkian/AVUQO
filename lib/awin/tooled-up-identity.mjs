/** Shared canonical key input for EVERY Tooled Up item, including drafts.
 * SKU FIRST so slugify's 120-character cap cannot discard variant identity.
 */
export function tooledUpIdentityText(title,sourceRecordId){
 if(typeof title!=="string"||!title.trim()||
    typeof sourceRecordId!=="string"||!/^496:[A-Za-z0-9_.:-]{1,250}$/.test(sourceRecordId))
  throw new Error("invalid_tooled_up_sku_identity");
 return `Tooled Up SKU ${sourceRecordId} ${title.trim()}`;
}
