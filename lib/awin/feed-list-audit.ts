/** Private, redacted inspection of Awin's Product Feed List Download CSV.
 * This module NEVER returns or persists URL values, which can be bearer credentials.
 * A source row being "active" is neither a publication right nor a successful fetch.
 */
export type SafeFeed={advertiserId:string;advertiserName:string;feedId:string;feedName:string;format:string;products:number;lastImported:string;lastChecked:string;language:string;tooledUpFilenameMustBeChecked:boolean};
const required=["Advertiser ID","Advertiser Name","Membership Status","Datafeed Format","Feed ID","Feed Name","Last Imported","Last Checked","No of products","URL"];
function csvMatrix(text:string):string[][]{
 const result:string[][]=[];let line:string[]=[],value="",quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quoted){if(ch==='"'&&text[i+1]==='"'){value+='"';i++;}else if(ch==='"')quoted=false;else value+=ch;}
  else if(ch==='"')quoted=true;
  else if(ch===','){line.push(value);value="";}
  else if(ch==='\n'){line.push(value.replace(/\r$/,""));if(line.some(x=>x.trim()))result.push(line);line=[];value="";}
  else value+=ch;
 }
 if(quoted)throw new Error("Unterminated CSV quotation");
 if(line.length||value){line.push(value);if(line.some(x=>x.trim()))result.push(line);}
 return result;
}
export function inspectAwinFeedList(content:string,joinedIds:ReadonlySet<string>){
 if(content.length>2_500_000)throw new Error("Feed inventory is larger than the 2.5 MB inspection limit");
 const [rawHeader,...rows]=csvMatrix(content.replace(/^\uFEFF/,""));
 if(!rawHeader)throw new Error("Feed inventory CSV is empty");
 const header=rawHeader.map(x=>x.trim());
 // Ambiguous headers can redirect identity or status lookups to the wrong cell.
 if(header.some(name=>!name)||new Set(header).size!==header.length)
  throw new Error("Feed inventory has duplicate or empty column names");
 for(const key of required)if(!header.includes(key))throw new Error("Feed inventory is missing column: "+key);
 if(rows.length>5000)throw new Error("Feed inventory exceeds the 5,000-row inspection limit");
 const index=(k:string)=>header.indexOf(k);
 const unique=new Map<string,SafeFeed>();const feeds:SafeFeed[]=[];
 let activeOutsideJoined=0,invalidRows=0,totalActive=0;
 for(const cells of rows){
  if(cells.length!==header.length){invalidRows++;continue;}
  const get=(k:string)=>(cells[index(k)]??"").trim();
  if(get("Membership Status").toLowerCase()!=="active")continue;
  totalActive++;
  const advertiserId=get("Advertiser ID"),feedId=get("Feed ID");
  if(!/^\d+$/.test(advertiserId)||!/^([A-Za-z]?\d+)$/.test(feedId)){invalidRows++;continue;}
  if(!joinedIds.has(advertiserId)){activeOutsideJoined++;continue;}
  const key=advertiserId+":"+feedId;
  const rawProducts=get("No of products");
  const n=Number(rawProducts);
  // Empty or malformed counts must not masquerade as a genuine empty feed.
  if(!/^\d+$/.test(rawProducts)||!Number.isSafeInteger(n)||n<0){invalidRows++;continue;}
  const safe:SafeFeed={advertiserId,advertiserName:get("Advertiser Name").slice(0,120),
   feedId,feedName:get("Feed Name").slice(0,120),format:get("Datafeed Format").slice(0,40),
   products:n,
   lastImported:get("Last Imported").slice(0,32),lastChecked:get("Last Checked").slice(0,32),
   language:get("Language").slice(0,45),
   tooledUpFilenameMustBeChecked:advertiserId==="496"
  };
  const prior=unique.get(key);
  if(prior){
   // Ignore signed URL differences. They are credentials, not feed identity.
   // Other conflicting fields make the inventory ambiguous and must fail.
   if(JSON.stringify(prior)!==JSON.stringify(safe))invalidRows++;
   continue;
  }
  unique.set(key,safe);
  feeds.push(safe);
 }
 const byMerchant=[...new Map(feeds.map(f=>[f.advertiserId,f.advertiserName])).entries()].map(([id,name])=>({
  advertiserId:id,advertiserName:name,feedCount:feeds.filter(f=>f.advertiserId===id).length,
  allProductsFeedId:id==="496"?(feeds.find(f=>f.advertiserId===id&&f.feedName==="All Products")?.feedId??null):null
 })).sort((a,b)=>b.feedCount-a.feedCount||a.advertiserName.localeCompare(b.advertiserName));
 return {rowsInspected:rows.length,activeRows:totalActive,activeOutsideJoined,invalidRows,feeds,byMerchant,
  warning:"Feed inventory inspected without downloading or saving credential-bearing URLs. Awin active status does not prove merchant publication permission.",
  tooledUpRule:"Tooled-Up: only feeds with underlying filenames beginning awinnew may be used. Feed display names and IDs alone do not prove filename compliance. Prefer full range once; do not union overlapping brand/category feeds without deduplication."};
}

/** Retailer notice 4 Nov 2026: obsolete Tooled-Up feeds were deleted.
 * Apply to a verified underlying filename, NOT a feed display label/ID or signed URL.
 */
export function currentTooledUpFilename(filename:string):boolean{
 return /^awinnew(?:_brand_[a-z0-9]+(?:-[a-z0-9]+)*|_cat_[a-z0-9]+(?:-[a-z0-9]+)*)?\.txt(?:\.gz)?$/i.test(filename);
}
