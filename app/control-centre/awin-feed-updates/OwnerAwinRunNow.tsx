"use client";
import {useState} from "react";
const tasks=[
 ["petlibro","Petlibro"],["mozillion","Mozillion"],
 ["cadbury","Cadbury Gifts"],["craftbuddy","Craft Buddy"],
 ["playpress_google","PlayPress Toys · Google"],["playpress_standard","PlayPress Toys · Awin"],
 ["petlibro_sale","Petlibro · Sale feed"],["petlibro_hero","Petlibro · Hero SKUs"],
 ["petlibro_standard","Petlibro · Standard feed"],
 ["tooled_up","Tooled Up master"],["pneus","Pneus Online tyres"],["tyres_uk","Tyres UK live feed"],["canonical","Fresh canonical offers"]
] as const;
export default function OwnerAwinRunNow(){
 const [busy,setBusy]=useState<string|null>(null);
 const [rotationStep,setRotationStep]=useState(0);
 const [results,setResults]=useState<Record<string,string>>({});
 async function run(task:string){
  setBusy(task);
  setResults(v=>({...v,[task]:"Running private source check..."}));
  try{
   const body:Record<string,string|number>={task};
   if(task==="portfolio_stage_next")body.step=rotationStep;
   if(!task.endsWith("_preflight")&&task!=="all_feeds_check"&&task!=="portfolio_schema_probe_next"&&task!=="portfolio_schema_probe_batch")body.confirm="private-only-"+task;
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
   const diagnostic=[o.importer_error,o.reason,o.failure_kind,o.diagnostic_stage,o.schema_reason,o.schema_delimiter,o.recognition_kind].filter(v=>
    typeof v==="string"&&/^[a-z0-9_]{2,80}$/.test(v)).join(" · ");
   const schema=typeof o.schema_status==="string"&&/^[a-z_]{3,40}$/.test(o.schema_status)
    ?" · schema "+o.schema_status:"";
   const schemaFields=Array.isArray(o.schema_fields)?o.schema_fields.filter(
    (x):x is string=>typeof x==="string"&&/^[a-z_]{2,40}$/.test(x))
    .slice(0,6).join(", "):"";
   const safeHeaders=Array.isArray(o.column_names)?o.column_names.filter(
    (v):v is string=>typeof v==="string"&&/^[A-Za-z][A-Za-z0-9_ -]{0,63}$/.test(v))
    .slice(0,50).join(", "):"";
   const selected=typeof o.advertiser_id==="string"&&typeof o.feed_id==="string"?
    " · advertiser "+o.advertiser_id+" / feed "+o.feed_id:"";
   const importer=typeof o.importer_status==="string"?" · importer "+o.importer_status:"";
   const eligible=typeof o.eligible==="number"?" · supported live feeds "+o.eligible:"";
   const inventory=typeof o.joined_feeds==="number"?" · joined feed entries "+o.joined_feeds.toLocaleString("en-GB"):"";
   const acceptedFeeds=typeof o.accepted_feed_count==="number"?" · accepted feed entries "+o.accepted_feed_count:"";
   const changed=typeof o.changed_feeds==="number"?" · changed "+o.changed_feeds.toLocaleString("en-GB"):"";
   const tooled=typeof o.live_rechecked==="number"
    ?" · live rechecked "+o.live_rechecked+
     " · HELD "+(o.canonical_held??0)+" · rejected "+(o.canonical_rejected??0):"";
   const tyres=typeof o.live_verified==="number"?" · source rows "+o.source_rows+" · newly verified "+o.live_verified+" · window "+o.window_index:"";
   const pneus=typeof o.committed==="number"?" · committed "+o.committed+" / "+(o.total??"?")+" rows":"";
   const batch=typeof o.batch_total==="number"?" · inspected "+o.batch_total+
    " · profiled "+(o.batch_profiled??0)+" · specialist "+(o.batch_specialist??0)+
    " · quarantined "+(o.batch_quarantined??0)+" · other "+(o.batch_errors??0):"";
   const parsed=typeof o.parsed_rows==="number"&&Number.isSafeInteger(o.parsed_rows)
    ?" · parsed "+o.parsed_rows.toLocaleString("en-GB"):"";
   const fresh=typeof o.live_verified_rows==="number"&&Number.isSafeInteger(o.live_verified_rows)
    ?" · fresh verified "+o.live_verified_rows.toLocaleString("en-GB"):"";
   const canonical=typeof o.canonical_status==="string"?
    " · canonical "+o.canonical_status:"";
   const staged=typeof o.canonical_accepted==="number"&&Number.isSafeInteger(o.canonical_accepted)
    ?" · held candidates "+o.canonical_accepted.toLocaleString("en-GB"):"";
   const rejected=typeof o.canonical_rejected==="number"&&Number.isSafeInteger(o.canonical_rejected)
    ?" · rejected "+o.canonical_rejected.toLocaleString("en-GB"):"";
   setResults(v=>({...v,[task]:(r.ok?"OK":"HTTP "+r.status)+": "+status+
    (diagnostic?" · "+diagnostic:"")+selected+importer+eligible+inventory+acceptedFeeds+changed+batch+tooled+pneus+tyres+parsed+
    (rows===null?"":" · "+rows.toLocaleString("en-GB")+" rows")+
    fresh+canonical+staged+rejected+schema+(schemaFields?" · recognised "+schemaFields:"")+(safeHeaders?" · columns "+safeHeaders:"")}));
  }catch{
   setResults(v=>({...v,[task]:"Private task unavailable. Check server logs."}));
  }finally{
   if(task==="portfolio_stage_next")setRotationStep(v=>(v+1)%9);
   setBusy(null);
  }
 }
 return <section style={{display:"grid",gap:12}}>
  <h2 style={{margin:0}}>Run existing supplier checks now (owner only)</h2>
  <p style={{margin:0,color:"#655d72",fontSize:13}}>Preflight does not write rows. Stage writes
   only private review records. Tooled Up captures an immutable master snapshot, then validates it.
   Fresh canonical preparation converts only recently validated GBP private feed products into HELD
   offers with AVUQO Scores, never public listings. All actions retain source and emergency controls.</p>
  <div style={{padding:14,border:"1px solid #d7c8ea",borderRadius:12,background:"#f8f5ff",display:"grid",gap:8}}>
   <strong>All accepted Awin feed entries</strong>
   <p style={{margin:0,fontSize:13}}>Check every joined feed in Awin's authenticated feed inventory, not just the four pilot retailers. Inventory monitoring does not download products or publish prices.</p>
   <button disabled={busy!==null} onClick={()=>run("all_feeds_check")} style={{padding:10,borderRadius:8,color:"#30205a",background:"#eee7ff",border:"1px solid #7965aa",maxWidth:330}}>
    {busy==="all_feeds_check"?"Checking all feed entries...":"Check all accepted feeds now"}
   </button>
   {results.all_feeds_check&&<output role="status" style={{fontSize:12,overflowWrap:"anywhere"}}>{results.all_feeds_check}</output>}
  </div>
  <div style={{padding:14,border:"1px solid #d7c8ea",borderRadius:12,background:"#f7f5ff",display:"grid",gap:8}}>
   <strong>Universal schema inspection: all accepted feeds</strong>
   <p style={{margin:0,fontSize:13}}>Inspect the next uninspected accepted feed per click. The server remembers inspection results between sessions and retries the oldest when coverage is complete. This is read-only: no product staging, public prices, permissions changes or signed URL exposure. Large and specialist feeds remain on their dedicated routes. Oversized files will be identified for a streamed adapter.</p>
   <button disabled={busy!==null} onClick={()=>run("portfolio_schema_probe_next")} style={{padding:10,borderRadius:8,color:"#30205a",background:"#eee7ff",border:"1px solid #7965aa",maxWidth:350}}>
    {busy==="portfolio_schema_probe_next"?"Inspecting accepted feed...":"Inspect next accepted feed"}
   </button>
   {results.portfolio_schema_probe_next&&<output role="status" style={{fontSize:12,overflowWrap:"anywhere"}}>{results.portfolio_schema_probe_next}</output>}
   <button disabled={busy!==null} onClick={()=>run("portfolio_schema_probe_batch")} style={{padding:10,borderRadius:8,color:"#30205a",background:"#e7e1fd",border:"1px solid #7965aa",maxWidth:350}}>
    {busy==="portfolio_schema_probe_batch"?"Inspecting five accepted feeds...":"Inspect next 5 accepted feeds"}
   </button>
   {results.portfolio_schema_probe_batch&&<output role="status" style={{fontSize:12,overflowWrap:"anywhere"}}>{results.portfolio_schema_probe_batch}</output>}
  </div>
  <div style={{padding:14,border:"1px solid #d7c8ea",borderRadius:12,background:"#fff",display:"grid",gap:8}}>
   <strong>Accepted retail feed rotation: retry the next supplier</strong>
   <p style={{margin:0,fontSize:13}}>Run one bounded accepted feed per click. After any failure, click again to try another supported feed; the backend chooses the exact advertiser and URL. Daily cron continues independently. Tyres, travel and contracts stay in their specialist pipelines.</p>
   <button disabled={busy!==null} onClick={()=>run("portfolio_stage_next")} style={{padding:10,borderRadius:8,color:"#30205a",background:"#f4effd",border:"1px solid #7965aa",maxWidth:330}}>
    {busy==="portfolio_stage_next"?"Checking selected retail feed...":"Try another accepted retail feed"}
   </button>
   {results.portfolio_stage_next&&<output role="status" style={{fontSize:12,overflowWrap:"anywhere"}}>{results.portfolio_stage_next}</output>}
  </div>
  <div style={{padding:14,border:"1px solid #d7c8ea",borderRadius:12,display:"grid",gap:8}}>
   <strong>Advanced tyre feeds: Tyres UK and Pneus Online</strong>
   <p style={{margin:0,fontSize:13}}>Both suppliers stay in the specialised tyre pipeline. Size, load, speed, exact variant, fitment, delivery and fitted pricing require independent checks. Their private imports must never be sold as confirmed fitted quotes.</p>
   <a href="/control-centre/tyres">Open specialist tyre operations</a>
   <a href="/control-centre/tyre-spec-enrichment">Review tyre specification enrichment</a>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
   {tasks.map(([slug,name])=><article key={slug} style={{background:"white",border:"1px solid #e7dfed",
    borderRadius:12,padding:13,display:"grid",gap:7}}>
    <strong>{name}</strong>
    {(slug==="tooled_up"?["snapshot","validate","cohort"]:slug==="canonical"?["bridge"]:slug==="pneus"?["import"]:slug==="tyres_uk"?["recheck"]:["preflight","stage"]).map(mode=>{
     const task=slug+"_"+mode;
     const caption=mode==="preflight"?"Check live feed":mode==="stage"?"Stage privately":
      mode==="snapshot"?"Capture snapshot":mode==="bridge"?"Prepare held offers":mode==="cohort"?"Stage current tool cohort to HELD":mode==="import"?"Import tyre feed privately":mode==="recheck"?"Recheck exact tyre product prices":"Validate snapshot";
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
