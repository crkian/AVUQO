import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {supplierKind,supplierNextAction,supplierSummary,type SupplierReadiness} from "../../../lib/awin/supplier-readiness";

export const metadata:Metadata={title:"Supplier & Product Readiness | AVUQO Control Centre",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
type Report={as_of:string;explanation:string;programmes:SupplierReadiness[]};
const n=(value:number|undefined)=>Number(value??0).toLocaleString("en-GB");
const date=(value:string|null)=>value&&!Number.isNaN(Date.parse(value))?
 new Date(value).toLocaleString("en-GB",{timeZone:"Europe/London",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"Not recorded";
const cell={padding:"12px 11px",borderTop:"1px solid #ebe4ef",verticalAlign:"top" as const};
const label={fontSize:12,color:"#776a7e",margin:0};
const box={border:"1px solid #e5d8e9",background:"#fff",borderRadius:16,padding:18};
export default async function SupplierReadinessPage(){
 await connection();
 const {role}=await requireControlCentreAccess();
 let report:Report|null=null;
 let errorMessage="";
 try{
  const db=createAdminClient();
  const {data,error}=await db.rpc("owner_avuqo_supplier_readiness_v1");
  if(error)errorMessage="Private supplier-readiness report unavailable. Apply the reviewed migration and confirm service-role access.";
  else if(data&&typeof data==="object"&&!Array.isArray(data)&&Array.isArray(data.programmes))
   report=data as Report;
  else errorMessage="Unexpected private report shape. No supplier totals have been assumed.";
 }catch{
  errorMessage="Private supplier-readiness report unavailable. Check server credentials and migration status.";
 }
 const rows=report?.programmes??[];
 const summary=report?supplierSummary(rows):null;
 return <main style={{maxWidth:1390,margin:"0 auto",padding:"30px 20px 90px",display:"grid",gap:22}}>
  <nav style={{display:"flex",gap:15,flexWrap:"wrap",fontSize:13}}>
   <Link href="/control-centre">← Control Centre</Link>
   <Link href="/control-centre/awin-feed-updates">Awin feed monitor</Link>
   <Link href="/control-centre/feed-imports">Private import reviews</Link>
   <Link href="/control-centre/source-readiness">Source permissions</Link>
   <Link href="/control-centre/tyre-cross-retailer">Private tyre evidence</Link>
  </nav>
  <header style={{display:"grid",gap:9}}>
   <p style={{color:"#70439d",fontSize:12,fontWeight:850,letterSpacing:1.5,margin:0}}>PRIVATE OWNER OPERATIONS · {role.toUpperCase()}</p>
   <h1 style={{fontSize:"clamp(30px,5vw,46px)",lineHeight:1.1,letterSpacing:"-.045em",margin:0}}>Supplier & Product Readiness</h1>
   <p style={{maxWidth:930,lineHeight:1.7,color:"#64596e",margin:0}}>Every accepted advertiser in one source-backed view. A programme membership, feed header, private product, approved publication and customer-visible current offer are five different things. Counts do not grant image or description rights and never trigger product release.</p>
  </header>
  {!report?<section role="alert" style={{...box,background:"#fff7f4",borderColor:"#e6b6a9"}}>
   <strong>Counts unavailable</strong><p>{errorMessage}</p>
   <p>No zero values are shown as if the feed inventory had been checked.</p>
  </section>:<>
   <section aria-label="Accepted supplier evidence summary" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
    {[
     ["Accepted programmes",summary?.accepted??0,"Membership evidence only"],
     ["Observed source feeds",summary?.withFeeds??0,"Retail and service feeds"],
     ["Private imports",summary?.imported??0,"Staged advertiser cohorts"],
     ["Published candidates",summary?.publishing??0,"Not live eligibility totals"],
     ["Canonical descriptions",summary?.described??0,"Suppliers with any"],
     ["Description feed schemas",summary?.feedsWithDescriptionColumns??0,"Headers observed, not nonempty rows"]
    ].map(([name,value,detail])=><article key={String(name)} style={box}>
     <p style={label}>{name}</p><strong style={{display:"block",fontSize:34,fontVariantNumeric:"tabular-nums",color:"#503778",margin:"5px 0"}}>{n(Number(value))}</strong>
     <small style={{color:"#756a7b"}}>{detail}</small>
    </article>)}
   </section>
   <section style={{...box,display:"grid",gap:11}}>
    <h2 style={{margin:0,fontSize:22}}>Where the catalogue is blocked</h2>
    <p style={{margin:0,color:"#65596e",lineHeight:1.65}}>Private snapshots can contain repeat imports. The feed's advertised item count is not the number of distinct or licensable AVUQO products. Description coverage is measured on actual canonical product records, not invented copy or placeholder cards.</p>
    <p style={{margin:0,fontSize:12,color:"#756a7b"}}>Read-only server report at {date(report.as_of)} (UK) · {report.explanation}</p>
    <div style={{overflowX:"auto"}}>
     <table style={{borderCollapse:"collapse",width:"100%",minWidth:1210,fontSize:12}}>
      <thead><tr>{["Accepted supplier","Integration","Feeds / refresh flags","Feed description headers","Private distinct SKUs","Private description rows","Active described / total products","Published / held candidate offers","Text rights","Next task"].map(h=>
       <th key={h} scope="col" style={{textAlign:"left",padding:"12px 11px",background:"#f6f1f8",color:"#493454",position:"sticky",top:0}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(row=><tr key={row.advertiser_id??row.programme}>
       <th scope="row" style={{...cell,textAlign:"left",minWidth:160}}><strong>{row.programme}</strong><div style={label}>Awin {row.advertiser_id??"ID unmapped"}</div></th>
       <td style={cell}>{supplierKind(row)}</td>
       <td style={cell}><strong>{n(row.observed_feeds)}</strong> <span style={{color:"#806e8a"}}> / {n(row.refresh_flags)} flagged</span><div style={label}>{date(row.last_observation)}</div></td>
       <td style={cell}>{n(row.feeds_with_description_column)}<div style={label}>Field observed, contents not yet proven</div></td>
       <td style={cell}><strong>{n(row.private_product_ids)}</strong><div style={label}>{n(row.private_rows)} import rows</div></td>
       <td style={cell}>{n(row.private_descriptions)}<div style={label}>Unapproved text stays private</div></td>
       <td style={cell}><strong>{n(row.active_described_products)} / {n(row.active_products)}</strong></td>
       <td style={cell}><strong>{n(row.published_candidates)} / {n(row.held_candidates)}</strong><div style={label}>Public recheck still required</div></td>
       <td style={cell}>{row.product_description_rights_verified?"Verified flag recorded":"Not separately verified"}<div style={label}>{n(row.description_rights_marked)} private rows marked</div></td>
       <td style={{...cell,minWidth:270,lineHeight:1.5}}>{supplierNextAction(row)}</td>
      </tr>)}</tbody>
     </table>
    </div>
   </section>
  </>}
  <section style={{...box,display:"grid",gap:12}}>
   <h2 style={{fontSize:21,margin:0}}>How to improve coverage without breaking trust</h2>
   <ol style={{margin:0,paddingLeft:24,lineHeight:1.9,fontSize:13,color:"#61556b"}}>
    <li>Repair exact source description projection and preserve clean prose in private import records, not directly on public cards.</li>
    <li>Confirm each retailer's approved text reuse, image terms, exact advertiser ID, feed freshness, stock, GBP and tracking. A programme acceptance is insufficient.</li>
    <li>Recheck current authenticated feed digests and bring eligible source descriptions into held canonical offers only under the independent description-rights flag.</li>
    <li>Approve genuinely qualified products through the existing atomic first-release mechanism. Do not bulk approve held stock or alter AVUQO Score ranking.</li>
    <li>Build specialist quote/tariff/booking adapters for service advertisers; their lack of a standard product CSV is not itself a failure.</li>
   </ol>
   <nav style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:13}}>
    <Link href="/control-centre/awin-feed-updates">Inspect feed update & review controls →</Link>
    <Link href="/control-centre/product-readiness">Review product matching →</Link>
    <Link href="/control-centre/tyres">Tyres & fitting evidence →</Link>
   </nav>
  </section>
 </main>;
}
