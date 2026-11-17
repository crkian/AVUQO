import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import OwnerAwinRunNow from "./OwnerAwinRunNow";
import OwnerAwinFirstRelease from "./OwnerAwinFirstRelease";
import OwnerAwinReleaseQueue from "./OwnerAwinReleaseQueue";
import {acceptedAwinPortfolio} from "../../../lib/awin/portfolio-evidence";
export const metadata:Metadata={title:"Private Awin feed updates | AVUQO",robots:{index:false,follow:false}};
type Feed={advertiser_id:string;feed_id:string;advertiser_name:string;feed_name:string;listed_products:number;last_imported_source:string;observed_at:string;needs_private_refresh:boolean;change_count:number};
type Run={checked_at:string;active_feeds:number;joined_feeds:number;changed_feeds:number};
export default async function Page(){
 await connection();
 const {role}=await requireControlCentreAccess();
 const admin=createAdminClient();
 const [feeds,runs,refresh,attempts,programmes,source,profiles,readiness,tooledValidation]=await Promise.all([
  admin.from("awin_feed_update_observations").select("advertiser_id,feed_id,advertiser_name,feed_name,listed_products,last_imported_source,observed_at,needs_private_refresh,change_count").order("needs_private_refresh",{ascending:false}).order("advertiser_name",{ascending:true}).limit(200),
  admin.from("awin_feed_discovery_runs").select("checked_at,active_feeds,joined_feeds,changed_feeds").order("checked_at",{ascending:false}).limit(1),
  admin.from("awin_feed_update_observations").select("feed_id",{count:"exact",head:true}).eq("needs_private_refresh",true),
  admin.from("awin_private_cron_attempts").select("job_key,started_at,state,http_status,outcome_code,duration_ms")
   .order("started_at",{ascending:false}).limit(24),
  admin.from("affiliate_programs").select("programme_name,external_account_id,status,metadata")
   .eq("provider","awin").limit(100),
  admin.from("sources").select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle(),
  admin.from("awin_feed_schema_profiles").select("advertiser_id,feed_id,status,schema_status,recognition_kind,schema_reason,checked_at").order("checked_at",{ascending:false}).limit(200),
  admin.from("awin_private_product_readiness").select("advertiser_id,private_rows,review_rows,gbp_priced_rows,tracking_marked_rows,stock_field_rows,primary_image_rows,image_rights_marked_rows,live_rechecked_rows,latest_private_import_at").limit(100),
  admin.from("awin_private_snapshot_validations").select("actual_rows,critical_issues,duplicate_product_ids,invalid_price_rows,unverified_affiliate_links,currency_verified,rights_verified,ready_to_stage,validated_at").eq("advertiser_id","496").eq("feed_id","89987").order("validated_at",{ascending:false}).limit(1)
 ]);
 const portfolio=acceptedAwinPortfolio(
  programmes.data??[],feeds.data??[],source.data??null
 );
 const acceptedCount=portfolio.filter(p=>p.membership==="accepted").length;
 const unlinkedCount=portfolio.filter(p=>!p.sourceRegistryLinked).length;
 const records=(feeds.data??[]) as Feed[];
 const inspected=profiles.data??[];
 const acceptedIds=new Set(portfolio.filter(p=>p.membership==="accepted").map(p=>p.advertiserId).filter(Boolean));
 const eligibleObserved=records.filter(f=>acceptedIds.has(f.advertiser_id));
 const acceptedKeys=new Set(eligibleObserved.map(f=>f.advertiser_id+":"+f.feed_id));
 const covered=inspected.filter(p=>acceptedKeys.has(p.advertiser_id+":"+p.feed_id));
 const summaryById=new Map((readiness.data??[]).map(p=>[p.advertiser_id,p]));
 const sourceMeta=source.data?.metadata&&typeof source.data.metadata==="object"&&!Array.isArray(source.data.metadata)?source.data.metadata as Record<string,unknown>:{};
 const sourcePaused=source.data?.status!=="active"||source.data?.sync_enabled!==true||sourceMeta.publication_permission!=="verified"||sourceMeta.price_evidence_status!=="verified";
 const history=(runs.data??[]) as Run[];
 const enabled=process.env.AWIN_FEED_MONITOR_ENABLED==="true";
 const configured=/^[a-zA-Z0-9_-]{16,200}$/.test(process.env.AWIN_DATAFEED_API_KEY??"")
  &&/^[0-9]{3,15}$/.test(process.env.AWIN_PUBLISHER_ID??"")&&(process.env.CRON_SECRET?.length??0)>=16;
 const lastCheck=history[0];
 const stale=lastCheck&&new Date().getTime()-Date.parse(lastCheck.checked_at)>36*60*60*1000;
 return <main style={{maxWidth:1200,padding:"32px 20px 80px",margin:"auto",display:"grid",gap:22}}>
  <nav><Link href="/control-centre/feed-list-audit">← Awin feed inventory</Link></nav>
  <header><p style={{color:"#7351b0",fontSize:12,letterSpacing:1.4,fontWeight:800}}>OWNER-ONLY / SOURCE FRESHNESS</p>
   <h1 style={{fontSize:36,margin:"8px 0"}}>Awin feed update monitor</h1>
   <p style={{maxWidth:800,lineHeight:1.6,color:"#6a6276"}}>Daily metadata-only discovery of updates from joined Awin advertisers. This does not download product rows, activate affiliate offers or establish permission to publish images and prices.</p>
  </header>
  <section style={{display:"flex",gap:14,flexWrap:"wrap"}}>
   {[
    ["Configuration",!enabled?"Disabled":configured?"Enabled · 06:17 UTC daily":"Enabled flag set · missing configuration"],
    ["Last successful check",runs.error?"Unavailable":lastCheck?new Date(lastCheck.checked_at).toLocaleString("en-GB",{timeZone:"Europe/London"}):"No check recorded"],
    ["Feeds flagged for private refresh",refresh.error?"Unavailable":String(refresh.count??0)]
   ].map(([title,value])=><div key={title} style={{background:"white",border:"1px solid #e8e3ed",borderRadius:14,padding:17,minWidth:220,flex:1}}>
    <div style={{color:"#776e82",fontSize:12}}>{title}</div><strong>{value}</strong>
   </div>)}
  </section>
  {stale&&enabled&&<p role="status">No successful check in the last 36 hours. Review the scheduled invocation before relying on this inventory.</p>}
  {feeds.error||runs.error||refresh.error?<p role="alert">Feed monitoring history is unavailable. Confirm the private discovery migration has been applied.</p>:null}
  <section aria-label="Accepted Awin publisher portfolio" style={{display:"grid",gap:10}}>
   <h2>Accepted Awin publisher portfolio</h2>
   <p style={{color:"#60586c",lineHeight:1.6}}>
    The owner has confirmed acceptance for the full joined Awin portfolio, recorded per
    programme in the existing affiliate programme evidence registry. These are not pending
    applications. Public product admission still checks fresh GBP prices, tracking, stock
    and the exact first-offer release. No additional API endpoint has been added.
   </p>
   <p><strong>{acceptedCount} accepted of {portfolio.length} recorded programmes</strong>
    {" · "}{unlinkedCount} not yet linked to the older source registry
    {" · "}{portfolio.filter(p=>!p.advertiserId).length} without mapped advertiser IDs
   </p>
   {programmes.error||source.error?<p role="alert">Accepted-programme evidence unavailable. Do not infer membership was revoked.</p>:null}
   <div style={{overflowX:"auto",background:"white",border:"1px solid #e8e3ed",borderRadius:14}}>
    <table style={{borderCollapse:"collapse",width:"100%",minWidth:850,fontSize:12}}>
     <thead><tr>{["Accepted publisher","Advertiser ID","Membership","Source registry","Observed feeds","Latest inventory (UK)","Live-data next step"].map(h=>
      <th key={h} style={{background:"#f8f5fa",padding:10,textAlign:"left"}}>{h}</th>)}</tr></thead>
     <tbody>{portfolio.map(p=><tr key={p.programme}>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.programme}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.advertiserId??"Needs ID mapping"}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.membership==="accepted"?"Accepted · "+(p.acceptedOn??"owner evidenced"):"Evidence review"}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.sourceRegistryLinked?"Linked":"Not linked"}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.liveFeeds}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.mostRecentFeedObservation?
       new Date(p.mostRecentFeedObservation).toLocaleDateString("en-GB",{timeZone:"Europe/London"}):"No observed feed"}</td>
      <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{p.next}</td>
     </tr>)}</tbody>
    </table>
   </div>
  </section>
  <section style={{display:"grid",gap:12,background:"white",border:"1px solid #ddd2e9",borderRadius:16,padding:18}}>
   <h2 style={{margin:0}}>Accepted feed schema inspection progress</h2>
   <p style={{margin:0,fontSize:13,color:"#625b70"}}>Private structural evidence only. These results do not authorise product publication or imply usable current prices.</p>
   {profiles.error?<p role="alert">Private profile ledger unavailable. Apply the versioned schema migration before inspecting feeds.</p>:
    <>
     <p><strong>{covered.length} / {eligibleObserved.length}</strong> currently observed accepted feeds inspected · <strong>{Math.max(0,eligibleObserved.length-covered.length)}</strong> still to inspect</p>
     <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",minWidth:670,fontSize:12}}>
       <thead><tr>{["Advertiser","Feed","Inspection","Schema","Checked (UK)"].map(h=><th key={h} style={{textAlign:"left",padding:9,background:"#f8f5fa"}}>{h}</th>)}</tr></thead>
       <tbody>{covered.slice(0,25).map(p=><tr key={p.advertiser_id+":"+p.feed_id}>
        <td style={{padding:9,borderTop:"1px solid #eee7f4"}}>{p.advertiser_id}</td>
        <td style={{padding:9,borderTop:"1px solid #eee7f4"}}>{p.feed_id}</td>
        <td style={{padding:9,borderTop:"1px solid #eee7f4"}}>{p.status}</td>
        <td style={{padding:9,borderTop:"1px solid #eee7f4"}}>{p.schema_status??"Requires inspection"}</td>
        <td style={{padding:9,borderTop:"1px solid #eee7f4"}}>{new Date(p.checked_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}</td>
       </tr>)}</tbody>
      </table>
     </div>
     {covered.length===0?<p>No private schema inspections recorded yet. Use the inspection action below to begin.</p>:null}
    </>}
  </section>
  {role==="owner"&&<section aria-label="Awin live launch blockers by publisher" style={{display:"grid",gap:12,background:"white",border:"1px solid #d5c5e3",borderRadius:16,padding:18}}>
   <h2 style={{margin:0}}>Publisher-by-publisher launch evidence</h2>
   <p style={{margin:0,fontSize:13,color:"#5f5669",lineHeight:1.6}}>Private staging counts, not live or authorised products. Verification marks are shown independently; a stock field or image URL alone never establishes current stock or image rights.</p>
   <p role="status" style={{fontSize:13,margin:0}}><strong>Awin source publication:</strong> {sourcePaused?"Blocked pending verified source rights, current price evidence and activation":"Source evidence checks appear enabled; individual offer and first-release gates still apply"}.</p>
   {readiness.error?<p role="alert">Private readiness aggregates unavailable. Confirm the service-only migration has been applied.</p>:
    <div style={{overflowX:"auto"}}>
     <table style={{borderCollapse:"collapse",width:"100%",minWidth:1080,fontSize:12}}>
      <thead><tr>{["Accepted publisher","Private rows","GBP priced","Tracking marked","Stock field","Primary image","Image rights marked","Fresh rechecked","Next operational blocker"].map(h=>
       <th key={h} style={{background:"#f8f5fa",padding:10,textAlign:"left"}}>{h}</th>)}</tr></thead>
      <tbody>{portfolio.filter(p=>p.membership==="accepted").map(p=>{
       const row=p.advertiserId?summaryById.get(p.advertiserId):undefined;
       const number=(key:"private_rows"|"gbp_priced_rows"|"tracking_marked_rows"|"stock_field_rows"|"primary_image_rows"|"image_rights_marked_rows"|"live_rechecked_rows")=>Number(row?.[key]??0).toLocaleString("en-GB");
       const next=!p.advertiserId?"Map advertiser ID":p.liveFeeds===0?"Find approved feed or specialist referral":!row||Number(row.private_rows)===0?"Stage and validate feed privately":Number(row.live_rechecked_rows)===0?"Recheck exact current price, stock and Awin tracking":Number(row.image_rights_marked_rows)===0?"Verify merchant image-use rights":"Review release evidence";
       return <tr key={p.programme}>
        <th scope="row" style={{padding:9,borderTop:"1px solid #ede7f3",textAlign:"left"}}>{p.programme}</th>
        {[number("private_rows"),number("gbp_priced_rows"),number("tracking_marked_rows"),number("stock_field_rows"),number("primary_image_rows"),number("image_rights_marked_rows"),number("live_rechecked_rows"),next].map((value,i)=>
         <td key={i} style={{padding:9,borderTop:"1px solid #ede7f3"}}>{value}</td>)}
       </tr>;
      })}</tbody>
     </table>
    </div>}
  </section>}
  {role==="owner"&&<section aria-label="Tooled Up large-feed automation" style={{background:"white",border:"1px solid #d7c9e6",borderRadius:16,padding:18,display:"grid",gap:10}}>
   <h2 style={{margin:0}}>Tooled Up: 84,000+ product master feed</h2>
   <p style={{margin:0,lineHeight:1.6,color:"#5f5669"}}>The existing private, content-addressed gzip capture and exhaustive stream validator are connected to the active Awin source. Every four hours AVUQO captures an immutable snapshot, validates the complete feed 20 minutes later, then checks a bounded SKU cohort 10 minutes after validation. Exact matches enter HELD review; this does not automatically approve every item.</p>
   {tooledValidation.error?<p role="alert">Latest private Tooled Up snapshot audit unavailable.</p>:
   tooledValidation.data?.[0]?<div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13}}>
    <span><strong>{Number(tooledValidation.data[0].actual_rows).toLocaleString("en-GB")}</strong> rows in last validated master feed</span>
    <span><strong>{tooledValidation.data[0].critical_issues}</strong> critical structural issues</span>
    <span>Validated {new Date(tooledValidation.data[0].validated_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}</span>
    <span>Currency evidence: <strong>{tooledValidation.data[0].currency_verified?"Verified":"Still requires exact feed evidence"}</strong></span>
   </div>:<p>No complete snapshot validation recorded yet.</p>}
   <p style={{fontSize:13,margin:0}}>Public release stays separate: exact current UK-storefront GBP price evidence, source-matched photo, stock, affiliate tracking, SKU identity, score and atomic approval. The master feed has no explicit currency column; an exact historical GBP match plus verified UK merchant storefront is required. Historic private import rows do not become public merely because the snapshot validated.</p>
  </section>}
  {role==="owner"&&<OwnerAwinFirstRelease/>}
  {role==="owner"&&<OwnerAwinRunNow/>}
  {role==="owner"&&<OwnerAwinReleaseQueue/>}
  <div style={{overflowX:"auto",background:"white",border:"1px solid #e8e3ed",borderRadius:16}}>
   <table style={{borderCollapse:"collapse",width:"100%",minWidth:750,fontSize:13}}>
    <thead><tr>{["Advertiser","Feed","Listed products","Awin last updated","Last seen (UK)","Private refresh flag","Change count"].map(h=><th key={h} style={{background:"#f8f5fa",padding:12,textAlign:"left"}}>{h}</th>)}</tr></thead>
    <tbody>{records.map(f=><tr key={f.advertiser_id+":"+f.feed_id}>
     {[f.advertiser_name,f.feed_name||f.feed_id,f.listed_products.toLocaleString("en-GB"),f.last_imported_source||"Unknown",new Date(f.observed_at).toLocaleDateString("en-GB",{timeZone:"Europe/London"}),f.needs_private_refresh?"Review required":"No new change detected",String(f.change_count)].map((v,i)=><td key={i} style={{padding:12,borderTop:"1px solid #efeaf1"}}>{v}</td>)}
    </tr>)}</tbody>
   </table>
   {!feeds.error&&records.length===0&&<p style={{padding:16,color:"#655c70"}}>No automatic feed checks have been recorded.</p>}
  </div>
  <section style={{display:"grid",gap:8}}>
   <h2>Six private scheduled job outcomes</h2>
   <p style={{fontSize:13,color:"#766b82"}}>Manual owner actions above do not appear as scheduled Cron attempts.</p>
   {attempts.error&&<p role="alert">Private Cron journal unavailable.</p>}
   <div style={{overflowX:"auto",background:"white",border:"1px solid #e8e3ed",borderRadius:12}}>
    <table style={{width:"100%",minWidth:650,borderCollapse:"collapse",fontSize:12}}>
     <thead><tr>{["Job","Started (UK)","State","HTTP","Outcome","Duration"].map(h=>
       <th key={h} style={{padding:10,background:"#f8f5fa",textAlign:"left"}}>{h}</th>)}</tr></thead>
     <tbody>{(attempts.data??[]).map((a,i)=><tr key={i}>
       {[a.job_key,new Date(a.started_at).toLocaleString("en-GB",{timeZone:"Europe/London"}),
         a.state,a.http_status??"–",a.outcome_code??"–",
         typeof a.duration_ms==="number"?a.duration_ms+"ms":"–"].map((x,k)=>
         <td key={k} style={{padding:10,borderTop:"1px solid #efeaf1"}}>{x}</td>)}
      </tr>)}</tbody>
    </table>
    {!attempts.error&&!(attempts.data??[]).length&&<p style={{padding:12}}>No scheduled private attempts recorded yet.</p>}
   </div>
  </section>
  <p style={{fontSize:13,color:"#736b7d"}}>Only metadata from Awin&apos;s feed list is stored. Signed download URLs and API keys are never returned by this screen. A marked update is not an import and does not withdraw or publish any product.</p>
  <Link href="/control-centre/feed-imports">Review private product imports</Link>
 </main>;
}
