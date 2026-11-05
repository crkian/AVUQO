/** Validate Awin's own product-feed URL without ever persisting or logging it.
 * Feed-list records are untrusted. This is an exact host, key and feed binding.
 */
export function approvedAwinDownloadUrl(value:string,key:string,feedId:string):string{
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{1,12}$/.test(feedId))
  throw Error("invalid_feed_binding");
 if(value.length>5000)throw Error("unsafe_feed_url");
 let url:URL;
 try{url=new URL(value);}catch{throw Error("unsafe_feed_url");}
 if(url.protocol!=="https:"||url.hostname!=="productdata.awin.com"||
    url.port||url.username||url.password||url.search||url.hash)
  throw Error("unsafe_feed_url");
 const parts=url.pathname.split("/");
 if(parts.length<10||
    parts[0]!==""||parts[1]!=="datafeed"||parts[2]!=="download"||
    parts[3]!=="apikey"||parts[4]!==key||parts[5]!=="fid"||
    parts[6]!==feedId||parts[7]!=="format"||parts[8]!=="csv")
  throw Error("feed_binding_mismatch");
 // Queryless canonical HTTPS URL, still ephemeral. Redirects remain forbidden
 // by the caller. Never return this value to browsers, logs or a database.
 return value;
}
