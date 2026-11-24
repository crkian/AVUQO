/** Display-only metadata from the exact independently admitted offer.
 * Never infer image rights, product specifications, delivery or discounts.
 */
const rec=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function retailText(v:unknown,max=160):string|null{
 if(typeof v!=="string")return null;
 const t=v.trim();
 return t.length>0&&t.length<=max&&!/[\u0000-\u001f\u007f]/.test(t)?t:null;
}
export function retailGallery(raw:unknown,sourceMetadata:unknown):string[]{
 const r=rec(raw),s=rec(sourceMetadata);
 if(s.image_rights_confirmed!==true||r.source_image_rights_confirmed!==true||!Array.isArray(r.permitted_image_gallery))return [];
 const feed=retailText(r.feed_id,30);
 if(!feed)return [];
 const result=new Set<string>();
 for(const value of r.permitted_image_gallery.slice(0,24)){
  const item=rec(value);
  if(item.feed_id!==feed||typeof item.url!=="string"||item.url.length>2048)continue;
  try{
   const u=new URL(item.url),host=u.hostname.toLowerCase();
   if(u.protocol!=="https:"||u.username||u.password||u.port||!host.includes(".")||
      host==="localhost"||host.endsWith(".local")||host.endsWith(".internal")||
      /^(?:\d+\.){3}\d+$/.test(host)||host.includes(":")||
      [...u.searchParams.keys()].some(k=>/token|signature|credential|api.?key|authorization|secret/i.test(k)))continue;
   result.add(u.href);
  }catch{}
 }
 return [...result];
}
export function retailDepartment(raw:unknown):string{
 const c=rec(rec(raw).catalogue_classification);
 return c.status==="classified"&&typeof c.department==="string"&&/^[a-z0-9-]{2,60}$/.test(c.department)?c.department:"";
}
