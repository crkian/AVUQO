/** Incremental RFC-4180-ish CSV reader for browser decompression streams.
 * Handles quoted commas/newlines, escaped quotes and CRLF without buffering a
 * complete large feed in memory. Denies excessive field/row sizes.
 */
export async function* csvRowsFromChunks(chunks:AsyncIterable<string>):AsyncGenerator<string[]>{
 let cells:string[]=[],field="",quoted=false,justClosed=false,atStart=true;
 for await(const chunk of chunks){
  for(let i=0;i<chunk.length;i++){
   let c=chunk[i];
   if(atStart){atStart=false;if(c==="\uFEFF")continue;}
   if(quoted){
    if(c==='"'){
     if(chunk[i+1]==='"'){field+='"';i++;}
     else {quoted=false;justClosed=true;}
    }else field+=c;
   }else if(c==='"' && field==="" && !justClosed){quoted=true;}
   else if(c===','){cells.push(field);field="";justClosed=false;}
   else if(c==='\n'){
    cells.push(field.endsWith("\r")?field.slice(0,-1):field);
    if(cells.some(x=>x.length))yield cells;
    cells=[];field="";justClosed=false;
   }else if(c==='\r'){
    // CR is stripped only when a record ends; preserve embedded quoted CR.
    field+=c;
   }else if(justClosed && c!==" "){throw Error("Unexpected character after CSV closing quote");}
   else if(!justClosed)field+=c;
   if(field.length>10000||cells.length>120)throw Error("CSV field or row exceeds size limit");
  }
 }
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
