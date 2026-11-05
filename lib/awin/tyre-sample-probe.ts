import {csvRowsFromChunks} from "../feed-imports/stream-csv";
import {candidateTyreSize,inspectTyreHeader} from "./tyre-feed-contract";

const MAX_COMPRESSED=2_000_000,MAX_DECOMPRESSED=4_000_000;
const MAX_ROWS=25;
export async function inspectTyreBoundedSample(
 response:Response,advertiser:string,feed:string
){
 if(!response.ok||!response.body)throw Error("feed_http_unavailable");
 const original=response.body.getReader();
 const first=await original.read();
 if(first.done||!first.value?.byteLength)throw Error("empty_feed");
 const gzip=first.value[0]===0x1f&&first.value[1]===0x8b;
 let compressed=0,expanded=0;
 const raw=new ReadableStream<Uint8Array>({
  start(controller){controller.enqueue(first.value!);},
  async pull(controller){
   const next=await original.read();
   if(next.done)controller.close();else controller.enqueue(next.value);
  },
  async cancel(){await original.cancel().catch(()=>{});}
 });
 const bounded=raw.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
  transform(bytes,controller){
   compressed+=bytes.byteLength;
   if(compressed>MAX_COMPRESSED)throw Error("compressed_probe_limit");
   controller.enqueue(bytes);
  }
 }));
 const decompressed=gzip?bounded.pipeThrough(
  new DecompressionStream("gzip") as unknown as ReadableWritablePair<Uint8Array,Uint8Array>
 ):bounded;
 const decoder=new TextDecoder("utf-8",{fatal:true});
 const text=decompressed.pipeThrough(new TransformStream<Uint8Array,string>({
  transform(bytes,controller){
   expanded+=bytes.byteLength;
   if(expanded>MAX_DECOMPRESSED)throw Error("expanded_probe_limit");
   const s=decoder.decode(bytes,{stream:true});
   if(s)controller.enqueue(s);
  },flush(controller){const s=decoder.decode();if(s)controller.enqueue(s);}
 }));
 const reader=text.getReader();
 let header:string[]|null=null,seen=0,missingIds=0,invalidMerchant=0;
 let titleSizeCandidates=0,explicitCurrency=0,positivePrices=0;
 let nonemptyCustomFields=0,missingTitle=0;
 const customStats:Record<string,{nonempty_rows:number;size_candidate_rows:number;numeric_rows:number}>={};
 let descriptionSizeCandidates=0,categorySizeCandidates=0;
 const ids=new Set<string>();let duplicateIds=0;
 const chunks=(async function*(){
  try{
   for(;;){const r=await reader.read();if(r.done)break;yield r.value;}
  }finally{await reader.cancel().catch(()=>{});}
 })();
 const parsed=csvRowsFromChunks(chunks,",",256);
 try{
  for await(const row of parsed){
   if(!header){
    header=row.map(v=>v.trim());
    inspectTyreHeader(header,advertiser,feed);
    continue;
   }
   if(row.length!==header.length)throw Error("sample_column_mismatch");
   const get=(k:string)=>row[header!.indexOf(k)]?.trim()??"";
   seen++;
   if(get("merchant_id")!==advertiser)invalidMerchant++;
   const id=get("merchant_product_id");
   if(!id)missingIds++;
   else if(ids.has(id))duplicateIds++;
   else ids.add(id);
   const title=get("product_name");
   if(!title)missingTitle++;
   if(candidateTyreSize(title))titleSizeCandidates++;
   if(candidateTyreSize(get("description")))descriptionSizeCandidates++;
   if(candidateTyreSize(get("merchant_category"))||candidateTyreSize(get("merchant_product_category_path")))categorySizeCandidates++;
   const currency=get("currency");
   if(currency)explicitCurrency++;
   const price=get("search_price");
   if(/^\d+(?:\.\d{1,2})?$/.test(price)&&Number(price)>0)positivePrices++;
   let rowHasCustom=false;
   for(let i=0;i<header.length;i++){
    const name=header[i];
    if(!/^custom_\d+$/i.test(name))continue;
    const stats=customStats[name]??(customStats[name]={nonempty_rows:0,size_candidate_rows:0,numeric_rows:0});
    const raw=row[i]?.trim()??"";
    if(!raw)continue;
    rowHasCustom=true;
    stats.nonempty_rows++;
    if(candidateTyreSize(raw))stats.size_candidate_rows++;
    if(/^\d+(?:\.\d+)?$/.test(raw))stats.numeric_rows++;
   }
   if(rowHasCustom)nonemptyCustomFields++;
   if(seen===MAX_ROWS)break;
  }
 }finally{await parsed.return(undefined);}
 if(!header||seen===0)throw Error("no_sample_rows");
 return {
  status:"private_tyre_sample_inspected",advertiser_id:advertiser,feed_id:feed,
  sampled_rows:seen,source_columns:header.length,compressed:gzip,
  invalid_merchant_rows:invalidMerchant,missing_product_id_rows:missingIds,
  duplicate_ids_in_sample:duplicateIds,missing_title_rows:missingTitle,
  title_size_candidate_rows:titleSizeCandidates,
  description_size_candidate_rows:descriptionSizeCandidates,
  category_size_candidate_rows:categorySizeCandidates,
  custom_column_evidence:customStats,
  rows_with_nonempty_custom_fields:nonemptyCustomFields,
  rows_with_explicit_currency:explicitCurrency,
  rows_with_positive_numeric_prices:positivePrices,
  tyre_size_verified:false,custom_field_semantics_verified:false,
  currency_verified:false,rights_verified:false,ready_to_import:false,
  ready_to_publish:false,private_only:true,no_product_values_returned:true,
  no_database_writes:true,no_publication:true
 };
}
