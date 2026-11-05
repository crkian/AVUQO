import {csvRowsFromChunks} from "../feed-imports/stream-csv";

const HEADER_LIMIT=128*1024;
const SAFE_HEADER=/^[A-Za-z][A-Za-z0-9_ -]{0,63}$/;

/** Read only the first bounded decompressed bytes, never product rows or signed URLs. */
export async function inspectAwinHeaderOnly(response:Response){
 if(!response.ok||!response.body)throw Error("upstream_unavailable");
 const compressed=response.headers.get("content-type")?.toLowerCase().includes("gzip")??false;
 let body:ReadableStream<Uint8Array>=response.body;
 // Awin may serve gzip as application/octet-stream: inspect first two raw bytes
 // without relying on advertised MIME type.
 const rawReader=body.getReader();
 const first=await rawReader.read();
 if(first.done||!first.value?.length){await rawReader.cancel();throw Error("empty_feed");}
 const prefix=first.value;
 const gz=prefix[0]===0x1f&&prefix[1]===0x8b;
 if(compressed&&!gz){await rawReader.cancel();throw Error("gzip_header_mismatch");}
 body=new ReadableStream<Uint8Array>({
  start(controller){controller.enqueue(prefix);},
  async pull(controller){
   const {done,value}=await rawReader.read();
   if(done)controller.close();else controller.enqueue(value);
  },
  async cancel(){await rawReader.cancel().catch(()=>{});}
 });
 const decoded=gz?body.pipeThrough(new DecompressionStream("gzip") as unknown as ReadableWritablePair<Uint8Array,Uint8Array>):body;
 const reader=decoded.getReader();
 let text="",limitReached=false;
 try{
  while(text.length<HEADER_LIMIT){
   const next=await reader.read();if(next.done)break;
   text+=new TextDecoder("utf-8",{fatal:true}).decode(next.value);
   // Awin field headers cannot contain line breaks unless quoted.
   // Parse a full first line; never retain or emit product values.
   const newline=text.indexOf("\n");
   if(newline>=0){text=text.slice(0,newline+1);break;}
  }
  if(!text.includes("\n"))limitReached=true;
 }finally{await reader.cancel().catch(()=>{});}
 if(limitReached)throw Error("header_size_limit");
 const delimiter=text.includes("\t")?"\t":",";
 const rows:string[][]=[];
 for await(const row of csvRowsFromChunks((async function*(){yield text;})(),delimiter,256))
  rows.push(row);
 if(rows.length!==1||rows[0].length<5)throw Error("invalid_header");
 const raw=rows[0].map(v=>v.trim());
 if(new Set(raw).size!==raw.length)throw Error("duplicate_header");
 return {
  source_columns:raw.length,
  detected_delimiter:delimiter==="\t"?"tab":"comma",
  safe_header_names:raw.map(x=>SAFE_HEADER.test(x)?x:"[redacted]"),
  required_physical_columns_present:[
   "merchant_id","merchant_product_id","product_name","search_price","currency","aw_deep_link"
  ].every(x=>raw.includes(x)),
  compressed:gz,
 };
}
