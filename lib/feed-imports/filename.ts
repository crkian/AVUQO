/**
 * Chrome/Windows may append a numbered duplicate suffix before the extension.
 * Keep the extension intact. Never use this display name alone to authorise a
 * merchant; the importer must also check every parsed feed-row advertiser ID.
 */
export function normalizedFeedFilename(filename:string):string{
 return filename.replace(/ \((?:[1-9]\d*)\)(?=\.csv(?:\.gz)?$)/i,"");
}
export function recognisedPilotMerchant(filename:string){
 const name=normalizedFeedFilename(filename);
 if(/^45747-retail-en_GB\.csv(?:\.gz)?$/i.test(name))return {id:"45747",name:"Craft Buddy Shop",google:true};
 if(/^736-48599-en_GB-Cadbury_Shopping_Feed\.csv(?:\.gz)?$/i.test(name))return {id:"736",name:"Cadbury Gifts Direct",google:false};
 if(/^datafeed_3135746\.csv(?:\.gz)?$/i.test(name))return {id:"77952",name:"Petlibro UK Affiliate Program",google:false};
 return null;
}
