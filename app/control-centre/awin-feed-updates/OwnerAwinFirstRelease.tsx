"use client";
import {useEffect,useState} from "react";

type Candidate={offerId:string;title:string;merchant:string;advertiserId:string;priceGbp:number;lastSeenAt:string;score:number;confidence:number};
type Queue={status:string;totalCanonicalOffers?:number;candidates?:Candidate[];note?:string;next?:string;error?:string;
 ownerAuthorization?:boolean;readiness?:{sourceStatus:string;syncEnabled:boolean;credentialRegistry:string;
 publicationPermission:string;priceEvidence:string}};
export default function OwnerAwinFirstRelease(){
 const [queue,setQueue]=useState<Queue|null>(null);
 const [busy,setBusy]=useState(false);
 const [result,setResult]=useState("");
 const [confirmId,setConfirmId]=useState("");
 async function refresh(){
  setBusy(true);
  try{
   const response=await fetch("/api/control-centre/awin-first-release",{cache:"no-store",credentials:"same-origin"});
   const data=await response.json() as Queue;
   setQueue(response.ok?data:{status:"unavailable",error:data.error??"Readiness service unavailable"});
  }catch{setQueue({status:"unavailable",error:"Current offer review unavailable"});}
  finally{setBusy(false);}
 }
 useEffect(()=>{void refresh();},[]);
 async function act(c:Candidate){
  if(confirmId!==c.offerId)return;
  setBusy(true);setResult("Rechecking the exact current GBP offer and release evidence...");
  try{
   const r=await fetch("/api/control-centre/awin-first-release",{
    method:"POST",credentials:"same-origin",cache:"no-store",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({offer_id:c.offerId,action:"approve",
     confirm:"owner-approve-"+c.offerId})
   });
   const outcome=await r.json() as {status?:string;error?:string};
   setResult(r.ok&&outcome.status==="approved"?
    "Exact offer released by the atomic owner approval function.":
    outcome.error??"The source or price evidence changed, so the offer remains held.");
   setConfirmId("");await refresh();
  }catch{setResult("Release unavailable; no success has been confirmed.");}
  finally{setBusy(false);}
 }
 return <section aria-label="First Awin product release" style={{display:"grid",gap:12,
  padding:18,border:"1px solid #ddd2e7",borderRadius:14,background:"#fff"}}>
  <h2 style={{margin:0}}>First live priced products</h2>
  <p style={{margin:0,fontSize:13,lineHeight:1.6,color:"#62576e"}}>
   These are verified, current GBP offers already in the canonical product pipeline.
   Awin membership is recorded for 21 accepted publishers. Your standing approval
   for eligible product publication is recorded in the backend. The current first-release
   mechanism still requires an exact-offer confirmation and atomic safety recheck;
   it is not yet fully automated. Historical private rows cannot be published as live prices.
  </p>
  <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
   <strong>{queue?.totalCanonicalOffers??0} canonical Awin offers</strong>
   <strong>{queue?.candidates?.length??0} eligible first releases</strong>
   <button disabled={busy} onClick={()=>void refresh()} style={{padding:"8px 12px",
    border:"1px solid #73619a",borderRadius:8,background:"#f8f5ff"}}>
    {busy?"Checking...":"Refresh live readiness"}
   </button>
  </div>
  {queue?.status==="source_not_launch_ready"&&<div role="status" style={{display:"grid",gap:5,
    padding:12,borderRadius:10,background:"#f8f5ff",fontSize:13}}>
   <strong>Publication authorisation: {queue.ownerAuthorization?"Recorded and granted":"Not confirmed in source registry"}</strong>
   <span>Source: {queue.readiness?.sourceStatus??"unknown"} · automatic synchronisation: {queue.readiness?.syncEnabled?"on":"off"}</span>
   <span>Credential registry: {queue.readiness?.credentialRegistry??"unknown"} · merchant/source publication evidence: {queue.readiness?.publicationPermission??"pending"}</span>
   <span>Current GBP price evidence: {queue.readiness?.priceEvidence??"pending"}</span>
   <span>These are operational evidence checks, not a request for another owner approval. {queue.next??""}</span>
  </div>}
  {queue?.error&&<p role="alert">{queue.error}</p>}
  {queue?.status!=="source_not_launch_ready"&&!queue?.candidates?.length&&!queue?.error&&
   <p role="status">No current, price-verified offers are ready for owner release.</p>}
  {(queue?.candidates??[]).map(c=><article key={c.offerId} style={{display:"grid",gap:7,
   borderTop:"1px solid #eee7f4",paddingTop:12}}>
   <strong>{c.title}</strong>
   <span>{c.merchant} · Awin {c.advertiserId} · <b>£{c.priceGbp.toFixed(2)}</b></span>
   <span style={{color:"#6a5c76",fontSize:12}}>Price observed {new Date(c.lastSeenAt).toLocaleString("en-GB",{timeZone:"Europe/London"})}
    {" · "}AVUQO Score {c.score} ({c.confidence}% confidence)</span>
   <label style={{fontSize:13}}>
    <input type="checkbox" disabled={busy} checked={confirmId===c.offerId}
     onChange={e=>setConfirmId(e.target.checked?c.offerId:"")}/>
    {" "}I approve this exact currently displayed GBP offer for first public release
   </label>
   <button disabled={busy||confirmId!==c.offerId} onClick={()=>void act(c)}
    style={{padding:9,border:"1px solid #634899",borderRadius:8,background:"#eee8fc",maxWidth:260}}>
    Approve exact offer for public release
   </button>
  </article>)}
  {result&&<output role="status">{result}</output>}
 </section>;
}
