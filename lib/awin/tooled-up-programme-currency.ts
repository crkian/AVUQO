/** Read-only Tooled-Up advertiser currency evidence from Awin's joined-programmes API.
 * This DOES NOT validate current feed IDs, products, prices, image licences or source activation.
 */
type AwinProgramme={id?:unknown;currencyCode?:unknown};
export async function inspectTooledUpProgrammeCurrency(
 publisherId:string,accessToken:string,fetcher:typeof fetch=fetch
){
 if(!/^\d{3,15}$/.test(publisherId)||!accessToken||accessToken.length<16)
  throw new Error("awin_programme_credentials_unavailable");
 const url=new URL(`https://api.awin.com/publishers/${publisherId}/programmes`);
 url.searchParams.set("relationship","joined");
 const response=await fetcher(url,{
  method:"GET",cache:"no-store",redirect:"error",
  signal:AbortSignal.timeout(15000),
  headers:{Authorization:`Bearer ${accessToken}`,Accept:"application/json"}
 });
 if(!response.ok)throw new Error("awin_programme_request_failed");
 const headerBytes=Number(response.headers.get("content-length")||0);
 if(headerBytes>2_000_000)throw new Error("awin_programme_response_limit");
 const reader=response.body?.getReader();
 if(!reader)throw new Error("awin_programme_response_empty");
 const chunks:Uint8Array[]=[];let total=0;
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.byteLength;
   if(total>2_000_000)throw new Error("awin_programme_response_limit");
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(total);let offset=0;
 for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength;}
 let body:unknown;
 try{body=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));}
 catch{throw new Error("awin_programme_response_invalid");}
 if(!Array.isArray(body))throw new Error("awin_programme_response_invalid");
 const matches=(body as AwinProgramme[]).filter(row=>row&&row.id===496);
 if(matches.length!==1)throw new Error("tooled_up_joined_programme_missing_or_ambiguous");
 const rawCurrency=matches[0].currencyCode;
 if(typeof rawCurrency!=="string"||! /^[A-Z]{3}$/.test(rawCurrency))
  throw new Error("tooled_up_programme_currency_missing");
 return {
  advertiser_id:"496" as const,
  programme_currency:rawCurrency,
  currency_verified:rawCurrency==="GBP",
  currency_source:"awin_joined_programme_currency_code" as const,
  feed_identity_verified:false as const,
  feed_data_currency_verified:false as const,
  image_rights_verified:false as const,
  ready_to_stage:false as const,
  public_offer_approved:false as const,
  private_only:true as const,
  no_database_writes:true as const
 };
}
