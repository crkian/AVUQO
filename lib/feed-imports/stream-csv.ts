/** Incremental CSV parser for giant Awin feeds, including quoted
 * newlines, escaped quotes spanning stream chunks and CRLF separators.
 */
export async function* csvRowsFromChunks(chunks:AsyncIterable<string>,delimiter="," ):AsyncGenerator<string[]>{
 let cells:string[]=[],field="",quoted=false,quotePending=false,justClosed=false,atStart=true;
 for await(const chunk of chunks){
  for(let i=0;i<chunk.length;i++){
   const c=chunk[i];
   if(atStart){atStart=false;if(c==="\uFEFF")continue;}
   if(quoted){
    if(quotePending){
     if(c==='"'){field+='"';quotePending=false;continue;}
     quoted=false;quotePending=false;justClosed=true;
     // Process the delimiter after the closing quote below.
    }else{
     if(c==='"')quotePending=true;
     else field+=c;
     if(field.length>10000)throw Error("CSV field exceeds 10,000 characters");
     continue;
    }
   }
   if(c==='"'&&field===""&&!justClosed)quoted=true;
   else if(c===delimiter){cells.push(field);field="";justClosed=false;}
   else if(c==='\n'){
    cells.push(field.endsWith("\r")?field.slice(0,-1):field);
    if(cells.some(x=>x.length))yield cells;
    cells=[];field="";justClosed=false;
   }else if(justClosed){
    if(c!==" "&&c!=="\r")throw Error("Unexpected character after closing quote");
   }else field+=c;
   if(field.length>10000||cells.length>120)throw Error("CSV field or row exceeds size limit");
  }
 }
 if(quotePending){quoted=false;quotePending=false;justClosed=true;}
 if(quoted)throw Error("Incomplete quoted CSV field");
 if(field||cells.length){cells.push(field);if(cells.some(x=>x.length))yield cells;}
}
export async function* gzipCsvRows(file:File){
 if(!file.name.toLowerCase().endsWith(".csv.gz"))throw Error("Select a compressed CSV.GZ file");
 const reader=file.stream().pipeThrough(new DecompressionStream("gzip"))
  .pipeThrough(new TextDecoderStream()).getReader();
 async function* chunks(){
  try{for(;;){const {value,done}=await reader.read();if(done)break;yield value;}}
  finally{reader.releaseLock();}
 }
 yield* csvRowsFromChunks(chunks());
}

/** Stream Awin comma/tab delimited text, optionally gzip-compressed, without whole-file decompression. */
export async function* awinDelimitedRows(file:File){
 const lower=file.name.toLowerCase();
 if(!/\.(csv|tsv)(\.gz)?$/.test(lower))throw Error("Use CSV, TSV, CSV.GZ or TSV.GZ");
 const delimiter=lower.includes(".tsv")?"\t":",";
 const source=file.stream();
 const bytes=lower.endsWith(".gz")?source.pipeThrough(new DecompressionStream("gzip")):source;
 const reader=bytes.pipeThrough(new TextDecoderStream()).getReader();
 async function* textChunks(){
  try{for(;;){const {done,value}=await reader.read();if(done)break;yield value;}}
  finally{reader.releaseLock();}
 }
 yield* csvRowsFromChunks(textChunks(),delimiter);
}
