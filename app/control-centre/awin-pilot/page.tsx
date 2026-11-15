import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import PetlibroPilotControls from "./PetlibroPilotControls";
import {auditPetlibroStagedIdentities,type PetlibroStagedRow} from "../../../lib/awin/petlibro-identity-audit";

export const instant=false;
export const metadata:Metadata={title:"Private Petlibro auto-import pilot | AVUQO",robots:{index:false,follow:false}};
const date=(value:string|null|undefined)=>value?new Date(value).toLocaleString("en-GB",{timeZone:"Europe/London"}):"Never";
const asRecord=(value:unknown):Record<string,unknown>=>
 value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};

export default async function PetlibroPilot(){
 await connection();
 // Protect private feed identity and staging data before any service-role query.
 const {role}=await requireControlCentreAccess();
 const db=createAdminClient();
 const [sourceResult,runResult,feedResult,reviewResult]=await Promise.all([
  db.from("sources").select("id,status,sync_enabled,credential_status,metadata")
   .eq("connector_key","awin").maybeSingle(),
  db.from("feed_import_runs")
   .select("id,created_at,total_count,review_count,excluded_count,status,permission_status")
   .eq("merchant_id","77952").like("filename","GENAWIN__103580__AUTO__%")
   .order("created_at",{ascending:false}).limit(1).maybeSingle(),
  db.from("awin_feed_update_observations")
   .select("feed_name,listed_products,observed_at,needs_private_refresh")
   .eq("advertiser_id","77952").eq("feed_id","103580").maybeSingle(),
  db.from("awin_offer_release_reviews").select("*",{count:"exact",head:true})
   .eq("advertiser_id","77952").eq("status","approved")
 ]);
 const source=sourceResult.data;
 const run=runResult.data;
 const feed=feedResult.data;
 // Owner/admin access was checked before this service-role read.
 const {data:stagedRows,error:stagedError}=run
  ?await db.from("feed_import_records")
    .select("merchant_product_id,title,brand,price,currency,status,review_decision,metadata,image_url")
    .eq("import_id",run.id).order("merchant_product_id",{ascending:true}).limit(501)
  :{data:[] as PetlibroStagedRow[],error:null};
 const rows=(stagedRows??[]) as PetlibroStagedRow[];
 const audit=auditPetlibroStagedIdentities(rows.slice(0,500),
   rows.length>500||Boolean(run&&run.total_count>rows.length));
 const meta=asRecord(source?.metadata);
 const entries=Array.isArray(meta.awin_advertisers)?meta.awin_advertisers.map(asRecord):[];
 const petlibro=entries.find(x=>x.advertiser_id==="77952");
 // Existing private import membership is not a per-advertiser publication licence.
 const rightsRegistered=petlibro?.feed_permission_confirmed===true;
 const paused=source?.status==="paused"&&source.sync_enabled===false;
 const dataError=Boolean(sourceResult.error||runResult.error||feedResult.error||reviewResult.error||stagedError);
 return <main style={{maxWidth:1050,margin:"0 auto",padding:"28px 20px 80px",display:"grid",gap:22}}>
  <nav><Link href="/control-centre/feed-imports">← Private imports</Link></nav>
  <header style={{display:"grid",gap:8}}>
   <p style={{margin:0,color:"#6850aa",fontSize:12,fontWeight:800,letterSpacing:1.2}}>OWNER-ONLY · REAL SUPPLIER DATA · PUBLICATION DISABLED</p>
   <h1 style={{margin:0,fontSize:34}}>Petlibro UK import pilot</h1>
   <p style={{lineHeight:1.65,margin:0,color:"#655d72"}}>Run the existing bounded Awin worker on a single permitted feed. This control checks real data and can stage it for private review. It does not turn staged rows into canonical offers or publicly visible prices.</p>
  </header>
  {dataError&&<p role="alert" style={{color:"#a12e2e",fontWeight:750}}>One or more private status queries failed. Do not interpret missing counts as zero or start staging until access is restored.</p>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(215px,1fr))",gap:12}}>
   {[
    ["Awin source",sourceResult.error?"Unavailable":paused?"Paused: private pilot permitted":"Not paused: staging blocked"],
    ["Feed inventory",feedResult.error?"Unavailable":feed?String(feed.listed_products)+" listed products":"Not observed"],
    ["Last private snapshot",runResult.error?"Unavailable":run?date(run.created_at):"No import"],
    ["Petlibro rights flag",sourceResult.error?"Unavailable":rightsRegistered?"Recorded as confirmed":"Not recorded in source registry"],
    ["Approved Petlibro offers",reviewResult.error?"Unavailable":String(reviewResult.count??0)]
   ].map(([label,value])=><div key={label} style={{background:"#fff",border:"1px solid #e7e2ed",borderRadius:13,padding:17,display:"grid",gap:7}}>
    <span style={{fontSize:12,color:"#6c6476"}}>{label}</span><strong style={{fontSize:17}}>{value}</strong>
   </div>)}
  </div>
  <section style={{background:"#faf7ff",border:"1px solid #e3dbf1",borderRadius:13,padding:16,display:"grid",gap:8}}>
   <strong>Last staged run</strong>
   <p style={{margin:0}}> {run?run.total_count+" records; "+run.review_count+" private-review; "+run.excluded_count+" excluded. State: "+run.status+"; permission: "+run.permission_status+".":"No matching automatic Petlibro staging run."}</p>
   <p style={{margin:0,fontSize:13,color:"#675b77"}}>Inventory last observed: {date(feed?.observed_at)}. A feed-list update is not a verified current price or stock check.</p>
  </section>
  <section style={{background:"#fff",border:"1px solid #e3ddec",borderRadius:16,padding:20,display:"grid",gap:12}}>
   <h2 style={{fontSize:23,margin:0}}>Private product identity audit</h2>
   <p style={{margin:0,lineHeight:1.6}}>The imported supplier IDs can have separate <code>_feed</code> and <code>_health</code> variants for a single logical Petlibro product. This is a private identity comparison, <strong>not</strong> approved deduplication for public offers.</p>
   {stagedError?<p role="alert">Could not inspect the private import rows. No product identity totals can be confirmed.</p>:
    run?<><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
     {[
      ["Staged rows",String(audit.sourceRows)],
      ["Identity groups",audit.incomplete?"Partial scan":String(audit.distinctIdentityGroups)],
      ["Matching feed/health pairs",audit.incomplete?"Unverified":String(audit.matchingPairs)],
      ["Pairs needing attention",audit.incomplete?"Unverified":String(audit.groupsNeedingAttention)]
     ].map(([label,value])=><div key={label} style={{background:"#faf8fd",borderRadius:11,padding:13,minWidth:140,flex:"1 1 140px"}}>
      <small style={{color:"#6b6175"}}>{label}</small><div style={{fontSize:23,fontWeight:800}}>{value}</div></div>)}
    </div>
    {audit.incomplete&&<p role="alert">The scan reached its private safety cap or does not match the import run count. Do not use partial counts to approve product identity.</p>}
    <p style={{margin:0,fontSize:13,color:"#6b6175"}}>{audit.priceTimestampEvidenceRows} rows carry a source-update timestamp; {audit.imageRightsConfirmedRows} rows have image rights recorded in row metadata. A separate owner-supplied merchant permission email does not change these source-row flags. Prices and stock still require fresh checks.</p>
    <div style={{overflowX:"auto"}}>
     <table style={{width:"100%",borderCollapse:"collapse",minWidth:600,fontSize:13}}>
      <thead><tr>{["Supplier identity","Private title","Recorded price","Row pairing","Review"].map(h=><th key={h} style={{padding:11,textAlign:"left",borderBottom:"1px solid #e9e4f0"}}>{h}</th>)}</tr></thead>
      <tbody>{audit.candidates.slice(0,5).map(c=><tr key={c.sku}>
       <td style={{padding:11,wordBreak:"break-word",borderBottom:"1px solid #eee"}}>{c.sku}</td>
       <td style={{padding:11,borderBottom:"1px solid #eee"}}>{c.title}</td>
       <td style={{padding:11,whiteSpace:"nowrap",borderBottom:"1px solid #eee"}}>{c.price?c.price+" "+c.currency:"Unverified"}</td>
       <td style={{padding:11,borderBottom:"1px solid #eee"}}>{c.issues.length?c.issues.join(", "):"Paired: "+c.rows+" rows"}</td>
       <td style={{padding:11,borderBottom:"1px solid #eee"}}>{c.needsReview?"Needs owner review":"Checked privately"}</td>
      </tr>)}</tbody>
     </table>
    </div>
    <p style={{margin:0,fontSize:12,color:"#6f6577"}}>Showing up to five identity groups for private inspection. All prices shown are historical staging values, not live offers. There is no automatic merge, category activation, price-history write or publication.</p></>:
    <p>No Petlibro private import exists yet. Run preflight before staging a feed.</p>}
  </section>
  {role==="owner"&&!dataError?<PetlibroPilotControls/>:
   <p style={{padding:16,background:"#fff5ed",borderRadius:12}}>Only the owner may initiate a feed preflight or private staging. Administrators can view these diagnostics.</p>}
  <section style={{display:"grid",gap:8}}>
   <h2 style={{fontSize:21,margin:0}}>Next release boundary</h2>
   <p style={{margin:0,lineHeight:1.65}}>After private validation, the existing public Awin connector and per-offer release process still need verified rights, a canonical product match, current stock/price evidence, score and owner approval. These controls never bypass those gates.</p>
   <p><Link href="/control-centre/awin-advertisers">Check advertiser rights and offer releases</Link> · <Link href="/control-centre/product-readiness">Canonical product readiness</Link> · <Link href="/control-centre/live-data">Private live-data monitor</Link></p>
  </section>
 </main>;
}
