/** Preserve publisher-supplied Awin product imagery privately, with role and source evidence.
 * Does not confer image rights or mark a product publicly displayable.
 */
const IMAGE_FIELDS = [
 ['merchant_image_url','primary_merchant'],['aw_image_url','primary_awin'],
 ['image_link','primary_google'],['merchant_thumb_url','thumbnail_merchant'],
 ['aw_thumb_url','thumbnail_awin'],['large_image','large'],
 ['alternate_image','alternate'],['alternate_image_two','alternate_2'],
 ['alternate_image_three','alternate_3'],['alternate_image_four','alternate_4'],
 ['additional_image_link','additional_google'],['lifestyle_image_link','lifestyle_google']
];
const MAX_IMAGES=24;
function allowedUrl(value){
 if(typeof value!=='string'||!value||value.length>2048)return null;
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')return null;
  if(u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal')||
    /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(u.hostname))return null;
  return u.href;
 }catch{return null;}
}
export function collectAwinImages(fields, feedId){
 const output=[];const seen=new Set();
 for(const [field,role] of IMAGE_FIELDS){
  const raw=fields?.[field];
  // Google additional_image_link is often comma-separated; other fields are single URLs.
  const urls=field==='additional_image_link'&&typeof raw==='string'?raw.split(','): [raw];
  for(const candidate of urls){
   const url=allowedUrl(candidate?.trim());
   if(!url||seen.has(url))continue;
   seen.add(url);
   output.push({url,role,source_field:field,feed_id:feedId});
   if(output.length>=MAX_IMAGES)return output;
  }
 }
 return output;
}
export function selectAwinPrimaryImage(images){
 return Array.isArray(images)?(images.find(x=>x.role==='primary_merchant')||
  images.find(x=>x.role==='primary_awin')||
  images.find(x=>x.role==='primary_google')||images[0]||null):null;
}
