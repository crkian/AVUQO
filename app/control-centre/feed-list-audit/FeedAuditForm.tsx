"use client";
import {useState} from "react";
import {joinedAwinAdvertisers} from "../../../lib/awin/joined-catalogue";
import {buildAwinFeedMatrix,classifyFeedFormat,redactedFeedMatrixCsv} from "../../../lib/awin/feed-matrix";
type Feed={advertiserId:string;advertiserName:string;feedId:string;feedName:string;format:string;products:number;lastImported:string;language?:string;tooledUpFilenameMustBeChecked:boolean};
type Result={rowsInspected:number;activeRows:number;activeOutsideJoined:number;invalidRows:number;feeds:Feed[];byMerchant:{advertiserId:string;advertiserName:string;feedCount:number;allProductsFeedId:string|null}[];warning:string;tooledUpRule:string};
export default function FeedAuditForm(){
 const [result,setResult]=useState<Result|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const [merchant,setMerchant]=useState("all");
 const [format,setFormat]=useState("all");
 const [copyMessage,setCopyMessage]=useState("");
 async function inspect(form:FormData){
  setLoading(true);setError("");setResult(null);
  try{
   const r=await fetch("/api/control-centre/feed-list-audit",{method:"POST",body:form,cache:"no-store"});
   const j=await r.json();
   if(!r.ok)throw new Error(j.error??"Unable to inspect file");
   setResult(j);
  }catch(e){setError(e instanceof Error?e.message:"Unable to inspect file");}
  finally{setLoading(false);}
 }
 const matrix=result?buildAwinFeedMatrix(result.feeds):null;
 const shown=result?.feeds.filter(f=>(merchant==="all"||f.advertiserId===merchant)&&(format==="all"||classifyFeedFormat(f.format)===format))??[];
 async function copySafeMatrix(){if(!result)return;try{await navigator.clipboard.writeText(redactedFeedMatrixCsv(shown));setCopyMessage("Copied redacted feed metadata. No download URLs or keys included.");}catch{setCopyMessage("Clipboard not available; use the visible feed matrix.");}}
 return <div style={{display:"grid",gap:18,maxWidth:1100}}>
  <form action={inspect} style={{display:"grid",gap:11,padding:22,background:"#fff",border:"1px solid #e7e2ea",borderRadius:17}}>
   <label htmlFor="awin-feed-list"><strong>Awin Product Feed List CSV</strong></label>
   <p style={{margin:0,color:"#6c6375",fontSize:13}}>Upload the CSV from Awin to audit its available feeds. This screen never fetches the product URLs, stores the file, or returns signed links. Feed access and publishing remain disabled.</p>
   <input id="awin-feed-list" name="file" type="file" accept=".csv,text/csv" required disabled={loading}/>
   <button type="submit" disabled={loading} style={{border:0,borderRadius:11,background:"#543c72",color:"white",padding:14,fontWeight:800,cursor:"pointer"}}>{loading?"Checking safely…":"Inspect feed list privately"}</button>
  </form>
  {error&&<p role="alert">{error}</p>}
  {result&&<>
   <section style={{display:"flex",flexWrap:"wrap",gap:12}} aria-label="Feed inventory totals">
    {[["Inventory rows",result.rowsInspected],["Active feeds",result.activeRows],["Joined advertisers with active feeds",result.byMerchant.length],["Invalid entries",result.invalidRows]].map(([k,v])=><div key={k} style={{padding:18,background:"white",border:"1px solid #e7e2ea",borderRadius:14,minWidth:155}}><span style={{display:"block",fontSize:12,color:"#706679"}}>{k}</span><strong style={{fontSize:27}}>{v}</strong></div>)}
   </section>
   <p style={{padding:16,borderRadius:12,background:"#fff8ed",lineHeight:1.6,fontSize:13}}>{result.warning} {result.tooledUpRule}</p>
   <h2 style={{fontSize:26,margin:"16px 0 0",letterSpacing:"-.035em"}}>All 16 accepted programmes and their feed types</h2>
   <p style={{color:"#716979",fontSize:13,lineHeight:1.6,margin:0}}>This view groups the actual Awin feed-list entries, including large files and overlapping brand/category exports. A listed feed is not proof that an import is compatible, current, or licensed for publication. Counts from overlapping feeds must not be summed as unique products.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
    {[["Listed joined feeds",matrix?.feedsCount??0],["Programmes with listed feeds",matrix?.programmesWithFeeds??0],["Standard / legacy",matrix?.formatCounts.standard??0],["Google / enhanced",matrix?.formatCounts.enhanced??0],["Other formats",matrix?.formatCounts.other??0]].map(([label,count])=><div key={label} style={{border:"1px solid #e7e2ea",borderRadius:12,background:"#fff",padding:14}}><small style={{display:"block",color:"#736b76"}}>{label}</small><strong style={{fontSize:24}}>{count}</strong></div>)}
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
   <label htmlFor="merchant">Review advertiser</label>
   <label htmlFor="format">Feed format group</label>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
    <select id="merchant" value={merchant} onChange={e=>setMerchant(e.target.value)} style={{padding:12,borderRadius:10,width:"100%"}}>
     <option value="all">All 16 accepted programmes</option>
     {joinedAwinAdvertisers.map(([id,name])=><option value={id} key={id}>{name} ({matrix?.groups.find(g=>g.id===id)?.count??0} feeds)</option>)}
    </select>
    <select id="format" value={format} onChange={e=>setFormat(e.target.value)} style={{padding:12,borderRadius:10,width:"100%"}}>
     <option value="all">Every feed format</option>
     {["Standard / legacy","Google / enhanced","Other / inspect"].map(type=><option key={type} value={type}>{type}</option>)}
    </select>
   </div>
   <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
    <button onClick={copySafeMatrix} type="button" style={{border:"1px solid #d8cde5",borderRadius:10,minHeight:44,padding:"10px 16px",background:"white",color:"#563b80",fontWeight:800,cursor:"pointer"}}>Copy filtered redacted feed CSV</button>
    <span role="status" style={{fontSize:12,color:"#706679"}}>{shown.length} matching feeds. {copyMessage}</span>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
    {matrix?.groups.filter(g=>merchant==="all"||g.id===merchant).map(g=><div key={g.id} style={{border:"1px solid #e8e0e9",borderRadius:13,padding:14,background:"#fff",display:"grid",gap:5}}>
     <strong>{g.name}</strong>
     <small>AWIN {g.id} · {g.count} feed{g.count===1?"":"s"}</small>
     <small style={{color:"#796c7d"}}>{g.types.join(", ")||"No active feed in supplied inventory"}</small>
     {g.fullRangeCandidates.length>0&&<small style={{color:"#57447b"}}>{g.fullRangeCandidates.length} possible full-range feed{g.fullRangeCandidates.length===1?"":"s"}; verify overlap and filename</small>}
    </div>)}
   </div>
   <div style={{overflowX:"auto",background:"white",borderRadius:16,border:"1px solid #e7e2ea"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:700}}>
     <thead><tr>{["Advertiser","Feed ID","Feed name","Format","Format family","Products listed","Awin last imported","Required review"].map(x=><th key={x} style={{textAlign:"left",padding:12,background:"#f8f5f9"}}>{x}</th>)}</tr></thead>
     <tbody>{shown.map(f=><tr key={f.feedId}>{[f.advertiserName,f.feedId,f.feedName||"Unnamed",f.format,classifyFeedFormat(f.format),f.products.toLocaleString("en-GB"),f.lastImported,f.tooledUpFilenameMustBeChecked?"Check underlying awinnew filename":"Verify programme terms"].map((value,i)=><td key={i} style={{borderTop:"1px solid #eee9ef",padding:12}}>{value}</td>)}</tr>)}</tbody>
    </table>
   </div>
  </>}
 </div>;
}
