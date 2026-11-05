import {TOOLED_UP_SOURCE_FIELDS} from "./tooled-up-master-adapter";
import {csvRowsFromChunks} from "../feed-imports/stream-csv";

/**
 * A read-only, limited live source sample. It does not infer the source currency,
 * write rows, return product data, persist affiliate URLs, or approve staging.
 */
export async function inspectTooledUpBoundedSample(response:Response){
 if(!response.ok||!response.body)throw Error("source_unavailable");
 const rawReader=response.body.getReader();
 let compressedBytes=0;
 const first=await rawReader.read();
 if(first.done||!first.value||first.value.byteLength<2){
  await rawReader.cancel().catch(()=>{});
  throw Error("empty_source");
 }
 const gz=first.value[0]===0x1f&&first.value[1]===0x8b;
 const source=new ReadableStream<Uint8Array>({
  start(controller){controller.enqueue(first.value!);},
  async pull(controller){
   const next=await rawReader.read();
   if(next.done)controller.close();else controller.enqueue(next.value);
  },
  async cancel(){await rawReader.cancel().catch(()=>{});}
 });
 let uncompressedBytes=0;
 const bounded=source.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
  transform(chunk,controller){
   compressedBytes+=chunk.byteLength;
   if(compressedBytes>2_000_000)throw Error("compressed_probe_limit");
   controller.enqueue(chunk);
  }
 }));
 const decoded=gz?bounded.pipeThrough(
  new DecompressionStream("gzip") as unknown as ReadableWritablePair<Uint8Array,Uint8Array>
 ):bounded;
 const decoder=new TextDecoder("utf-8",{fatal:true});
 const textStream=decoded.pipeThrough(new TransformStream<Uint8Array,string>({
  transform(chunk,controller){
   uncompressedBytes+=chunk.byteLength;
   if(uncompressedBytes>4_000_000)throw Error("decompressed_probe_limit");
   const text=decoder.decode(chunk,{stream:true});
   if(text)controller.enqueue(text);
  },
  flush(controller){const final=decoder.decode();if(final)controller.enqueue(final);}
 }));
 const reader=textStream.getReader();
 const parse=csvRowsFromChunks((async function*(){
  try{for(;;){const r=await reader.read();if(r.done)break;yield r.value;}}
  finally{await reader.cancel().catch(()=>{});}
 })(),",",120);
 let headers:string[]|null=null;
 let seen=0,invalidMerchant=0,invalidPrice=0,missingId=0,invalidTracking=0;
 const ids=new Set<string>();
 let duplicateIds=0;
 try{
  for await(const row of parse){
   if(!headers){
    headers=row.map(x=>x.trim());
    if(headers.length!==TOOLED_UP_SOURCE_FIELDS.length||
       new Set(headers).size!==headers.length||
       !TOOLED_UP_SOURCE_FIELDS.every(x=>headers!.includes(x)))
      throw Error("schema_mismatch");
    continue;
   }
   if(row.length!==headers.length)throw Error("row_column_mismatch");
   const get=(key:string)=>row[headers!.indexOf(key)]?.trim()??"";
   seen++;
   if(get("merchant_id")!=="496")invalidMerchant++;
   const id=get("merchant_product_id");
   if(!id)missingId++;
   else if(ids.has(id))duplicateIds++;
   else ids.add(id);
   const price=get("search_price");
   if(!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(price)||Number(price)<=0)
    invalidPrice++;
   try{
    const link=new URL(get("aw_deep_link"));
    const valid=link.protocol==="https:"&&
      ["awin1.com","www.awin1.com"].includes(link.hostname)&&
      ((link.pathname==="/pclick.php"&&link.searchParams.get("m")==="496"&&
        link.searchParams.get("a")==="3135746"&&Boolean(link.searchParams.get("p")))||
       (link.pathname==="/cread.php"&&link.searchParams.get("awinmid")==="496"&&
        link.searchParams.get("awinaffid")==="3135746"));
    if(!valid)invalidTracking++;
   }catch{invalidTracking++;}
   if(seen===25)break;
  }
 }finally{await parse.return(undefined);}
 if(!headers||seen===0)throw Error("no_sample_rows");
 return {
  status:"sample_inspection_only",advertiser_id:"496",feed_id:"89987",
  sampled_rows:seen,source_columns:headers.length,compressed:gz,
  invalid_merchant_rows:invalidMerchant,invalid_price_format_rows:invalidPrice,
  missing_product_id_rows:missingId,duplicate_ids_in_sample:duplicateIds,
  unverified_affiliate_links:invalidTracking,
  currency_column_present:headers.includes("currency"),
  currency_verified:false,
  private_only:true,no_row_values_returned:true,no_database_writes:true,
  no_snapshot_upload:true,no_publication:true
 };
}
