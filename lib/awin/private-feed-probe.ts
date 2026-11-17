/**
 * Owner-only Awin Enhanced Feed connectivity probe for a joined advertiser.
 * This does not share the frozen ingestion connector or persist/feed any rows.
 * A successful response is neither commercial permission nor price evidence.
 */
export async function probeAwinEnhancedFeed(advertiserId:string):Promise<"available"|"empty"|"unavailable">{
 if(!/^[0-9]{2,12}$/.test(advertiserId))return "unavailable";
 const publisherId=process.env.AWIN_PUBLISHER_ID;
 const token=process.env.AWIN_ACCESS_TOKEN;
 if(!publisherId||!token||!/^[0-9]{3,15}$/.test(publisherId))return "unavailable";
 const locale=process.env.AWIN_LOCALE||"en_GB";
 if(!/^[a-z]{2}_[A-Z]{2}$/.test(locale))return "unavailable";
 const endpoint=new URL(
  `https://api.awin.com/publishers/${encodeURIComponent(publisherId)}/awinfeeds/download/${encodeURIComponent(advertiserId)}-retail-${locale}.jsonl`
 );
 try{
  const response=await fetch(endpoint,{
   method:"GET",
   headers:{Authorization:`Bearer ${token}`,Accept:"application/x-ndjson, application/json"},
   cache:"no-store",signal:AbortSignal.timeout(15000),
  });
  if(!response.ok||!response.body)return "unavailable";
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let bytes=0,buffer="",seen=0,found=false;
  try{
   while(bytes<65536&&seen<20&&!found){
    const {value,done}=await reader.read();
    if(done)break;
    bytes+=value.byteLength;
    if(bytes>65536)break;
    buffer+=decoder.decode(value,{stream:true});
    let newline=buffer.indexOf("\n");
    while(newline>=0&&seen<20){
     const line=buffer.slice(0,newline).trim();
     buffer=buffer.slice(newline+1);
     if(line){
      seen++;
      try{
       const row=JSON.parse(line) as Record<string,unknown>;
       const id=row.id??row.aw_product_id??row.merchant_product_id;
       const title=row.title??row.product_name??row.name;
       const price=row.sale_price??row.price??row.search_price??row.store_price;
       if(typeof id==="string"&&id.trim()&&typeof title==="string"&&title.trim()&&
          (typeof price==="number"||typeof price==="string"||typeof price==="object"&&price!==null)){
        found=true;break;
       }
      }catch{/* Untrusted malformed row is not evidence of a valid feed. */}
     }
     newline=buffer.indexOf("\n");
    }
   }
   // JSONL may end without a trailing newline.
   if(!found&&buffer.trim()&&seen<20){
    try{
     const row=JSON.parse(buffer.trim()) as Record<string,unknown>;
     found=Boolean((row.id??row.aw_product_id??row.merchant_product_id)&&
      (row.title??row.product_name??row.name)&&(row.sale_price??row.price??row.search_price??row.store_price));
    }catch{/* Do not disclose parse errors or provider response contents. */}
   }
  }finally{await reader.cancel().catch(()=>{});}
  return found?"available":"empty";
 }catch{return "unavailable";}
}
