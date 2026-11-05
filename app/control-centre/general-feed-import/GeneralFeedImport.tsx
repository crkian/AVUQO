"use client";
import {useRef,useState} from "react";
import {joinedAwinAdvertisers} from "../../../lib/awin/joined-catalogue";
import {awinDelimitedRows} from "../../../lib/feed-imports/stream-csv";
import {identifyFormat,prepareGeneralBatch} from "../../../lib/feed-imports/general-awin-large";
import {prepareTyresUkPrivateBatch} from "../../../lib/awin/tyres-uk-private-adapter";
const ENDPOINT="/api/control-centre/general-feed-import",BATCH=250;
type Progress={committed:number;next_sequence:number;status:string;run_id:string};
type Diagnosis={format:string;headerCount:number;sampleCount:number;review:number;excluded:number;reasons:string[];fileKey:string};
const fileKey=(file:File,merchant:string,feedId:string)=>[file.name,file.size,file.lastModified,merchant,feedId].join("|");
async function request(payload:Record<string,unknown>){
 const response=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
 const out=await response.json();
 if(!response.ok)throw Error(out.error||"Private import failed");
 return out;
}
export default function GeneralAwinImport(){
 const [file,setFile]=useState<File|null>(null),[merchant,setMerchant]=useState(""),[feedId,setFeedId]=useState(""),
 [runId,setRunId]=useState(""),[confirmed,setConfirmed]=useState(false),
 [busy,setBusy]=useState(false),[progress,setProgress]=useState<Progress|null>(null),[message,setMessage]=useState(""),[diagnosis,setDiagnosis]=useState<Diagnosis|null>(null);
 const pause=useRef(false);
 async function check(){
  if(!file||!merchant||!feedId)return;
  setBusy(true);setMessage("");setDiagnosis(null);
  try{
   if(!/\.(csv|tsv)(\.gz)?$/i.test(file.name))throw Error("Unsupported extension: use CSV, TSV or gzip-compressed variants");
   if(file.size>250*1024*1024)throw Error("Source file exceeds the 250 MB limit");
   if(file.name.toLowerCase().endsWith(".gz")&&!("DecompressionStream" in window))throw Error("This browser cannot inspect compressed files");
   const iterator=awinDelimitedRows(file,merchant==="12715"?20000:10000)[Symbol.asyncIterator]();
   let headers:string[]|null=null,format="";const sample:string[][]=[];
   try{
    for(let i=0;i<26;i++){
     const next=await iterator.next();if(next.done)break;
     if(!headers){headers=next.value.map(x=>x.trim());format=identifyFormat(headers);}
     else{if(next.value.length!==headers.length)throw Error("Inconsistent fields at sample row "+i);sample.push(next.value);}
    }
   }finally{await iterator.return?.();}
   if(!headers||sample.length===0)throw Error("Feed has no sample product rows");
   const converted=merchant==="12715"
    ?prepareTyresUkPrivateBatch(merchant,feedId,headers,sample)
    :prepareGeneralBatch(merchant,feedId,headers,sample);
   const reasons=[...new Set(converted.flatMap(x=>x.reasons))];
   setDiagnosis({format,headerCount:headers.length,sampleCount:sample.length,
    review:converted.filter(x=>x.status==="review").length,
    excluded:converted.filter(x=>x.status==="excluded").length,
    reasons,fileKey:fileKey(file,merchant,feedId)});
   setMessage("Preflight passed: advertiser identity and feed format were checked against "+sample.length+" source rows. This is a sample, not a validation of the entire feed.");
  }catch(e){setMessage(e instanceof Error?e.message:"Feed preflight failed");}
  finally{setBusy(false);}
 }
 async function start(){
  if(!file||!merchant||!feedId||!confirmed)return;
  if(!diagnosis||diagnosis.fileKey!==fileKey(file,merchant,feedId)){setMessage("Check the actual feed columns and sample rows before importing.");return;}
  setBusy(true);pause.current=false;setMessage("");
  let current=runId.trim();
  try{
   if(!/\.(csv|tsv)(\.gz)?$/i.test(file.name))throw Error("Select a supported CSV/TSV file, optionally gzip compressed");
   if(file.name.toLowerCase().endsWith(".gz")&&!("DecompressionStream" in window))throw Error("This browser cannot stream gzip; use current Chrome, Edge or Firefox");
   // File fingerprint binds resumes to exact file; rows are streamed, not held in memory.
   const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",await file.arrayBuffer()));
   const digest=Array.from(hash,x=>x.toString(16).padStart(2,"0")).join("");
   const initial=current?await request({action:"status",run_id:current}):
    await request({action:"start",advertiser_id:merchant,feed_id:feedId,filename:file.name,file_size:file.size,source_digest:digest});
   if(current&&(initial.source_digest!==digest||initial.advertiser_id!==merchant||initial.feed_id!==feedId))
    throw Error("Resume requires the original file, advertiser and feed ID");
   if(initial.status==="private_review")throw Error("This run is already complete. Remove the run ID to start another.");
   if(!current){current=initial.run_id;setRunId(current);}
   let committed=Number(initial.committed_count??initial.committed??0),sequence=Number(initial.next_sequence);
   let index=0,total=0,headers:string[]|null=null,batch:string[][]=[];
   setProgress({run_id:current,committed,next_sequence:sequence,status:"importing"});
   async function flush(){
    if(!headers||!batch.length)return;
    if(index>=sequence){
     let done=false;
     for(let attempt=0;attempt<3&&!done;attempt++){
      try{
       const result=await request({action:"chunk",run_id:current,feed_id:feedId,sequence:index,headers,rows:batch});
       committed=result.committed;sequence=result.next_sequence;done=true;
      }catch(e){
       const status=await request({action:"status",run_id:current});
       if(status.next_sequence>index){committed=status.committed_count;sequence=status.next_sequence;done=true;}
       else if(attempt===2)throw e;
      }
     }
    }
    index++;batch=[];
    setProgress({run_id:current,committed,next_sequence:sequence,status:"importing"});
   }
   for await(const row of awinDelimitedRows(file,merchant==="12715"?20000:10000)){
    if(pause.current){setMessage("Paused after the last committed batch. Retain run ID and reselect the identical file to resume.");return;}
    if(!headers){
     headers=row.map(s=>s.trim());
     const format=identifyFormat(headers);
     setMessage("Recognised feed layout: "+(format==="awin-csv"?"Awin standard":"Awin Google retail")+". Every row will be checked against advertiser "+merchant+".");
     continue;
    }
    if(row.length!==headers.length)throw Error("Incorrect column count at source record "+(total+1));
    total++;if(total>500000)throw Error("Maximum 500,000 source rows per private import");
    batch.push(row);if(batch.length===BATCH)await flush();
   }
   if(!headers||!total)throw Error("No product records found");
   await flush();
   if(committed!==total)throw Error("Server committed count differs from file count. Run remains incomplete for safe resumption.");
   const outcome=await request({action:"finish",run_id:current,total});
   setProgress({run_id:current,committed:total,next_sequence:sequence,status:"private_review"});
   setMessage(`Completed: ${outcome.total.toLocaleString("en-GB")} rows; ${outcome.review.toLocaleString("en-GB")} in private review, ${outcome.excluded.toLocaleString("en-GB")} excluded. Nothing published.`);
  }catch(e){setMessage(e instanceof Error?e.message:"Import interrupted; resume with original file and run ID.");}
  finally{setBusy(false);}
 }
 return <section style={{display:"grid",gap:15,background:"white",padding:"clamp(16px,3vw,26px)",border:"1px solid #e7dfe9",borderRadius:18,maxWidth:960}}>
  <h2 style={{margin:0,fontSize:26,letterSpacing:"-.035em"}}>Any joined Awin advertiser · large feed importer</h2>
  {merchant==="12715"&&<p role="note" style={{margin:0,padding:12,borderRadius:10,background:"#f5f0ff",fontSize:13}}>Tyres UK requires exact feed ID <strong>93988</strong>. This privately stages GBP tyre candidates extracted from descriptions. Missing or conflicting fitment, accessories and invalid tracking are excluded. All tyre sizes and prices remain unverified for public publication.</p>}
  <p style={{margin:0,color:"#716979",lineHeight:1.65,fontSize:13}}>Supports standard Awin and Google-retail CSV layouts, including TSV, compressed or plain. Streams rows in 250-record batches and resumes by exact file fingerprint. Other retailer-specific/XML formats are deliberately rejected until an adapter is verified.</p>
  <label style={{display:"grid",gap:7}}><strong>Accepted Awin advertiser</strong>
   <select value={merchant} disabled={busy} required onChange={e=>{setMerchant(e.target.value);setRunId("");setDiagnosis(null);}} style={{minHeight:46,borderRadius:9,padding:10,border:"1px solid #d8cede"}}>
    <option value="">Select joined advertiser</option>
    {joinedAwinAdvertisers.map(([id,name])=><option value={id} key={id}>{name} · {id}</option>)}
   </select></label>
  <label style={{display:"grid",gap:7}}><strong>Awin feed ID (from feed list)</strong>
   <input value={feedId} onChange={e=>{setFeedId(e.target.value.trim());setRunId("");setDiagnosis(null);}} disabled={busy} placeholder="e.g. 93988" maxLength={30} pattern="[A-Za-z0-9_-]{1,30}" style={{minHeight:46,borderRadius:9,padding:10,border:"1px solid #d8cede"}}/></label>
  <label style={{display:"grid",gap:7}}><strong>CSV, TSV, CSV.GZ or TSV.GZ</strong>
   <input type="file" accept=".csv,.tsv,.csv.gz,.tsv.gz,.gz" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]??null);setDiagnosis(null);setRunId("");}}/></label>
  <label style={{display:"grid",gap:7}}><strong>Resume import ID (optional)</strong>
   <input value={runId} disabled={busy} onChange={e=>setRunId(e.target.value)} placeholder="Paste ID from a paused/importing run" style={{minHeight:46,borderRadius:9,padding:10,border:"1px solid #d8cede"}}/></label>
  <label style={{display:"flex",alignItems:"start",gap:10,lineHeight:1.65,fontSize:13}}>
   <input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)} style={{marginTop:5}}/>
   I confirm that the file comes from the selected joined Awin programme. Staging is private, all permissions remain unverified, and services/contract products need separate review before publication.
  </label>
  {diagnosis&&<div role="status" style={{display:"grid",gap:6,padding:15,borderRadius:12,border:"1px solid #d9cde6",background:"#f8f4fb"}}><strong>Detected format: {diagnosis.format==="awin-csv"?"Awin standard":"Awin Google-retail"}</strong><span>{diagnosis.headerCount} columns · {diagnosis.sampleCount} checked rows · {diagnosis.review} review candidates · {diagnosis.excluded} excluded</span><small>Sample flags: {diagnosis.reasons.join(", ")||"none detected"}. Full validation happens during import; no data is published.</small></div>}
  <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
   <button type="button" disabled={busy||!file||!merchant||!feedId} onClick={check} style={{padding:"12px 18px",minHeight:48,border:"1px solid #d8cede",background:"#fff",color:"#50358a",fontWeight:850,borderRadius:10}}>Inspect actual feed columns</button>
   <button type="button" disabled={busy||!file||!merchant||!feedId||!confirmed||!diagnosis||diagnosis.fileKey!==fileKey(file,merchant,feedId)} onClick={start}
    style={{padding:"12px 20px",minHeight:48,background:"#6043a3",color:"#fff",fontWeight:850,border:0,borderRadius:10,cursor:"pointer"}}>{busy?"Importing privately…":runId?"Resume import":"Start private import"}</button>
   {busy&&<button type="button" onClick={()=>{pause.current=true;}} style={{padding:"12px 17px",minHeight:48,border:"1px solid #d8cede",borderRadius:10,background:"white"}}>Pause after batch</button>}
  </div>
  {progress&&<p role="status" style={{margin:0,fontSize:13,lineHeight:1.65}}>Saved {progress.committed.toLocaleString("en-GB")} records · {progress.next_sequence} batches · {progress.status}. Run ID: <code style={{overflowWrap:"anywhere"}}>{progress.run_id}</code></p>}
  {message&&<p role="alert" style={{margin:0,fontSize:13,lineHeight:1.6,overflowWrap:"anywhere"}}>{message}</p>}
 </section>;
}
