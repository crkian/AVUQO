import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {pneusPrivateSourceGate,PNEUS_ADVERTISER_ID,PNEUS_FEED_ID}
 from "../../../lib/awin/pneus-online-private";

export const instant=false;
export const metadata:Metadata={title:"Second tyre supplier | Private onboarding | AVUQO",
 robots:{index:false,follow:false}};
const panel:React.CSSProperties={background:"#fff",border:"1px solid #e9dfea",
 borderRadius:18,padding:"clamp(17px,3vw,27px)",display:"grid",gap:12};
const sub:React.CSSProperties={margin:0,color:"#675d70",lineHeight:1.7,fontSize:14};
const field:React.CSSProperties={fontSize:11,fontWeight:850,letterSpacing:1,
 textTransform:"uppercase",color:"#805b8c"};
const pill:React.CSSProperties={padding:"7px 11px",borderRadius:999,
 background:"#f0e7ef",color:"#513660",fontSize:12,fontWeight:850,width:"fit-content"};

export default async function PneusOnboardingPage(){
 await connection();await requireControlCentreAccess();
 const db=createAdminClient();
 const [source,feed,jobs,imports]=await Promise.all([
  db.from("sources").select("metadata,status,sync_enabled")
   .eq("connector_key","awin").maybeSingle(),
  db.from("awin_feed_update_observations")
   .select("feed_name,listed_products,observed_at,last_imported_source")
   .eq("advertiser_id",PNEUS_ADVERTISER_ID).eq("feed_id",PNEUS_FEED_ID)
   .order("observed_at",{ascending:false}).limit(1),
  db.from("awin_bulk_import_jobs")
   .select("state,validated_total,committed_rows,updated_at,last_failure_code")
   .eq("advertiser_id",PNEUS_ADVERTISER_ID).eq("feed_id",PNEUS_FEED_ID)
   .order("created_at",{ascending:false}).limit(1),
  db.from("feed_import_runs").select("status,total_count,review_count,excluded_count,created_at")
   .eq("merchant_id",PNEUS_ADVERTISER_ID).order("created_at",{ascending:false}).limit(1)
 ]);
 const gate=source.error?"source_unavailable":pneusPrivateSourceGate(source.data);
 const enabled=process.env.AWIN_PNEUS_PRIVATE_IMPORT_ENABLED==="true";
 const last=jobs.data?.[0],observed=feed.data?.[0],run=imports.data?.[0];
 const text={
  source_not_paused:"Awin must be joined and paused before staging.",
  programme_not_joined:"The programme's joined status is not confirmed.",
  feed_permission_unconfirmed:"Feed-use permission has not been confirmed in the source register.",
  approval_evidence_missing:"Explicit feed-use approval evidence has not been recorded.",
  approval_expired:"The recorded feed permission has expired or is invalid.",
  source_unavailable:"Source registry could not be read. No automatic import is allowed.",
  ready:"Source and private-stage permission gates are satisfied."
 }[gate]??"Source state unavailable";
 return <main style={{maxWidth:1150,margin:"0 auto",padding:"24px clamp(16px,4vw,34px) 90px",display:"grid",gap:22,
  background:"#faf7f9",color:"#2d2237",minHeight:"100vh"}}>
  <nav style={{display:"flex",flexWrap:"wrap",gap:16,fontSize:13}}>
   <Link href="/control-centre/awin-programmes">← Awin programmes</Link>
   <Link href="/preview/tyres">Private tyre showroom</Link>
   <Link href="/control-centre/tyre-spec-enrichment">Tyres UK specification review</Link>
  </nav>
  <header style={{background:"linear-gradient(120deg,#20152e,#523266)",borderRadius:25,
   padding:"clamp(27px,5vw,55px)",color:"white",display:"grid",gap:16}}>
   <span style={{fontSize:11,letterSpacing:2,fontWeight:850,color:"#f3b7cb"}}>AVUQO TYRES / SUPPLIER TWO</span>
   <h1 style={{fontSize:"clamp(32px,5vw,58px)",letterSpacing:"-.05em",lineHeight:1.12,margin:0}}>
    Tyres Pneus Online UK</h1>
   <p style={{margin:0,maxWidth:780,lineHeight:1.8,color:"#e9deeb"}}>
    Secure, server-side onboarding for our second tyre feed. No file uploads on your phone,
    no automatic publication and no mixing unverified products with approved retailer offers.
   </p>
  </header>
  {(source.error||feed.error||jobs.error||imports.error)&&
   <div role="alert" style={{...panel,borderColor:"#e7bc98",background:"#fff6ec"}}>
    Some private source information could not be read. Import progress must not be assumed.
   </div>}
  <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:15}}>
   <article style={panel}><span style={field}>Feed</span><strong>Awin 15236 / 26513</strong>
    <p style={sub}>{observed?.feed_name??"Feed identity registered"}</p>
    <span style={pill}>{observed?observed.listed_products.toLocaleString("en-GB")+" listed products":"Current count unavailable"}</span>
    <small style={sub}>Feed-list observation, not an imported product count.</small></article>
   <article style={panel}><span style={field}>Private-source permission</span>
    <strong>{gate==="ready"?"Evidence recorded":"Awaiting evidence"}</strong><p style={sub}>{text}</p></article>
   <article style={panel}><span style={field}>Server worker</span>
    <strong>{enabled?"Enabled":"Disabled by default"}</strong>
    <p style={sub}>Worker processes only after private-stage rights are recorded and the Awin source remains paused.</p></article>
  </section>
  <section style={panel}>
   <span style={field}>Latest private import</span>
   <strong style={{fontSize:21}}>{run?run.status==="private_review"?"Imported into private review":run.status:
    "No private import has been completed"}</strong>
   {last&&<p style={sub}>Batch job: {last.state}. Saved {(last.committed_rows??0).toLocaleString("en-GB")}
    {" of "}{(last.validated_total??0).toLocaleString("en-GB")} source rows.
    Last checkpoint: {new Date(last.updated_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}.</p>}
   {run&&<p style={sub}>Private review: {(run.review_count??0).toLocaleString("en-GB")};
    excluded: {(run.excluded_count??0).toLocaleString("en-GB")}. No public product approval.</p>}
   {!run&&<p style={sub}>The feed has been observed but no product rows have been imported. No upload is needed on your phone.</p>}
  </section>
  <section style={panel}>
   <span style={field}>Before comparison goes live</span>
   <h2 style={{margin:0,fontSize:24}}>Exact tyre matches, then genuine full prices</h2>
   <p style={sub}>Once private staging is permitted, we will inspect the second retailer's actual schema and match only
    complete variants, including load, speed, run-flat, XL and OE specification. Fitted and delivered
    offers remain separate until compulsory fees and availability are verified.</p>
   <p style={{...sub,fontWeight:700}}>Nothing on this page enables Awin, grants image rights,
    changes historical Tyres UK prices or releases an affiliate checkout.</p>
  </section>
 </main>;
}
