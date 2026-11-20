import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
export const instant=false;
export const metadata:Metadata={title:"Private tyre cross-retailer evidence | AVUQO Control Centre",robots:{index:false,follow:false}};
type Sample={ean:string;tyres_uk_title:string;pneus_title:string;tyres_uk_explicit_gbp:boolean;pneus_explicit_gbp:boolean;both_fitment_proven:boolean};
type Overlap={matching_valid_ean13:number;currency_qualified_pairs:number;specification_verified_pairs:number;
 both_currency_and_spec_verified_pairs:number;tyres_uk_staged_rows:number;pneus_staged_rows:number;
 samples:Sample[];provenance:string;public_price_release_authorised:boolean;requirements:string};
const record=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};
const num=(x:unknown)=>typeof x==="number"&&Number.isFinite(x)&&x>=0?x:0;
const label=(x:unknown)=>typeof x==="string"?x:"";
export default async function PrivateTyreOverlap(){
 await connection();
 const {role}=await requireControlCentreAccess();
 const db=createAdminClient();
 const [{data,error},{data:jobs,error:jobsError}]=await Promise.all([
  db.rpc("owner_private_tyre_ean_overlap_summary"),
  db.from("awin_bulk_import_jobs").select("advertiser_id,feed_id,state,validated_total,committed_rows,updated_at")
   .eq("advertiser_id","15236").order("updated_at",{ascending:false}).limit(2)
 ]);
 const raw=!error?record(data):{};
 const summary:Overlap|null=raw.provenance==="private_exact_ean13_identifier_candidate_only"&&
  raw.public_price_release_authorised===false?{
   matching_valid_ean13:num(raw.matching_valid_ean13),
   currency_qualified_pairs:num(raw.currency_qualified_pairs),
   specification_verified_pairs:num(raw.specification_verified_pairs),
   both_currency_and_spec_verified_pairs:num(raw.both_currency_and_spec_verified_pairs),
   tyres_uk_staged_rows:num(raw.tyres_uk_staged_rows),
   pneus_staged_rows:num(raw.pneus_staged_rows),
   samples:Array.isArray(raw.samples)?raw.samples.filter((x):x is Sample=>{
    const s=record(x);return typeof s.ean==="string"&&/^\d{13}$/.test(s.ean);
   }).slice(0,8):[],
   provenance:label(raw.provenance),public_price_release_authorised:false,requirements:label(raw.requirements)
  }:null;
 const cards=[
  {name:"Exact check-digit-valid EAN overlaps",count:summary?.matching_valid_ean13,detail:"Both private tyre feeds list the same 13-digit barcode. Candidate identity, not final vehicle fitment."},
  {name:"Both prices with independently explicit GBP",count:summary?.currency_qualified_pairs,detail:"No currency guess: both sources must explicitly establish GBP before price comparison."},
  {name:"Both technical specifications checked",count:summary?.specification_verified_pairs,detail:"Exact width, profile, rim, load, speed and variant verification remains separate."},
  {name:"Meets both critical evidence checks",count:summary?.both_currency_and_spec_verified_pairs,detail:"Still requires stock, delivery/fitting, licensed links, source rights and offer release."}
 ];
 return <div style={{maxWidth:1140,margin:"0 auto",padding:"24px 20px 70px",display:"grid",gap:23}}>
  <nav style={{display:"flex",gap:17,flexWrap:"wrap",fontSize:13}}>
   <Link href="/control-centre/tyres">← Tyre operations</Link>
   <Link href="/control-centre/awin-feed-updates">Awin feed monitor</Link>
   <Link href="/control-centre/product-readiness">Product matching controls</Link>
  </nav>
  <header><p style={{color:"#7443a2",fontSize:12,fontWeight:900,letterSpacing:1.5}}>PRIVATE CONTROL CENTRE · {role.toUpperCase()}</p>
   <h1 style={{fontSize:"clamp(29px,4vw,44px)",letterSpacing:"-.04em",margin:"7px 0"}}>Real overlap. No invented tyre comparisons.</h1>
   <p style={{maxWidth:860,color:"#6a6274",lineHeight:1.7}}>This read-only report joins the latest private records from Tyres UK (Awin 12715) and Pneus Online (15236) by a check-digit-valid 13-digit EAN. The result is a **candidate match**, not a public product merge, valid GBP price, vehicle fitment guarantee or price ranking.</p>
  </header>
  {!summary?<p role="alert" style={{padding:20,border:"1px solid #db9b93",borderRadius:12,background:"#fff9f5"}}>
   Private overlap evidence unavailable. The owner-only migration or read privileges may not be ready. No matching or price claim is authorised until this report succeeds.
  </p>:<>
   <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(205px,1fr))",gap:12}} aria-label="Private cross-retailer evidence">
    {cards.map(c=><article key={c.name} style={{background:"white",padding:19,borderRadius:15,border:"1px solid #e6dce9",display:"grid",gap:8}}>
     <strong style={{fontSize:"clamp(27px,4vw,38px)",color:"#563482",fontVariantNumeric:"tabular-nums"}}>{c.count?.toLocaleString("en-GB")??"Unavailable"}</strong>
     <b style={{fontSize:14}}>{c.name}</b><p style={{fontSize:12,lineHeight:1.65,color:"#706579",margin:0}}>{c.detail}</p>
    </article>)}
   </section>
   <section style={{background:"#fff9ee",border:"1px solid #ead8bc",padding:19,borderRadius:14,lineHeight:1.7}}>
    <strong>Release gate remains closed.</strong> Even 11,000 overlapping EANs do not prove currency, quantity, season, run-flat, width/profile/rim, load/speed, availability or complete fitted totals. This private report has no INSERT/UPDATE and cannot activate public tyre listing or offer approval.
    <p style={{margin:"6px 0 0",fontSize:12}}>{summary.requirements}</p>
   </section>
   <section aria-label="Representative private matched identifiers" style={{display:"grid",gap:10}}>
    <h2 style={{fontSize:23,margin:0}}>Sample identifier matches for review</h2>
    <p style={{fontSize:12,color:"#746b7b",margin:0}}>Titles and EANs are visible only here for an authenticated AVUQO administrator. No supplier prices or affiliate links are exposed in this report.</p>
    <div style={{overflowX:"auto",background:"white",borderRadius:15,border:"1px solid #e9deea"}}>
     <table style={{width:"100%",borderCollapse:"collapse",minWidth:750,fontSize:12}}>
      <thead><tr>{["EAN-13","Tyres UK private title","Pneus Online private title","Both GBP confirmed?","Both fitments verified?"].map(h=><th key={h} style={{textAlign:"left",padding:12,background:"#f6f0f8"}}>{h}</th>)}</tr></thead>
      <tbody>{summary.samples.map(s=><tr key={s.ean}>
       <td style={{borderTop:"1px solid #eee5ed",padding:11,fontVariantNumeric:"tabular-nums",fontWeight:800}}>{s.ean}</td>
       <td style={{borderTop:"1px solid #eee5ed",padding:11}}>{s.tyres_uk_title}</td>
       <td style={{borderTop:"1px solid #eee5ed",padding:11}}>{s.pneus_title}</td>
       <td style={{borderTop:"1px solid #eee5ed",padding:11}}>{s.tyres_uk_explicit_gbp&&s.pneus_explicit_gbp?"Yes":"No"}</td>
       <td style={{borderTop:"1px solid #eee5ed",padding:11}}>{s.both_fitment_proven?"Yes":"No"}</td>
      </tr>)}</tbody>
     </table>
    </div>
   </section>
   <p style={{color:"#776d7c",fontSize:12}}>Current stored snapshot: {summary.tyres_uk_staged_rows.toLocaleString("en-GB")} Tyres UK private rows and {summary.pneus_staged_rows.toLocaleString("en-GB")} Pneus private rows, including repeated import sessions. EAN overlap counts DISTINCT identifiers, not rows or public stock.</p>
  </>}
  <section aria-label="Automatic Pneus snapshot job" style={{border:"1px solid #e5dbe9",background:"#fff",borderRadius:15,padding:20}}>
   <h2 style={{margin:"0 0 10px",fontSize:23}}>Resumable private import checkpoints</h2>
   {jobsError?<p>Job checkpoints unavailable; status unknown.</p>:
   jobs?.length?jobs.map(j=><p key={j.feed_id+j.updated_at} style={{fontSize:13,lineHeight:1.55}}>
    Advertiser {j.advertiser_id}, feed {j.feed_id}: <strong>{j.state}</strong>, {Number(j.committed_rows).toLocaleString("en-GB")} of {Number(j.validated_total).toLocaleString("en-GB")} rows committed privately, last recorded {new Date(j.updated_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}.
   </p>):<p>No import job checkpoint recorded.</p>}
  </section>
  <section style={{border:"1px solid #e5dbe9",background:"#fff",borderRadius:15,padding:20}}>
   <h2 style={{margin:"0 0 12px",fontSize:23}}>Next approval stages</h2>
   <ol style={{lineHeight:2,fontSize:13,color:"#594d65"}}>
    <li>Confirm Pneus source currency from retailer documentation or authenticated source, never infer GBP from UK membership or a displayed number.</li>
    <li>Enrich exact tyre variant, complete 3-part dimensions, load index, speed, season, run-flat and manufacturer identifiers from evidence.</li>
    <li>Recheck individual stock and publisher rights for both retailers, including permitted images and exact outbound links.</li>
    <li>Gather delivery, installation, balancing, disposal, taxes and unavoidable charges before ranking delivered or fitted prices.</li>
    <li>Use existing owner first-release approvals and emergency controls before any public two-retailer comparison.</li>
   </ol>
  </section>
 </div>;
}
