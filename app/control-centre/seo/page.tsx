import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {BROWSE_DEPARTMENTS} from "../../../lib/categories/browse-tree";
import {PARTNERS} from "../../../lib/partners/advertiser-directory";
import {MEASUREMENT_GATES} from "../../../lib/analytics/contracts";

export const metadata={title:"Search visibility audit | AVUQO Control Centre",
 robots:{index:false,follow:false}};
const checks=[
 {name:"Canonical sitemap",href:"/sitemap.xml",detail:"Public editorial routes and eligible supplier pages; no internal search/filter or private product fixtures"},
 {name:"Crawler policy",href:"/robots.txt",detail:"Production crawl access, private routes excluded, preview environment blocked"},
 {name:"Department metadata",href:"/categories",detail:"Unique department titles, descriptions, canonicals, OpenGraph and breadcrumb structured data"},
 {name:"Retailer metadata",href:"/partners",detail:"Individual supplier metadata and editorial CollectionPage structured data; not official merchant ownership"},
 {name:"Verified product metadata",href:"/products",detail:"Only current eligible products indexable; research-only guides stay noindex"},
 {name:"Analytics integrity",href:"/control-centre/analytics",detail:"First-party reporting is owner-only; optional visitor collection remains disabled until consent and ingestion gates pass"}
];
export default async function SearchVisibilityAudit(){
 await connection();await requireControlCentreAccess();
 const departments=BROWSE_DEPARTMENTS.filter(d=>!d.landing);
 const partners=PARTNERS.filter(p=>p.links.length>0||
  ["496","77952","101445","736","31539"].includes(p.advertiserId??""));
 return <main style={{maxWidth:1100,margin:"0 auto",padding:"48px 24px 80px",color:"#2d1d38"}}>
  <p style={{fontSize:12,letterSpacing:2,fontWeight:800}}>AVUQO / CONTROL CENTRE / SEARCH DISCOVERY</p>
  <h1 style={{font:"700 clamp(36px,5vw,62px) Georgia,serif",margin:"14px 0"}}>Search visibility &amp; measurement</h1>
  <p style={{lineHeight:1.8,maxWidth:820}}>A code-backed readiness inventory, not a claim of Google indexing, organic traffic or search-engine approval. Inspect the live crawler files and submit the canonical sitemap in your own verified search-console account.</p>
  <div style={{display:"flex",gap:14,flexWrap:"wrap",margin:"28px 0"}}>
   {[
    ["Editorial department URLs",departments.length],
    ["Supplier URLs selected for sitemap",partners.length],
    ["Browser analytics enabled",MEASUREMENT_GATES.clientCollectionEnabled?"Yes":"No"]
   ].map(([label,value])=><div key={label} style={{padding:22,background:"#f7f0f7",borderRadius:12,minWidth:210}}>
    <strong style={{display:"block",fontSize:30}}>{value}</strong><span style={{fontSize:12}}>{label}</span></div>)}
  </div>
  <h2>Live routes to verify</h2>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:13}}>
   {checks.map(item=><section key={item.name} style={{border:"1px solid #e4d8e4",borderRadius:12,padding:22}}>
    <h3 style={{margin:"0 0 9px"}}>{item.name}</h3><p style={{fontSize:13,lineHeight:1.7}}>{item.detail}</p>
    <Link href={item.href} style={{color:"#69438b",fontWeight:800}}>Inspect route →</Link></section>)}
  </div>
  <h2 style={{marginTop:38}}>External verification still required</h2>
  <ul style={{lineHeight:2}}>
   <li>Verify domain ownership and sitemap submission in Google Search Console and Bing Webmaster Tools.</li>
   <li>Check indexing, robots access, canonical selection, mobile usability and rich-result validation on actual deployed pages.</li>
   <li>Fix server errors, thin/duplicate content, stale listings and redirect chains from real crawler reports.</li>
   <li>Complete UK privacy/consent and data retention reviews before enabling optional analytics collection.</li>
   <li>Do not equate an affiliate click with a conversion or inferred revenue.</li>
  </ul>
  <Link href="/control-centre/analytics" style={{color:"#69438b",fontWeight:800}}>Open first-party analytics →</Link>
 </main>;
}
