"use client";
import {useState} from "react";
type Feed={advertiserId:string;advertiserName:string;feedId:string;feedName:string;format:string;products:number;lastImported:string;tooledUpFilenameMustBeChecked:boolean};
type Result={rowsInspected:number;activeRows:number;activeOutsideJoined:number;invalidRows:number;feeds:Feed[];byMerchant:{advertiserId:string;advertiserName:string;feedCount:number;allProductsFeedId:string|null}[];warning:string;tooledUpRule:string};
export default function FeedAuditForm(){
 const [result,setResult]=useState<Result|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const [merchant,setMerchant]=useState("496");
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
 const shown=result?.feeds.filter(f=>f.advertiserId===merchant)??[];
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
   <label htmlFor="merchant">Review a joined advertiser</label>
   <select id="merchant" value={merchant} onChange={e=>setMerchant(e.target.value)} style={{padding:12,borderRadius:10,maxWidth:500}}>
    {result.byMerchant.map(m=><option value={m.advertiserId} key={m.advertiserId}>{m.advertiserName} ({m.feedCount} feeds)</option>)}
   </select>
   <div style={{overflowX:"auto",background:"white",borderRadius:16,border:"1px solid #e7e2ea"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:700}}>
     <thead><tr>{["Feed ID","Feed name","Format","Products listed","Awin last imported","Required review"].map(x=><th key={x} style={{textAlign:"left",padding:12,background:"#f8f5f9"}}>{x}</th>)}</tr></thead>
     <tbody>{shown.map(f=><tr key={f.feedId}>{[f.feedId,f.feedName||"Unnamed",f.format,f.products.toLocaleString("en-GB"),f.lastImported,f.tooledUpFilenameMustBeChecked?"Check underlying awinnew filename":"Verify programme terms"].map((value,i)=><td key={i} style={{borderTop:"1px solid #eee9ef",padding:12}}>{value}</td>)}</tr>)}</tbody>
    </table>
   </div>
  </>}
 </div>;
}
