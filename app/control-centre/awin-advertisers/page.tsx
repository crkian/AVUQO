import Link from "next/link";
import {connection} from "next/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {sourceEvidenceFailures,evaluateSourceControls} from "../../../lib/pipeline/source-readiness";
import {advertisersFromMetadata,releaseIssues} from "../../../lib/awin/advertiser-onboarding";
import {registerAwinAdvertiser,attestAwinAdvertiserRights,testAwinFeedConnection,approveAwinPriceEvidence,setAwinOfferRelease} from "./actions";
import {setSourceStatus} from "../actions";
import {runAwinPipeline} from "../pipeline/actions";
import styles from "../control-centre.module.css";

export const instant=false;

const field:React.CSSProperties={display:"grid",gap:6,fontWeight:700,fontSize:13};
const input:React.CSSProperties={padding:11,border:"1px solid #d8d4df",borderRadius:10,width:"100%"};
const formStyle:React.CSSProperties={display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",alignItems:"end"};
const date=(raw:unknown)=>typeof raw==="string"&&Number.isFinite(Date.parse(raw))?new Date(raw).toLocaleString("en-GB"):"Not verified";
const info:Record<string,string>={
 registered:"Advertiser saved as a private, paused draft. No feed or offer was published.",
 rights:"Owner permission references recorded. This is not independent confirmation from Awin.",
 connected:"Read-only API test succeeded for the matching advertiser. Source remains paused.",
 "probe-failed":"API test failed or returned no matching items. Credentials were not marked ready and no product data was saved.",
 pricing:"Reviewed price sample and evidence recorded. All offers still require individual owner release.",
 published:"The selected offer was released after all checks, with a private audit record.",
 paused:"The selected offer was paused and removed from the public release.",
};
type Source={id:string;status:string;sync_enabled:boolean;credential_status:string;health_status:string;connector_key:string;source_type:string;metadata:unknown};
type Offer={id:string;product_id:string|null;merchant_id:string;source_id:string;price:number;currency:string;status:string;affiliate_url:string|null;source_url:string|null;stock_status:string;last_seen_at:string;match_confidence:number};
type Product={id:string;slug:string|null;status:string};
type Merchant={id:string;metadata:unknown};
type Score={offer_id:string;score:number;confidence:number;calculated_at:string};
type Deal={offer_id:string;status:string;title:string;merchant:string;current_price:number};
type Review={offer_id:string;status:string;advertiser_id:string;approved_at:string;approved_by:string};

export default async function AwinAdvertisersPage({searchParams}:{searchParams:Promise<{event?:string}>}){
 await connection();
 const {role}=await requireControlCentreAccess();
 const admin=createAdminClient();
 const [{data:sourceRow,error:sourceError},{data:controlsRows, error:controlsError}]=await Promise.all([
  admin.from("sources").select("id,status,sync_enabled,credential_status,health_status,connector_key,source_type,metadata").eq("connector_key","awin").maybeSingle(),
  admin.from("system_controls").select("control_key,enabled").in("control_key",["source_ingestion","deal_publishing","global_emergency_stop"])
 ]);
 const source=sourceRow as Source|null;
 const control=evaluateSourceControls(controlsRows,!!controlsError);
 const meta=(source?.metadata&&typeof source.metadata==="object"&&!Array.isArray(source.metadata))?source.metadata as Record<string,unknown>:{};
 const entries=advertisersFromMetadata(meta);
 const configured=Boolean(process.env.AWIN_ACCESS_TOKEN&&process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_ADVERTISER_ID);
 const targetId=process.env.AWIN_ADVERTISER_ID;
 const sourceIssues=source?sourceEvidenceFailures(source,{advertiserId:targetId,connectorConfigured:configured}):["Awin source missing"];
 const publicationReady=sourceIssues.length===0&&source?.status==="active"&&source.sync_enabled&&control.ingestion&&control.publishing&&
   meta.publication_permission==="verified"&&meta.price_evidence_status==="verified";
 const [{data:offers},{data:recentRuns},{data:audits}]=source?await Promise.all([
   admin.from("offers").select("id,product_id,merchant_id,source_id,price,currency,status,affiliate_url,source_url,stock_status,last_seen_at,match_confidence")
    .eq("source_id",source.id).order("last_seen_at",{ascending:false}).limit(40),
   admin.from("source_sync_runs").select("status,records_seen,records_accepted,started_at,finished_at")
    .eq("source_id",source.id).order("started_at",{ascending:false}).limit(5),
   admin.from("awin_release_audit").select("offer_id,event_type,occurred_at,review_note,advertiser_id").eq("source_id",source.id)
    .order("occurred_at",{ascending:false}).limit(8),
 ]) :[{data:[]},{data:[]},{data:[]}];
 const offerRows=(offers??[]) as Offer[], ids=offerRows.map(o=>o.id);
 const productIds=[...new Set(offerRows.map(o=>o.product_id).filter((x):x is string=>Boolean(x)))];
 const merchantIds=[...new Set(offerRows.map(o=>o.merchant_id))];
 const [{data:products},{data:merchants},{data:scores},{data:deals},{data:reviews}]=ids.length?await Promise.all([
  admin.from("products").select("id,slug,status").in("id",productIds.length?productIds:["00000000-0000-4000-8000-000000000000"]),
  admin.from("merchants").select("id,metadata").in("id",merchantIds),
  admin.from("deal_scores").select("offer_id,score,confidence,calculated_at").in("offer_id",ids),
  admin.from("published_deals").select("offer_id,status,title,merchant,current_price").in("offer_id",ids),
  admin.from("awin_offer_release_reviews").select("offer_id,status,advertiser_id,approved_at,approved_by").in("offer_id",ids),
 ]) :[{data:[]},{data:[]},{data:[]},{data:[]},{data:[]}];
 const productMap=new Map(((products??[]) as Product[]).map(x=>[x.id,x]));
 const merchantMap=new Map(((merchants??[]) as Merchant[]).map(x=>[x.id,x]));
 const scoreMap=new Map(((scores??[]) as Score[]).map(x=>[x.offer_id,x]));
 const dealMap=new Map(((deals??[]) as Deal[]).map(x=>[x.offer_id,x]));
 const reviewsMap=new Map(((reviews??[]) as Review[]).map(x=>[x.offer_id,x]));
 const event=(await searchParams).event??"";
 return <div style={{display:"grid",gap:23}}>
  <header className={styles.pageHead}><div>
   <p className={styles.eyebrow}>Owner-controlled affiliate onboarding</p><h1>Awin advertisers and public offers</h1>
   <p className={styles.sub}>Register a programme, document UK permissions, test the feed, ingest privately, inspect prices and release offers one at a time. A valid API key is never publication approval.</p>
  </div></header>
  {event&&info[event]&&<div className={styles.callout} role="status">{info[event]}</div>}
  {sourceError||!source?<div className={styles.callout} role="alert">Awin source unavailable. No activation is possible.</div>:<>
  <div className={styles.metrics}>
   <div className={styles.metric}><span>API variables</span><strong>{configured?"All set":"Incomplete"}</strong></div>
   <div className={styles.metric}><span>Awin connector</span><strong>{source.status}{source.sync_enabled?" + sync":""}</strong></div>
   <div className={styles.metric}><span>Provider test</span><strong>{source.credential_status}</strong></div>
   <div className={styles.metric}><span>Visible Awin offers</span><strong>{(reviews??[]).filter(x=>x.status==="approved"&&dealMap.get(x.offer_id)?.status==="published").length}</strong></div>
  </div>
  <div className={styles.callout}><strong>Current advertiser environment ID:</strong> {targetId??"not set"}.
   Awin token and publisher ID are kept secret. No key is displayed or saved in this page.
   {sourceIssues.length?<p><strong>Source blockers:</strong> {sourceIssues.join("; ")}</p>:null}
   <p>Source controls: ingestion {control.ingestion?"enabled":"blocked"}, publishing {control.publishing?"enabled":"blocked"}, emergency stop {control.emergencyStop?"ON":"off"}. Owner-recorded rights must be cross-checked against the real Awin programme terms.</p>
  </div>
  <section className={styles.panel}><div className={styles.panelHead}><h2>1. Add an advertiser as a private draft</h2><span>Owner only · never activates</span></div>
    {role==="owner"?<form action={registerAwinAdvertiser} style={formStyle}>
      <label style={field}>Awin numeric Advertiser ID<input style={input} required name="advertiser_id" placeholder="Programme ID, not publisher ID" inputMode="numeric" pattern="[0-9]{2,12}"/></label>
      <label style={field}>Official advertiser name<input style={input} required name="advertiser_name" minLength={3} maxLength={120} placeholder="Approved retailer"/></label>
      <button className={styles.primaryAction}>Save paused draft</button>
    </form>:<p>Only the owner may register advertisers.</p>}
    {entries.length?<table className={styles.table}><thead><tr><th>Advertiser</th><th>ID</th><th>Feed permission recorded</th><th>Expires</th><th>Environment match</th></tr></thead><tbody>
      {entries.map(a=><tr key={a.advertiser_id}><td><b>{a.advertiser_name}</b></td><td>{a.advertiser_id}</td><td>{a.feed_permission_confirmed?"Owner attested":"Not recorded"}</td><td>{a.valid_until||"Not set"}</td><td>{a.advertiser_id===targetId?"Matches":"Not configured for this ID"}</td></tr>)}
    </tbody></table>:<p>No advertisers registered. The four old file-import names are historical private data, not approved programmes.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>2. Record current programme and feed rights</h2><span>Never paste API tokens or credential URLs</span></div>
    <p>Use references to documents you have verified in Awin, including approval for this publisher, feed/price use, GB territory, expiry and optional image use. These records are owner attestations, not automated proof of a contract.</p>
    {role==="owner"&&entries.length?<form action={attestAwinAdvertiserRights} style={formStyle}>
     <label style={field}>Advertiser<select name="advertiser_id" style={input} required>{entries.map(a=><option value={a.advertiser_id} key={a.advertiser_id}>{a.advertiser_name} ({a.advertiser_id})</option>)}</select></label>
     <label style={field}>Publisher/network usage rights reference<input required name="network_rights_evidence" style={input} placeholder="Internal document ID or clean HTTPS reference"/></label>
     <label style={field}>Feed and price-data permission reference<input required name="feed_rights_evidence" style={input}/></label>
     <label style={field}>Advertiser programme acceptance reference<input required name="advertiser_approval_evidence" style={input}/></label>
     <label style={field}>General rights expiry<input type="date" name="rights_valid_until" required style={input}/></label>
     <label style={field}>Advertiser permission expiry<input type="date" name="advertiser_valid_until" required style={input}/></label>
     <label style={field}><span>Image licensing</span><select style={input} name="image_rights"><option value="no">Do not show images</option><option value="yes">Verified display rights for images</option></select></label>
     <label style={{...field,gridColumn:"1 / -1"}}><span><input required type="checkbox" name="confirmed" value="yes"/> I have personally verified current rights for this exact Awin advertiser and AVUQO’s UK website. This does not publish anything.</span></label>
     <button className={styles.primaryAction}>Record reviewed rights · remain paused</button>
    </form>:<p>Register an advertiser first. Recording rights is owner-only.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>3. Test Awin, then run a private feed</h2><span>Explicit actions, no automatic activation</span></div>
   <p>API test downloads at most three authorised feed records into server memory only. It does not insert offers. A match and valid rights references are required.</p>
   {role==="owner"?<div className={styles.actions}>
      <form action={testAwinFeedConnection}><button disabled={!configured||!entries.some(x=>x.advertiser_id===targetId&&x.feed_permission_confirmed)}>Test Awin feed without saving</button></form>
      <form action={setSourceStatus.bind(null,source.id,source.status==="active"?"paused":"active")}><button disabled={source.status!=="active"&&(sourceIssues.length>0||!configured)}>{source.status==="active"?"Pause Awin now":"Activate approved Awin ingestion"}</button></form>
      <form action={runAwinPipeline}><button disabled={source.status!=="active"||sourceIssues.length>0||!control.ingestion}>Import up to 50 offers privately</button></form>
   </div>:null}
   <p><Link href="/control-centre/pipeline">Pipeline logs</Link> · <Link href="/control-centre/feed-imports">Historical private uploads</Link> · <Link href="/control-centre/sources">Source stop controls</Link></p>
   {recentRuns?.length?<table className={styles.table}><thead><tr><th>Run</th><th>Seen</th><th>Accepted</th><th>Started</th></tr></thead><tbody>{recentRuns.map(r=><tr key={r.started_at??r.status}><td>{r.status}</td><td>{r.records_seen??0}</td><td>{r.records_accepted??0}</td><td>{date(r.started_at)}</td></tr>)}</tbody></table>:<p>No live Awin pipeline runs. Existing file uploads remain private staging.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>4. Verify one fresh GBP price sample</h2><span>Required before publication can be enabled</span></div>
   <p>The owner must inspect a recently imported, scored and matched live offer and record their price evidence reference. This enables individual review, not bulk publication.</p>
   {role==="owner"&&offerRows.length?<form action={approveAwinPriceEvidence} style={formStyle}>
     <label style={field}>Candidate offer<select required name="offer_id" style={input}>{offerRows.map(o=><option value={o.id} key={o.id}>{o.id.slice(0,8)} · £{Number(o.price).toFixed(2)} · {o.currency}</option>)}</select></label>
     <label style={field}>Current price evidence reference<input required name="price_evidence_ref" style={input}/></label>
     <label style={{...field,gridColumn:"1 / -1"}}><span><input type="checkbox" required value="yes" name="confirmed"/> I checked the source time, price, stock, seller, destination and AVUQO score for this offer.</span></label>
     <button className={styles.primaryAction}>Approve pricing evidence (not a public release)</button>
    </form>:<p>No live offers to review, or no owner permission.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>5. Inspect, publish or pause one offer</h2><span>Owner approval and immutable event log</span></div>
   {offerRows.length?<div style={{overflowX:"auto"}}><table className={styles.table}><thead><tr><th>Offer / product</th><th>Price and Score</th><th>Public state</th><th>Review</th></tr></thead><tbody>
    {offerRows.map(o=>{
      const p=o.product_id?productMap.get(o.product_id):undefined;
      const s=scoreMap.get(o.id),d=dealMap.get(o.id),release=reviewsMap.get(o.id);
      const m=merchantMap.get(o.merchant_id);
      const merchantExternalId=(m?.metadata&&typeof m.metadata==="object"&&!Array.isArray(m.metadata))?String((m.metadata as Record<string,unknown>).external_id??""):null;
      const issues=p&&s?releaseIssues({source,advertiserId:targetId,envConfigured:configured,controls:control,offer:{...o,merchantExternalId},product:p,score:s}):["Product or Score missing"];
      const eligible=publicationReady&&issues.length===0&&d?.status==="held";
      return <tr key={o.id}><td><b>{d?.title??o.id}</b><br/><small>{d?.merchant??"Merchant not reviewed"} · {o.id.slice(0,8)}</small><br/>{p?.slug?<Link href={`/products/${p.slug}`}>Product page</Link>:null}</td>
       <td>£{Number(o.price).toFixed(2)} {o.currency}<br/>AVUQO Score {s?.score??"?"} · {s?.confidence??"?"}%<br/><small>Updated {date(o.last_seen_at)}</small></td>
       <td><b>{d?.status??"Not staged"}</b><br/><small>{release?.status??"No release"}</small></td>
       <td>{role==="owner"?<div style={{display:"grid",gap:6,minWidth:210}}>
         <form action={setAwinOfferRelease} style={{display:"grid",gap:6}}>
          <input type="hidden" name="offer_id" value={o.id}/><input type="hidden" name="decision" value="approved"/>
          <input name="review_note" aria-label="Publication review note" maxLength={300} style={input} placeholder="Reason and checks (optional)"/>
          <label style={{fontSize:12}}><input type="checkbox" required name="confirmed" value="yes"/> Confirm seller, GBP price, destination, rights and score</label>
          <button disabled={!eligible} className={styles.primaryAction} title={issues.join("; ")}>Approve public release</button>
         </form>
         <form action={setAwinOfferRelease}><input type="hidden" name="offer_id" value={o.id}/><input type="hidden" name="decision" value="paused"/><button>Pause / remove release</button></form>
         {issues.length?<small>{issues.slice(0,3).join("; ")}</small>:null}
       </div>:"Owner only"}</td>
      </tr>;
    })}
   </tbody></table></div>:<p>No live pipeline offers yet. No advertiser has been published.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Release audit</h2><span>Private, append-only record</span></div>
    {audits?.length?<table className={styles.table}><thead><tr><th>Action</th><th>Advertiser</th><th>Offer</th><th>Date</th></tr></thead><tbody>{audits.map((a,i)=><tr key={i}><td>{a.event_type}</td><td>{a.advertiser_id}</td><td>{a.offer_id}</td><td>{date(a.occurred_at)}</td></tr>)}</tbody></table>:<p>No owner releases recorded.</p>}
  </section>
  <div className={styles.callout}><b>Safety:</b> Source-level permissions are not sufficient to release Awin products. The public catalogue also requires an individual owner approval, matching merchant ID, unchanged reviewed price and offer timestamp, active source and current legal rights. Price and publisher evidence are verified by the owner, not automatically by AVUQO.</div>
  </>}
 </div>;
}
