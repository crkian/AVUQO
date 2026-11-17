import {createHash} from 'node:crypto';
/** Shared SKU-scoped product identity for old private imports and live offers.
 * Digest goes FIRST so the 120-character slug cap cannot erase variant identity.
 * Full source SKU remains in private metadata for later independent GTIN grouping.
 */
export function tooledUpIdentityText(title,sourceRecordId){
 if(typeof title!=="string"||!title.trim()||
    typeof sourceRecordId!=="string"||!sourceRecordId.startsWith("496:")||
    sourceRecordId.length>254||sourceRecordId.length<5||
    /[\u0000-\u001f\u007f]/.test(sourceRecordId))
  throw new Error("invalid_tooled_up_sku_identity");
 const digest=createHash("sha256").update(sourceRecordId).digest("hex").slice(0,24);
 return `Tooled Up SKU ${digest} ${title.trim()}`;
}
