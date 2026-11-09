"use client";
import {useState,useRef} from "react";
import {awinDelimitedRows} from "../../../lib/feed-imports/stream-csv";
import {candidateTyresUkTechnicalSpecs} from "../../../lib/awin/tyres-uk-technical-evidence";

const API="/api/control-centre/tyre-spec-enrichment";
type Status={source_digest:string;imported:number;enriched_review_records:number;
 automatic_enabled?:boolean;automatic_job?:{state:string;source_row_count:number;next_row:number;
 candidate_count:number;updated_count:number;skipped_count:number;updated_at:string}|null};
async function call(payload:Record<string,unknown>){
 const result=await fetch(API,{method:"POST",cache:"no-store",
  headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const response=await result.json();
 if(!result.ok)throw Error(response.error??"Private enrichment failed");
 return response;
}
export default function TyreEnrichmentForm(){
 const [file,setFile]=useState<File|null>(null);
 const [status,setStatus]=useState<Status|null>(null);
 const [state,setState]=useState("Refresh status to see private automatic enrichment progress.");
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState({read:0,eligible:0,updated:0,skipped:0});
 const stop=useRef(false);
 async function inspect(){
  setBusy(true);setState("Inspecting the existing private import...");
  try{
   const info=await call({action:"status"}) as Status;
   setStatus(info);
   setState(`Existing private import contains ${info.imported.toLocaleString("en-GB")} records; ${info.enriched_review_records.toLocaleString("en-GB")} currently enriched.`);
  }catch(e){setState(e instanceof Error?e.message:"Status unavailable");}
  finally{setBusy(false);}
 }
 async function enrich(){
  if(!file)return;
  setBusy(true);stop.current=false;setProgress({read:0,eligible:0,updated:0,skipped:0});
  try{
   if(!file.name.toLowerCase().endsWith(".csv.gz")||file.size>25*1024*1024)
    throw Error("Select the original Tyres UK compressed Awin CSV.GZ file, up to 25 MB.");
   const info=await call({action:"status"}) as Status;
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await file.arrayBuffer())),
    byte=>byte.toString(16).padStart(2,"0")).join("");
   if(hash!==info.source_digest)throw Error("This is not the file used for the completed Tyres UK import. Nothing changed.");
   let headers:string[]|null=null,read=0,eligible=0,updated=0,skipped=0;
   let batch:Record<string,unknown>[]=[];
   const required=["merchant_id","merchant_product_id","product_name","description",
    "search_price","currency","custom_1","custom_2","custom_3","custom_4","custom_5"];
   async function flush(){
    if(!batch.length)return;
    const report=await call({action:"chunk",source_digest:hash,rows:batch});
    updated+=Number(report.updated??0);
    skipped+=Number(report.skipped_or_already_present??0);
    batch=[];setProgress({read,eligible,updated,skipped});
   }
   setState("Inspecting all original product rows and enriching existing review records...");
   for await(const cells of awinDelimitedRows(file,20000)){
    if(!headers){
     headers=cells.map(x=>x.trim());
     if(!required.every(x=>headers!.includes(x))||new Set(headers).size!==headers.length)
      throw Error("Original Awin tyre schema invalid. No changes made.");
     continue;
    }
    read++;
    if(cells.length!==headers.length)throw Error(`Malformed original feed row ${read}`);
    const raw=Object.fromEntries(headers.map((name,i)=>[name,cells[i]]));
    if(raw.merchant_id!=="12715")throw Error("Cross-advertiser row: enrichment aborted.");
    const evidence=candidateTyresUkTechnicalSpecs(raw);
    if(evidence.cross_checked_against_description&&
      raw.currency?.trim().toUpperCase()==="GBP"&&
      /^\d+(?:\.\d{1,2})?$/.test(raw.search_price??"")&&
      Number(raw.search_price)>0){
     batch.push({merchant_product_id:raw.merchant_product_id,
      title:raw.product_name.slice(0,500),price:raw.search_price,
      width_mm:evidence.width_mm,aspect_ratio:evidence.aspect_ratio,
      rim_inches:evidence.rim_inches,load_index:evidence.load_index_candidate,
      speed_rating:evidence.speed_rating_candidate,corroborated:true});
     eligible++;
     if(batch.length===250)await flush();
    }
    if(stop.current){await flush();setState("Paused after a completed batch. Choose the same file to resume safely.");return;}
   }
   await flush();
   const updatedStatus=await call({action:"status"}) as Status;
   setStatus(updatedStatus);
   setProgress({read,eligible,updated,skipped});
   setState(`Finished: ${read.toLocaleString("en-GB")} source rows, ${eligible.toLocaleString("en-GB")} corroborated candidates, ${updated.toLocaleString("en-GB")} newly enriched this run. ${updatedStatus.enriched_review_records.toLocaleString("en-GB")} existing review records now have private load/speed candidates. Nothing published.`);
  }catch(e){setState(e instanceof Error?e.message:"Enrichment interrupted. Re-running the same file is safe.");}
  finally{setBusy(false);}
 }
 return <section style={{display:"grid",gap:15,background:"white",padding:22,border:"1px solid #e5dce9",borderRadius:18,maxWidth:850}}>
  <h2 style={{margin:0,fontSize:24}}>Automatic tyre specification enrichment</h2>
  <p style={{margin:0,color:"#6f6475",lineHeight:1.6}}>
   AVUQO can check current Awin feed snapshots on its server and enrich only existing private review records.
   No phone uploads are needed once the automatic worker has been tested and enabled.
   Prices, product approvals and public publication remain unchanged.
  </p>
  <button type="button" disabled={busy} onClick={inspect}
   style={{padding:12,borderRadius:10,border:"1px solid #d5c7de",background:"white"}}>
   Refresh automatic enrichment status
  </button>
  {status&&<div style={{display:"grid",gap:7,padding:14,borderRadius:12,background:"#f7f4fa",lineHeight:1.5}}>
   <strong>Automatic worker: {status.automatic_enabled?"Enabled":"Not enabled yet"}</strong>
   {status.automatic_job
    ?<span>Last snapshot: {status.automatic_job.state}. Scanned {status.automatic_job.next_row.toLocaleString("en-GB")} of {status.automatic_job.source_row_count.toLocaleString("en-GB")} rows; {status.automatic_job.updated_count.toLocaleString("en-GB")} private records enriched by the automatic worker.</span>
    :<span>No automatic enrichment snapshot has been processed yet.</span>}
   <small>Private imported records: {status.imported.toLocaleString("en-GB")}.
    Records with load-index candidates: {status.enriched_review_records.toLocaleString("en-GB")}.
    No publication or permission flags changed.</small>
  </div>}
  <details style={{borderTop:"1px solid #e5dce9",paddingTop:14}}>
   <summary style={{fontWeight:700,cursor:"pointer"}}>Manual recovery: use the exact original Awin file</summary>
   <div style={{display:"grid",gap:15,paddingTop:14}}>
    <p style={{margin:0,lineHeight:1.5,color:"#6f6475"}}>
     This legacy recovery method only accepts the exact file used for the completed 5 November import.
     A newer feed will be rejected, even if its filename looks right.
    </p>
    <label style={{display:"grid",gap:8}}>Original Tyres UK CSV.GZ (feed 93988)
     <input type="file" accept=".csv.gz" disabled={busy} onChange={e=>setFile(e.target.files?.[0]??null)}/>
    </label>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
     <button type="button" disabled={busy||!file} onClick={enrich}
      style={{padding:"12px 18px",background:"#583775",color:"white",border:0,borderRadius:10,fontWeight:800}}>
      Enrich from exact original file
     </button>
     {busy&&<button type="button" onClick={()=>stop.current=true}
      style={{padding:"12px 18px",background:"white",border:"1px solid #d5c7de"}}>
      Pause after batch
     </button>}
    </div>
    {busy&&<p>Read {progress.read.toLocaleString("en-GB")} rows;
     {progress.eligible.toLocaleString("en-GB")} candidates,
     {progress.updated.toLocaleString("en-GB")} updated.</p>}
   </div>
  </details>
  <p role="status" style={{margin:0,lineHeight:1.6}}>{state}</p>
 </section>;
}
