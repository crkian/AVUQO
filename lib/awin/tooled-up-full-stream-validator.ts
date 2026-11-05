import {createHash} from "node:crypto";
import {csvRowsFromChunks} from "../feed-imports/stream-csv";
import {TOOLED_UP_SOURCE_FIELDS} from "./tooled-up-master-adapter";

const MAX_COMPRESSED_BYTES=250*1024*1024;
const MAX_EXPANDED_BYTES=1024*1024*1024;
const MAX_PRODUCT_ROWS=500_000;
const OWN_PUBLISHER="3135746";

function validTracking(value:string){
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.username||u.password||u.port||
     !["awin1.com","www.awin1.com"].includes(u.hostname)||u.href.length>2048)return false;
  return (u.pathname==="/pclick.php"&&u.searchParams.get("m")==="496"&&
    u.searchParams.get("a")===OWN_PUBLISHER&&Boolean(u.searchParams.get("p")))||
    (u.pathname==="/cread.php"&&u.searchParams.get("awinmid")==="496"&&
    u.searchParams.get("awinaffid")===OWN_PUBLISHER);
 }catch{return false;}
}

/**
 * Exhaustive source diagnostics, never an import approval.
 * Reads a gzip CSV stream once with size limits and hashes the ORIGINAL
 * compressed bytes, including all bytes through the gzip trailer.
 * The report contains aggregate metrics only, never source row values.
 * No storage, database or network operations occur in this function.
 */
export async function validateTooledUpGzipStream(source:ReadableStream<Uint8Array>){
 let compressed=0,expanded=0;
 const hash=createHash("sha256");
 const limitedSource=source.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
  transform(bytes,controller){
   compressed+=bytes.byteLength;
   if(compressed>MAX_COMPRESSED_BYTES)throw Error("compressed_size_limit");
   hash.update(bytes);
   controller.enqueue(bytes);
  }
 }));
 const expandedStream=limitedSource.pipeThrough(
  new DecompressionStream("gzip") as unknown as ReadableWritablePair<Uint8Array,Uint8Array>
 ).pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
  transform(bytes,controller){
   expanded+=bytes.byteLength;
   if(expanded>MAX_EXPANDED_BYTES)throw Error("expanded_size_limit");
   controller.enqueue(bytes);
  }
 }));
 const decoder=new TextDecoder("utf-8",{fatal:true});
 const text=expandedStream.pipeThrough(new TransformStream<Uint8Array,string>({
  transform(bytes,controller){
   const chunk=decoder.decode(bytes,{stream:true});
   if(chunk)controller.enqueue(chunk);
  },
  flush(controller){
   const rest=decoder.decode();
   if(rest)controller.enqueue(rest);
  }
 }));
 const reader=text.getReader();
 let header:string[]|null=null;
 let rowCount=0,wrongMerchant=0,wrongFeed=0,missingId=0,duplicates=0;
 let badPrice=0,badTracking=0,missingTitle=0,outOfStock=0;
 const ids=new Set<string>();
 try{
  const chunks=(async function*(){
   try{
    for(;;){
     const {value,done}=await reader.read();
     if(done)break;
     yield value;
    }
   }finally{await reader.cancel().catch(()=>{});}
  })();
  for await(const row of csvRowsFromChunks(chunks,",",120)){
   if(!header){
    header=row.map(v=>v.trim());
    if(header.length!==TOOLED_UP_SOURCE_FIELDS.length||
       new Set(header).size!==header.length||
       !TOOLED_UP_SOURCE_FIELDS.every(name=>header!.includes(name)))
     throw Error("tooled_up_schema_mismatch");
    continue;
   }
   if(row.length!==header.length)throw Error("tooled_up_row_columns");
   rowCount++;
   if(rowCount>MAX_PRODUCT_ROWS)throw Error("too_many_product_rows");
   const value=(name:string)=>row[header!.indexOf(name)]?.trim()??"";
   if(value("merchant_id")!=="496")wrongMerchant++;
   if(value("data_feed_id")!=="89987")wrongFeed++;
   const id=value("merchant_product_id");
   if(!id||id.length>250)missingId++;
   else if(ids.has(id))duplicates++;
   else ids.add(id);
   const price=value("search_price");
   if(!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(price)||
      !Number.isFinite(Number(price))||Number(price)<=0||Number(price)>=10_000_000)badPrice++;
   if(!validTracking(value("aw_deep_link")))badTracking++;
   if(!value("product_name"))missingTitle++;
   if(["out of stock","unavailable","out_of_stock","0","no","false"].includes(
      value("stock_status").toLowerCase()))outOfStock++;
  }
 }finally{reader.releaseLock();}
 if(!header||rowCount===0||!compressed)throw Error("empty_or_invalid_feed");
 const critical=wrongMerchant+wrongFeed+missingId+duplicates+badPrice+badTracking+missingTitle;
 return {
  status:"validated_private_diagnostics",
  advertiser_id:"496",feed_id:"89987",
  source_columns:header.length,
  actual_rows:rowCount,expected_inventory_rows:84245,
  inventory_count_matches:rowCount===84245,
  estimated_chunks:Math.ceil(rowCount/250),
  compressed_bytes:compressed,expanded_bytes:expanded,
  snapshot_sha256:hash.digest("hex"),
  wrong_merchant_rows:wrongMerchant,wrong_feed_rows:wrongFeed,
  missing_product_ids:missingId,duplicate_product_ids:duplicates,
  invalid_price_rows:badPrice,unverified_affiliate_links:badTracking,
  missing_titles:missingTitle,out_of_stock_rows:outOfStock,
  critical_issues:critical,
  currency_verified:false,rights_verified:false,
  ready_to_stage:false,private_only:true,
  no_product_values_returned:true,no_database_writes:true,
  no_snapshot_upload:true,no_publication:true
 };
}
