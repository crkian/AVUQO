import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,ShieldCheck,KeyRound,PackageSearch,Store} from "lucide-react";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {joinedAwinAdvertisers,joinedInSource} from "../../../lib/awin/joined-catalogue";
import {ebayPilotReadiness} from "../../../lib/ebay/private-uk-browse";
import styles from "../source-atlas/atlas.module.css";

export const instant=false;
export const metadata:Metadata={title:"Retailer feed onboarding | AVUQO Control Centre",robots:{index:false,follow:false}};
type SourceRow={connector_key:string;status:string;sync_enabled:boolean;metadata:unknown;credential_status:string|null};
type Run={merchant_id:string;merchant_name:string;review_count:number;total_count:number;created_at:string;permission_status:string};
type Seen={advertiser_id:string;listed_products:number|null;updated_at:string};
const priority=["77952","31539","736","45747","496","12715","15236"];
function statusWord(raw:string|undefined){return raw==="verified"?"Reviewed rights evidence":"Unverified";}
function stamp(raw:string|undefined){return raw?new Date(raw).toLocaleDateString("en-GB",{timeZone:"Europe/London"}):"Not recorded";}

export default async function RetailerOnboarding(){
 await connection();
 await requireControlCentreAccess();
 const db=createAdminClient();
 const [src,imports,observations]=await Promise.all([
  db.from("sources").select("connector_key,status,sync_enabled,metadata,credential_status")
   .in("connector_key",["awin","ebay"]).limit(3),
  db.from("feed_import_runs").select("merchant_id,merchant_name,review_count,total_count,created_at,permission_status")
   .order("created_at",{ascending:false}).limit(100),
  db.from("awin_feed_update_observations").select("advertiser_id,listed_products,updated_at")
   .order("updated_at",{ascending:false}).limit(200)
 ]);
 const errors=[src.error,imports.error,observations.error].filter(Boolean);
 const sources=(src.data??[]) as SourceRow[];
 const awin=sources.find(x=>x.connector_key==="awin");
 const ebay=sources.find(x=>x.connector_key==="ebay");
 const latestRun=new Map<string,Run>();
 for(const r of (imports.data??[]) as Run[])if(!latestRun.has(r.merchant_id))latestRun.set(r.merchant_id,r);
 const latestObservation=new Map<string,Seen>();
 for(const o of (observations.data??[]) as Seen[])if(!latestObservation.has(o.advertiser_id))latestObservation.set(o.advertiser_id,o);
 const entries=[...joinedAwinAdvertisers].sort((a,b)=>{
  const ax=priority.indexOf(a[0]),bx=priority.indexOf(b[0]);
  return (ax<0?100:ax)-(bx<0?100:bx);
 });
 const importedMerchants=[...latestRun.keys()].filter(id=>joinedAwinAdvertisers.some(([joinedId])=>joinedId===id));
 const imageCoverage=new Map<string,{total:number;withImage:number;error:boolean}>();
 await Promise.all(importedMerchants.map(async id=>{
  const [total,images]=await Promise.all([
   db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("merchant_id",id),
   db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("merchant_id",id).not("image_url","is",null)
  ]);
  imageCoverage.set(id,{total:total.count??0,withImage:images.count??0,error:Boolean(total.error||images.error)});
 }));
 const ebayConfig=ebayPilotReadiness();
 const joined=entries.filter(([id])=>awin&&joinedInSource(awin.metadata,id)).length;
 const allRunCount=(imports.data??[]).length;
 return <div className={styles.page}>
  <header className={styles.header}>
   <p className={styles.kicker}>SOURCES / COMMERCIAL NETWORKS / OWNER-ONLY</p>
   <h1>Real retailers. Ready when the evidence is.</h1>
   <p>AVUQO already has an Awin monitoring and private-import pipeline plus an eBay UK Browse preview. This workspace checks their real setup and routes you to existing safe controls. Nothing here imports products, changes source permissions, or publishes prices and imagery.</p>
   <nav className={styles.links}>
    <Link href="/control-centre/feed-imports">Private Awin imports <ArrowRight size={15}/></Link>
    <Link href="/preview/ebay">Private eBay preview <ArrowRight size={15}/></Link>
    <Link href="/control-centre/source-readiness">Source rights review <ArrowRight size={15}/></Link>
   </nav>
  </header>
  {errors.length>0&&<div className={styles.notice}>Some source or feed records were unavailable. Unavailable data must never be treated as a confirmed programme approval.</div>}
  <section className={styles.grid} aria-label="Retailer onboarding snapshot">
   <article className={styles.metric}><small>Awin joined-programme observations</small><strong>{src.error?"Unknown":joined}</strong><p>Recorded membership observations, not live publisher or image permission</p></article>
   <article className={styles.metric}><small>Private import runs inspected</small><strong>{imports.error?"Unknown":allRunCount}</strong><p>Runs are not unique retailers, current prices or public products</p></article>
   <article className={styles.metric}><small>eBay test credentials</small><strong>{ebayConfig.credentialsConfigured?"Present":"Absent"}</strong><p>{ebayConfig.environment==="sandbox"?"Sandbox API mode":"Production approval-gated mode"} · environment-specific keyset</p></article>
   <article className={styles.metric}><small>Commercial sources</small><strong>{awin?.status==="paused"&&ebay?.status==="paused"?"Paused":"Review state"}</strong><p>Source publication stays off until exact rights and owner approvals are recorded</p></article>
  </section>
  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>Awin: where we can start privately</h2>
    <p>Look at the small, product-focused programmes first, then larger catalogues. Every row is a historical membership observation and still requires feed, price, affiliate link and image-use checks.</p></div>
   <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th>Advertiser</th><th>Membership record</th><th>Most recent private feed</th><th>Private image references</th><th>Current feed observation</th><th>Rights gate</th></tr></thead>
    <tbody>{entries.map(([id,name])=>{
     const record=latestRun.get(id),seen=latestObservation.get(id),images=imageCoverage.get(id);
     const sourceMeta=awin?.metadata;
     const metaRecord=sourceMeta&&typeof sourceMeta==="object"&&!Array.isArray(sourceMeta)?sourceMeta as {awin_advertisers?:unknown}:null;
     const permissions=Array.isArray(metaRecord?.awin_advertisers)?metaRecord.awin_advertisers as {advertiser_id?:string;feed_permission_confirmed?:boolean}[]:[];
     const approvedFeed=permissions.some(x=>x.advertiser_id===id&&x.feed_permission_confirmed===true);
     return <tr key={id}>
      <td><strong>{name}</strong><small>Advertiser {id}{priority.includes(id)?" · prioritised for review":""}</small></td>
      <td><span className={styles.status}>{awin&&joinedInSource(awin.metadata,id)?"Joined, historically observed":"Not currently evidenced"}</span></td>
      <td>{record?<><strong>{Number(record.review_count??0).toLocaleString("en-GB")} review rows</strong><small>{stamp(record.created_at)} · {statusWord(record.permission_status)}</small></>:"No local import"}</td>
      <td>{images?(images.error?<span>Count unavailable</span>:<><strong>{images.withImage.toLocaleString("en-GB")} / {images.total.toLocaleString("en-GB")}</strong><small>URLs only · images not cleared for public display</small></>):<span>No imported images</span>}</td>
      <td>{seen?<><strong>{Number(seen.listed_products??0).toLocaleString("en-GB")} reported products</strong><small>Observed {stamp(seen.updated_at)} · not ingested</small></>:"Not observed"}</td>
      <td><span className={styles.status}>{approvedFeed?"Recorded feed permission; other gates remain":"Feed use not approved"}</span></td>
     </tr>;
    })}</tbody>
   </table></div>
   <div className={styles.notice}>Image figures count stored private feed URLs, including historical and repeated imports. They are not photographs licensed for AVUQO use. Public product imagery stays disabled until each merchant’s feed/image terms are checked and approved. Do not use a joined-programme label as consent to republish images, price feeds, discounts or tracking links. Tooled-Up has replaced its old feeds, so any old imported data must be refreshed against its current feed list before release.</div>
   <nav className={styles.links}><Link href="/control-centre/feed-imports">Inspect existing import reviews</Link>
    <Link href="/control-centre/product-previews">See private product cards</Link>
    <Link href="/control-centre/product-readiness">Check product evidence</Link></nav>
  </section>
  <section className={styles.panel} aria-labelledby="awin-merchant-terms-heading">
   <div className={styles.panelHead}>
    <h2 id="awin-merchant-terms-heading">Cadbury and Petlibro: documented restrictions</h2>
    <p>Historical owner-supplied Awin programme welcome emails and PDF terms were reviewed on 4 November 2026. These are restrictions to respect, not a current licence for public product photographs, feed data, pricing or affiliate links.</p>
   </div>
   <div className={styles.checks}>
    <article className={styles.check}>
     <ShieldCheck size={21}/><h3>Cadbury Gifts Direct · 736</h3>
     <p>Shopping directories, comparison and editorial publishing were described as allowed partner types. Sale-category purchases were excluded from commissions. Branded PPC bidding was restricted. The historical terms did not establish public feed-image storage, resizing, caching or republication permission.</p>
     <strong>Public feed/images: not approved by this evidence</strong>
    </article>
    <article className={styles.check}>
     <ShieldCheck size={21}/><h3>Petlibro UK · 77952</h3>
     <p>Organic comparison/editorial partner types were listed. UK coverage excluded Channel Islands and Gibraltar. Brand PPC and CSS had restrictions; documented commission figures conflicted. Feed-photo and price republication rights, retention and current assigned commission remain unverified.</p>
     <strong>Public feed/images: not approved by this evidence</strong>
    </article>
    <article className={styles.check}>
     <PackageSearch size={21}/><h3>Evidence needed before release</h3>
     <p>Verify the latest advertiser terms, permitted product/image use and retention, territory, live feed access and freshness, approved tracking link, eligibility and applicable paid-search rules. Request written merchant clarification where terms are ambiguous.</p>
     <Link href="/control-centre/source-readiness">Review rights and evidence gates</Link>
    </article>
   </div>
   <div className={styles.notice}>Awin joining and historical imported image URLs are not publication licences. No retailer is enabled by this section, no rights approvals are written, and the commercial source stays governed by the existing fail-closed checks.</div>
  </section>
  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>eBay UK: connect Sandbox, then request production access</h2>
    <p>AVUQO already has a private UK Browse search and responsive seller-item preview. Sandbox and Production are separate eBay environments.</p></div>
   <div className={styles.checks}>
    <article className={styles.check}><KeyRound size={21}/><h3>1. Create a Sandbox keyset</h3>
     <p>Application title: AVUQO Product Comparison. Use the Sandbox App ID and Cert ID as server-only Vercel variables <code>EBAY_SANDBOX_CLIENT_ID</code> and <code>EBAY_SANDBOX_CLIENT_SECRET</code>.</p>
     <a href="https://developer.ebay.com/my/keys" target="_blank" rel="noopener noreferrer">eBay developer keysets →</a></article>
    <article className={styles.check}><PackageSearch size={21}/><h3>2. Test the existing private UK search</h3>
     <p>The owner preview uses EBAY_GB, isolated OAuth endpoints, UK location filtering and server-held keys. Sandbox results are test items, not live retail quotes.</p>
     <Link href="/preview/ebay">Open private eBay item preview →</Link></article>
    <article className={styles.check}><ShieldCheck size={21}/><h3>3. Request eBay Browse production approval</h3>
     <p>The eBay Partner Network relationship, Production keyset and restricted Buy API access are separate checks. Only after approval should Production search be enabled for private inspection.</p>
     <a href="https://developer.ebay.com/api-docs/buy/buy-requirements.html" target="_blank" rel="noopener noreferrer">Official Buy API requirements →</a></article>
   </div>
   <div className={styles.notice}><Store size={15}/> No new automatic eBay importer or public checkout is enabled. Neither Sandbox data nor a Production keyset alone grants public product, photograph or affiliate publication rights.</div>
  </section>
 </div>;
}
