"use client";
import {useRef,useState} from "react";
import {gzipCsvRows} from "../../../lib/feed-imports/stream-csv";
const SIZE=250;
type Progress={run_id:string;committed:number;next_sequence:number;status?:string};
async function api(data:Record<string,unknown>){
 const response=await fetch("/api/control-centre/large-feed-import",{
  method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),cache:"no-store"
 });
 const json=await response.json();
 if(!response.ok)throw Error(json.error||"Import failed");
 return json;
}
export default function TooledUpLargeImport(){
 const [file,setFile]=useState<File|null>(null),[runId,setRunId]=useState(""),[busy,setBusy]=useState(false),
  [progress,setProgress]=useState<Progress|null>(null),[message,setMessage]=useState(""),
  [confirmed,setConfirmed]=useState(false);
 const stop=useRef(false);
 async function start(){
  if(!file||!confirmed)return;
  setBusy(true);setMessage("");stop.current=false;
  let current=runId.trim();
  try{
   if(!("DecompressionStream" in window))throw Error("This browser cannot stream gzip. Use current Chrome, Edge or Firefox.");
   if(!/^496-89987-en_GB-All_Products(?: \(\d+\))?\.csv\.gz$/i.test(file.name))
    throw Error("Choose the Tooled-Up Awin All Products feed 89987 CSV.GZ");
   const initial=current?await api({action:"status",run_id:current})
    :await api({action:"start",filename:file.name,file_size:file.size});
   if(!current){
    current=initial.run_id;setRunId(current);
   }
   if(initial.status==="private_review")throw Error("This import is already complete. Choose a new run.");
   let sequence=Number(initial.next_sequence),committed=Number(initial.committed_count??initial.committed??0);
   setProgress({run_id:current,committed,next_sequence:sequence,status:"importing"});
   let header:string[]|null=null,batch:string[][]=[],seen=0,index=0;
   async function commit(){
    if(!batch.length||!header)return;
    if(index>=sequence){
     // On network uncertainty, request the server's authoritative cursor and
     // retry the same chunk only when it has not been committed already.
     let done=false;
     for(let retry=0;retry<3&&!done;retry++){
      try{
       const out=await api({action:"chunk",run_id:current,sequence:index,headers:header,rows:batch});
       committed=out.committed;sequence=out.next_sequence;done=true;
      }catch(err){
       if(retry===2)throw err;
       const status=await api({action:"status",run_id:current});
       if(status.next_sequence>index){committed=status.committed_count;sequence=status.next_sequence;done=true;}
      }
     }
    }
    index++;batch=[];
    setProgress({run_id:current,committed,next_sequence:sequence,status:"importing"});
   }
   for await(const row of gzipCsvRows(file)){
    if(stop.current){setMessage("Paused. Keep your run ID and choose the same file to resume.");return;}
    if(!header){
     header=row.map(s=>s.trim());
     if(!header.includes("merchant_id")||!header.includes("brand_name"))
      throw Error("The file is not a supported Tooled-Up All Products Awin CSV.");
     continue;
    }
    seen++;batch.push(row);
    if(batch.length===SIZE)await commit();
   }
   await commit();
   if(seen!==committed)throw Error("Browser row count and database count differ; import remains private and incomplete.");
   const finished=await api({action:"finish",run_id:current,total:seen});
   setMessage(`Imported ${finished.total.toLocaleString("en-GB")} Tooled-Up products: ${finished.review.toLocaleString("en-GB")} for review, ${finished.excluded.toLocaleString("en-GB")} excluded. Nothing published. Manufacturer/brand data retained.`);
   setProgress({run_id:current,committed:seen,next_sequence:sequence,status:"private_review"});
  }catch(e){setMessage(e instanceof Error?e.message:"Import stopped unexpectedly. Resume using the same file and run ID.");}
  finally{setBusy(false);}
 }
 return <section style={{display:"grid",gap:14,padding:20,background:"white",border:"1px solid #e4dcec",borderRadius:16,maxWidth:850}}>
  <h2 style={{margin:0,fontSize:22}}>Tooled-Up full-range importer</h2>
  <p style={{color:"#645e70",lineHeight:1.6,margin:0}}>Private staging for Awin advertiser 496, feed 89987. Streams the gzip locally and commits 250 records at a time. Store your run ID to resume after interruptions. No public products or automatic retailer fetching.</p>
  <label htmlFor="tooled-file"><strong>Tooled-Up All Products CSV.GZ</strong></label>
  <input id="tooled-file" type="file" accept=".gz,.csv.gz" disabled={busy}
   onChange={e=>setFile(e.target.files?.[0]??null)}/>
  <label htmlFor="tooled-run">Resume import ID (optional)</label>
  <input id="tooled-run" type="text" value={runId} disabled={busy}
   onChange={e=>setRunId(e.target.value)} placeholder="Leave blank for a new import"
   style={{padding:12,borderRadius:9,border:"1px solid #d6cede"}}/>
  <label style={{display:"flex",alignItems:"start",gap:10,fontSize:13}}>
   <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={busy}/>
   I understand this is an unverified private product import, not evidence of image/publication rights or proof that Tooled-Up&apos;s underlying source is the new awinnew feed.
  </label>
  <div style={{display:"flex",gap:10}}>
   <button type="button" disabled={busy||!file||!confirmed} onClick={start}
    style={{background:"#5541ad",color:"white",border:0,borderRadius:10,padding:13,fontWeight:800}}>
    {busy?"Importing privately…":runId?"Resume private import":"Start private import"}
   </button>
   {busy&&<button type="button" onClick={()=>{stop.current=true;}} style={{border:"1px solid #d6cede",background:"white",borderRadius:10,padding:13}}>Pause after current batch</button>}
  </div>
  {progress&&<p role="status" style={{margin:0}}>Saved {progress.committed.toLocaleString("en-GB")} products, {progress.next_sequence} batches. Status: {progress.status}. Import ID: <code>{progress.run_id}</code></p>}
  {message&&<p role="alert" style={{whiteSpace:"pre-wrap",margin:0}}>{message}</p>}
 </section>;
}
