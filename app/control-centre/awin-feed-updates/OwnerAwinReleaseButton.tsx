"use client";
import {useState} from "react";

/** Exact owner intent and server-side reread prevent stale UI approvals. */
export default function OwnerAwinReleaseButton({offerId,action,disabled=false}:{
 offerId:string;action:"approve"|"pause";disabled?:boolean
}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function run(){
  const label=action==="approve"?"publish this priced Awin offer":"withdraw this public Awin offer";
  if(!window.confirm("Confirm you want to "+label+"? The server will recheck all evidence."))return;
  setBusy(true);setMessage("Checking live source evidence...");
  try{
   const response=await fetch("/api/control-centre/awin-first-release",{
    method:"POST",credentials:"same-origin",cache:"no-store",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({offer_id:offerId,action,confirm:"owner-"+action+"-"+offerId})
   });
   const payload=await response.json() as Record<string,unknown>;
   setMessage(response.ok?
    action==="approve"?"Approved. Reload to verify public status.":"Withdrawn. Reload to verify.":
    typeof payload.error==="string"?payload.error:"Release could not be confirmed");
  }catch{setMessage("Release service unavailable. No success claimed.");}
  finally{setBusy(false);}
 }
 return <div style={{display:"grid",gap:4}}>
  <button type="button" disabled={busy||disabled} onClick={run}
   style={{border:"1px solid #7765a1",background:"#f4effd",padding:"9px 12px",borderRadius:8}}>
   {busy?"Checking...":action==="approve"?"Approve exact offer":"Withdraw offer"}
  </button>
  {message&&<output role="status" style={{fontSize:12,maxWidth:240}}>{message}</output>}
 </div>;
}
