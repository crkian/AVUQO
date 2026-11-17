"use client";
import {useState} from "react";
const tasks=[
 ["petlibro","Petlibro"],["mozillion","Mozillion"],
 ["cadbury","Cadbury Gifts"],["craftbuddy","Craft Buddy"],
 ["tooled_up","Tooled Up master"],["canonical","Fresh canonical offers"]
] as const;
export default function OwnerAwinRunNow(){
 const [busy,setBusy]=useState<string|null>(null);
 const [results,setResults]=useState<Record<string,string>>({});
 async function run(task:string){
  setBusy(task);
  setResults(v=>({...v,[task]:"Running private source check..."}));
  try{
   const body:Record<string,string>={task};
   if(!task.endsWith("_preflight"))body.confirm="private-only-"+task;
   const r=await fetch("/api/control-centre/awin-run-now",{
    method:"POST",credentials:"same-origin",cache:"no-store",
    headers:{"content-type":"application/json"},body:JSON.stringify(body)
   });
   const o=await r.json() as Record<string,unknown>;
   const status=typeof o.status==="string"?o.status:
    typeof o.error==="string"?o.error:"Unknown outcome";
   const rows=typeof o.held_total==="number"?o.held_total:
    typeof o.records==="number"?o.records:
    typeof o.rows==="number"?o.rows:
    typeof o.actual_rows==="number"?o.actual_rows:null;
   const diagnostic=[o.reason,o.failure_kind,o.diagnostic_stage].filter(v=>
    typeof v==="string"&&/^[a-z0-9_]{2,80}$/.test(v)).join(" · ");
   const parsed=typeof o.parsed_rows==="number"&&Number.isSafeInteger(o.parsed_rows)
    ?" · parsed "+o.parsed_rows.toLocaleString("en-GB"):"";
   setResults(v=>({...v,[task]:(r.ok?"OK":"HTTP "+r.status)+": "+status+
    (diagnostic?" · "+diagnostic:"")+parsed+
    (rows===null?"":" · "+rows.toLocaleString("en-GB")+" rows")}));
  }catch{
   setResults(v=>({...v,[task]:"Private task unavailable. Check server logs."}));
  }finally{setBusy(null);}
 }
 return <section style={{display:"grid",gap:12}}>
  <h2 style={{margin:0}}>Run existing supplier checks now (owner only)</h2>
  <p style={{margin:0,color:"#655d72",fontSize:13}}>Preflight does not write rows. Stage writes
   only private review records. Tooled Up captures an immutable master snapshot, then validates it.
   Fresh canonical preparation converts only recently validated GBP private feed products into HELD
   offers with AVUQO Scores, never public listings. All actions retain source and emergency controls.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
   {tasks.map(([slug,name])=><article key={slug} style={{background:"white",border:"1px solid #e7dfed",
    borderRadius:12,padding:13,display:"grid",gap:7}}>
    <strong>{name}</strong>
    {(slug==="tooled_up"?["snapshot","validate"]:slug==="canonical"?["bridge"]:["preflight","stage"]).map(mode=>{
     const task=slug+"_"+mode;
     const caption=mode==="preflight"?"Check live feed":mode==="stage"?"Stage privately":
      mode==="snapshot"?"Capture snapshot":mode==="bridge"?"Prepare held offers":"Validate snapshot";
     return <div key={task} style={{display:"grid",gap:3}}>
      <button disabled={busy!==null} onClick={()=>run(task)} style={{padding:9,borderRadius:8,
       color:"#30205a",background:"#f4effd",border:"1px solid #7965aa"}}>
       {busy===task?"Running...":caption}
      </button>
      {results[task]&&<output role="status" style={{fontSize:12,overflowWrap:"anywhere"}}>
       {results[task]}
      </output>}
     </div>;
    })}
   </article>)}
  </div>
 </section>;
}
