"use client";

import {useState} from "react";

type PilotResult={
 status?:string;error?:string;reason?:string;failure_kind?:string;
 rows?:number;records?:number;columns?:number;source_columns?:number;
 currency_source?:string;source_format?:string;saved_records?:number;
 private_only?:boolean;no_publication?:boolean;
};
const button:React.CSSProperties={
 border:"1px solid #d6cced",borderRadius:10,padding:"11px 15px",
 background:"#5b35f5",color:"white",fontWeight:750,cursor:"pointer"
};

export default function PetlibroPilotControls(){
 const [busy,setBusy]=useState<"preflight"|"stage"|null>(null);
 const [preflightPassed,setPreflightPassed]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [result,setResult]=useState<PilotResult|null>(null);
 const [failure,setFailure]=useState("");
 async function run(mode:"preflight"|"stage"){
  if(busy)return;
  if(mode==="stage"&&(!preflightPassed||!confirmed))return;
  setBusy(mode);setFailure("");setResult(null);
  try{
   const response=await fetch("/api/control-centre/awin-pilot",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(mode==="stage"
     ?{mode,confirm:"stage-privately-77952-103580"}:{mode}),
    cache:"no-store",credentials:"same-origin",
   });
   const report=await response.json() as PilotResult;
   if(!response.ok){
    setFailure([report.error,report.reason??report.failure_kind].filter(Boolean).join(" · ")||
     "Awin pilot request failed");
    if(mode==="preflight")setPreflightPassed(false);
    return;
   }
   setResult(report);
   if(mode==="preflight")setPreflightPassed(report.status==="preflight_passed");
  }catch{
   setFailure("Could not contact AVUQO's private importer");
   if(mode==="preflight")setPreflightPassed(false);
  }finally{setBusy(null);}
 }
 return <section style={{border:"1px solid #ded6ec",background:"white",borderRadius:16,padding:22,display:"grid",gap:15}}>
  <h2 style={{margin:0,fontSize:22}}>Test Petlibro's current Awin feed</h2>
  <p style={{margin:0,lineHeight:1.6}}>Advertiser <strong>77952</strong>, UK Product feed <strong>103580</strong>. These are production-data operations. Neither operation publishes a product, enables an Awin source, approves rights or starts a marketing campaign.</p>
  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
   <button type="button" style={button} disabled={busy!==null}
    onClick={()=>run("preflight")}>{busy==="preflight"?"Validating current feed…":"1. Run read-only preflight"}</button>
  </div>
  <div style={{display:"grid",gap:9,padding:15,border:"1px solid #e9e3f0",borderRadius:12,background:"#faf8ff"}}>
   <label style={{display:"flex",alignItems:"flex-start",gap:9,lineHeight:1.45}}>
    <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
    I understand this will write a new or resumed Petlibro snapshot into <strong>private review only</strong>. It does not approve or publish any offer.
   </label>
   <div><button type="button" style={button} disabled={busy!==null||!preflightPassed||!confirmed}
    onClick={()=>run("stage")}>{busy==="stage"?"Staging privately…":"2. Stage validated feed privately"}</button></div>
   <small style={{color:"#635a70"}}>Staging is available only after a successful preflight in this session. The server validates the feed again and respects the global emergency stop and ingestion switch.</small>
  </div>
  {failure&&<p role="alert" style={{margin:0,color:"#9b2929",fontWeight:650}}>{failure}. No publication was requested.</p>}
  {result&&<div role="status" style={{padding:15,background:"#f1f8f1",borderRadius:12,display:"grid",gap:6}}>
   <strong>{result.status==="preflight_passed"?"Feed preflight passed":
    result.status==="already_staged"?"This exact feed snapshot was already staged":
    result.status==="private_review"?"Feed staged for private review":"Worker returned: "+(result.status??"unknown")}</strong>
   <span>{result.rows??result.records??"Unknown"} feed rows. {result.columns??result.source_columns?"Columns: "+(result.columns??result.source_columns)+".":""}</span>
   {result.currency_source&&<span>Currency evidence: {result.currency_source==="petlibro_uk_programme_gbp"?
    "GBP inferred from Petlibro's reviewed UK programme, not a feed currency column":result.currency_source}</span>}
   <small>Private staging does not create live offers. This result does not establish that product prices are currently approved for customers.</small>
  </div>}
 </section>;
}
