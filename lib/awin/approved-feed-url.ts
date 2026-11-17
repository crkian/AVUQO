/** Strictly bind a signed Awin feed URL to the current private publisher,
 * API key and exact feed ID. Never persist or log this credential-bearing URL.
 * Awin's Google-format feeds use its publisher-download host instead of the
 * standard productdata host. No redirects, query parameters or alien hosts.
 */
export function approvedAwinDownloadUrl(value:string,key:string,feedId:string,publisher="3135746"):string{
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!(/^[0-9]{1,12}$/.test(feedId)||/^F[0-9]{1,12}$/.test(feedId))||
    !/^[0-9]{3,15}$/.test(publisher))
  throw Error("invalid_feed_binding");
 if(value.length>5000)throw Error("unsafe_feed_url");
 let url:URL;
 try{url=new URL(value);}catch{throw Error("unsafe_feed_url");}
 if(url.protocol!=="https:"||url.port||url.username||url.password||url.search||url.hash||
    !["productdata.awin.com","ui.awin.com"].includes(url.hostname))
  throw Error("unsafe_feed_url");
 const parts=url.pathname.split("/");
 if(url.hostname==="productdata.awin.com"){
  if(parts.length<10||parts[0]!==""||parts[1]!=="datafeed"||parts[2]!=="download"||
     parts[3]!=="apikey"||parts[4]!==key||parts[5]!=="fid"||
     parts[6]!==feedId||parts[7]!=="format"||parts[8]!=="csv")
    throw Error("feed_binding_mismatch");
 }else{
  // Publisher-hosted Google feeds have a distinct exact signed path.
  // Do not accept feedList, other publishers or additional path segments.
  if(parts.length!==8||parts[0]!==""||
     parts[1]!=="productdata-darwin-download"||parts[2]!=="publisher"||
     parts[3]!==publisher||parts[4]!==key||parts[5]!=="1"||
     parts[6]!=="feed"||parts[7]!==feedId+".csv.gz")
    throw Error("feed_binding_mismatch");
 }
 return value;
}
