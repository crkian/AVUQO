import {createAdminClient} from "../../../lib/supabase/admin";
import OwnerAwinReleaseButton from "./OwnerAwinReleaseButton";

const meta=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const recent=(v:string|null)=>Boolean(v&&Number.isFinite(Date.parse(v))&&
 Date.now()-Date.parse(v)<=48*3600_000&&Date.parse(v)<Date.now()+300000);
export default async function OwnerAwinReleaseQueue(){
 const db=createAdminClient();
 const {data:source,error:sourceError}=await db.from("sources")
  .select("id,status,sync_enabled,credential_status,metadata").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)return <p role="alert">Awin release source unavailable.</p>;
 const {data:offers,error}=await db.from("offers")
  .select("id,title,merchant_id,price,currency,last_seen_at,stock_status,affiliate_url,status,match_confidence")
  .eq("source_id",source.id).order("last_seen_at",{ascending:false}).limit(35);
 if(error)return <p role="alert">Awin release candidate records unavailable.</p>;
 const ids=(offers??[]).map(o=>o.id),merchantIds=[...new Set((offers??[]).map(o=>o.merchant_id))];
 const [{data:deals},{data:scores},{data:merchants},{data:programmes}]=await Promise.all([
  ids.length?db.from("published_deals").select("offer_id,status,current_price").in("offer_id",ids):Promise.resolve({data:[]}),
  ids.length?db.from("deal_scores").select("offer_id,score,confidence,calculated_at").in("offer_id",ids):Promise.resolve({data:[]}),
  merchantIds.length?db.from("merchants").select("id,name,metadata").in("id",merchantIds):Promise.resolve({data:[]}),
  db.from("affiliate_programs").select("external_account_id,metadata").eq("provider","awin").eq("region","GB")
 ]);
 const d=new Map((deals??[]).map(x=>[x.offer_id,x]));
 const s=new Map((scores??[]).map(x=>[x.offer_id,x]));
 const m=new Map((merchants??[]).map(x=>[x.id,x]));
 const accepted=new Set((programmes??[]).filter(p=>
  meta(meta(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted"
 ).map(p=>p.external_account_id));
 const programmeById=new Map((programmes??[]).map(p=>[p.external_account_id,meta(p.metadata)]));
 const candidate=(offers??[]).filter(o=>d.get(o.id)?.status==="held"||d.get(o.id)?.status==="published");
 const runtimeKeysInstalled=Boolean(process.env.AWIN_ACCESS_TOKEN&&process.env.AWIN_DATAFEED_API_KEY&&process.env.AWIN_PUBLISHER_ID);
 const enabled=source.status==="active"&&source.sync_enabled===true&&source.credential_status==="ready"&&
  meta(source.metadata).publication_permission==="verified"&&meta(source.metadata).price_evidence_status==="verified";
 return <section aria-label="Owner Awin first-product release" style={{display:"grid",gap:10}}>
  <h2>First genuine priced product release</h2>
  <p style={{lineHeight:1.6,color:"#60586c"}}>
   This is the existing owner-only Awin release gate, now available directly in the Control Centre.
   Awin membership acceptance is recorded for 21 programmes. A first offer can be released only
   after fresh GBP price, stock, tracking, canonical matching, scoring and live source checks pass.
   Every approval is independently rechecked by the server and atomic release function.
  </p>
  <p role="status" style={{fontWeight:650}}>Source: {source.status} · Synchronisation: {source.sync_enabled?"on":"off"} · Credentials: {source.credential_status}
   {" · "}Server keys: {runtimeKeysInstalled?"installed, not independently validated":"incomplete"}
   {" · "}Held or released offers in latest query: {candidate.length}</p>
  <p style={{fontSize:13,color:"#5c5366"}}>Owner has attested that accepted programmes grant listing and supplier-image permission. This owner statement is separate from stored advertiser-specific terms, rights expiry and current price evidence. The following checks still govern public release.</p>
  {candidate.length===0?<p>No genuine canonical Awin offers are ready for owner release. Run current private imports, then pass the source-to-offer pipeline. Historical private feed rows are not public offers.</p>:
   <div style={{overflowX:"auto",background:"white",border:"1px solid #e8e3ed",borderRadius:14}}>
    <table style={{borderCollapse:"collapse",width:"100%",minWidth:880,fontSize:12}}>
     <thead><tr>{["Merchant","Product","Current GBP","Stock","Checked","Score","Release status","Remaining release checks","Owner action"].map(x=>
      <th key={x} style={{background:"#f8f5fa",padding:10,textAlign:"left"}}>{x}</th>)}</tr></thead>
     <tbody>{candidate.map(o=>{
      const merchant=m.get(o.merchant_id),id=meta(merchant?.metadata).external_id;
      const score=s.get(o.id),deal=d.get(o.id);
      const membership=typeof id==="string"&&accepted.has(id);
      const latest=recent(o.last_seen_at)&&recent(score?.calculated_at??null);
      const scoreOk=!!score&&score.score>=60&&Number(score.confidence)>=55;
      const priceOk=o.currency==="GBP"&&Number(o.price)>0&&
       Number(deal?.current_price)===Number(o.price);
      const merchantRights=typeof id==="string"?programmeById.get(id):undefined;
      const documented=merchantRights?.publication_approved===true;
      const blockers=[
       ...(!membership?["accepted advertiser identity"]:[]),
       ...(!documented?["merchant licence scope not recorded as verified"]:[]),
       ...(!enabled?["source activation and evidence"]:[]),
       ...(!latest?["fresh price and score"]:[]),
       ...(!scoreOk?["score/confidence threshold"]:[]),
       ...(!priceOk?["verified GBP price"]:[]),
       ...(!["in_stock","low_stock"].includes(o.stock_status)?["stock validation"]:[])
      ];
      const canAttempt=enabled&&membership&&documented&&latest&&scoreOk&&priceOk&&
       ["in_stock","low_stock"].includes(o.stock_status)&&
       deal?.status==="held";
      return <tr key={o.id}>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{merchant?.name??"Unknown merchant"}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{o.title}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{o.currency==="GBP"?"£"+Number(o.price).toFixed(2):"Non-GBP"}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{o.stock_status}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{o.last_seen_at?new Date(o.last_seen_at).toLocaleString("en-GB",{timeZone:"Europe/London"}):"Missing"}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{score?.score??"Not scored"}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>{deal?.status} {!canAttempt&&deal?.status==="held"?"(not release-ready)":""}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1",maxWidth:290}}>{blockers.length?blockers.join(" · "):"Ready for atomic server recheck"}</td>
       <td style={{padding:10,borderTop:"1px solid #efeaf1"}}>
        {deal?.status==="published"?<OwnerAwinReleaseButton offerId={o.id} action="pause"/>:
         <OwnerAwinReleaseButton offerId={o.id} action="approve" disabled={!canAttempt}/>}
       </td>
      </tr>;
     })}</tbody>
    </table>
   </div>}
 </section>;
}
