/** Authoritative, read-only Awin Publisher API currency evidence for Tooled Up.
 * Never trust Awin feed-list region or public retailer prices as currency proof.
 */
type AwinProgramme={id?:unknown;currencyCode?:unknown;status?:unknown;primaryRegion?:unknown};
export async function inspectTooledUpProgrammeCurrency(
 publisherId:string,accessToken:string,fetcher:typeof fetch=fetch
){
 if(!/^\d{3,15}$/.test(publisherId)||!accessToken||accessToken.length<16)
  throw Error("awin_programme_credentials_unavailable");
 const url=new URL(`https://api.awin.com/publishers/${publisherId}/programmes`);
 url.searchParams.set("relationship","joined");
 const res=await fetcher(url,{method:"GET",cache:"no-store",redirect:"error",
  signal:AbortSignal.timeout(15000),
  headers:{Authorization:`Bearer ${accessToken}`,Accept:"application/json"}});
 if(!res.ok)throw Error("awin_programme_request_failed");
 const size=Number(res.headers.get("content-length")||0);
 if(size>2_000_000)throw Error("awin_programme_response_limit");
 const reader=res.body?.getReader();
 if(!reader)throw Error("awin_programme_response_empty");
 const chunks:Uint8Array[]=[];let count=0;
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   count+=value.byteLength;
   if(count>2_000_000)throw Error("awin_programme_response_limit");
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(count);let i=0;
 for(const chunk of chunks){bytes.set(chunk,i);i+=chunk.length;}
 let raw:unknown;
 try{raw=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));}
 catch{throw Error("awin_programme_response_invalid");}
 if(!Array.isArray(raw))throw Error("awin_programme_response_invalid");
 const matches=(raw as AwinProgramme[]).filter(item=>item&&item.id===496);
 if(matches.length!==1)throw Error("tooled_up_joined_programme_missing_or_ambiguous");
 const programme=matches[0];
 const programmeCurrency=programme.currencyCode;
 if(typeof programmeCurrency!=="string"||!/^([A-Z]{3})$/.test(programmeCurrency))
  throw Error("tooled_up_programme_currency_missing");
 return {
  advertiser_id:"496" as const,feed_id:"89987" as const,
  programme_currency:programmeCurrency,
  currency_verified:programmeCurrency==="GBP",
  currency_source:"awin_joined_programme_currency_code",
  documentation_basis:"awin_hosted_feed_blank_currency_uses_programme_currency",
  ready_to_stage:false,rights_verified:false,no_publication:true,
  private_only:true,no_database_writes:true
 };
}
