import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {Search,ShieldCheck,PackageSearch} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {ebayUkPrivateSearch,ebayPilotReadiness} from "../../../lib/ebay/private-uk-browse";
import EbayPrivateImages from "./EbayPrivateImages";
import styles from "./ebay-private.module.css";
export const instant=false;
export const metadata:Metadata={title:"eBay UK private product pilot | AVUQO",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
 await connection();
 await requireControlCentreAccess();
 const {q:raw}=await searchParams;
 const q=typeof raw==="string"?raw.trim().slice(0,80):"";
 const readiness=ebayPilotReadiness();
 const configured=readiness.credentialsConfigured;
 let error="",items:Awaited<ReturnType<typeof ebayUkPrivateSearch>>=[];
 if(q.length>=2&&readiness.ready){
  try{items=await ebayUkPrivateSearch(q);}catch(e){error=e instanceof Error?e.message:"eBay search unavailable";}
 }
 const affiliateConfigured=readiness.campaignConfigured&&readiness.environment==="production";
 return <main className={styles.page}>
  <Header/>
  <div className={styles.private}>OWNER-ONLY · EBAY UK SOURCE PILOT · NO PRODUCTS PUBLISHED</div>
  <div className={styles.shell}>
   <nav className={styles.breadcrumb}><Link href="/preview/storefront">Private shop</Link><span>/</span><Link href="/control-centre/retailers">Retailer onboarding</Link><span>/</span>eBay UK pilot</nav>
   <div className={styles.intro}><span className={styles.eyebrow}>ANOTHER WAY TO FIND VALUE</span><h1>Explore eBay UK, privately.</h1>
    <p>Review actual eBay Browse API results alongside AVUQO’s existing shopping experience. This pilot does not import listings, publish photographs or create offers, and never treats an eBay seller as the manufacturer.</p>
   </div>
   <div className={styles.status}>
    <div><ShieldCheck size={19}/><span><strong>Developer API · {readiness.environment==="sandbox"?"Sandbox":"Production"}</strong><small>{readiness.ready?"Ready for private API testing":configured?"Keyset detected; production Browse approval required":"No matching environment keyset yet"}</small></span></div>
    <div><PackageSearch size={19}/><span><strong>eBay Partner Network</strong><small>{affiliateConfigured?"Campaign ID present; EPN and Browse permissions must still be verified":"Not active for this private mode"}</small></span></div>
    <div><ShieldCheck size={19}/><span><strong>Publication</strong><small>Private inspection only · no feed imports</small></span></div>
   </div>
   <form action="/preview/ebay" method="GET" className={styles.search} role="search">
    <Search size={20} aria-hidden="true"/><input name="q" type="search" aria-label="Search eBay UK privately" defaultValue={q} minLength={2} maxLength={80} placeholder="Try a model, product or brand" required/>
    <button type="submit">Search eBay UK</button>
   </form>
   <div className={styles.note}>
    <strong>Current mode: {readiness.environment==="sandbox"?"Sandbox test listings only":"Production live lookup, owner-only"}.</strong>
    {readiness.environment==="sandbox"?
     <p>Use the Sandbox App ID and Cert ID from your eBay keyset as Vercel server-only <code>EBAY_SANDBOX_CLIENT_ID</code> and <code>EBAY_SANDBOX_CLIENT_SECRET</code>. Sandbox results are test data, not real offers. No credentials belong in chat, GitHub or a public form.</p>:
     <p>Production API search requires <code>EBAY_CLIENT_ID</code>, <code>EBAY_CLIENT_SECRET</code>, <code>EBAY_BROWSE_ENVIRONMENT=production</code> and explicit verified Buy API permission recorded by <code>EBAY_BROWSE_PRODUCTION_APPROVED=true</code>. Never use Sandbox keys in Production or set the approval flag before eBay has approved the application.</p>}
    <p>eBay&apos;s production Browse API requires separate access review via EPN. A developer keyset and affiliate membership alone do not grant that permission. No automatic imports, affiliate checkout or public product publication can occur here.</p>
    <Link href="/control-centre/retailers">See Awin and eBay onboarding together →</Link>
   </div>
   {!readiness.ready&&readiness.environment==="production"&&readiness.credentialsConfigured&&<p className={styles.error} role="status">Production keyset exists, but approval for restricted eBay Browse access is not recorded. Private search remains disabled.</p>}
   {error&&<p className={styles.error} role="alert">{error}</p>}
   {q&&items.length>0&&<><div className={styles.sectionHead}><h2>{readiness.environment==="sandbox"?"eBay test results":"eBay UK results"} for “{q}”</h2><p>{items.length} listings returned. {readiness.environment==="sandbox"?"Sandbox listings are fictional test data.":"Prices are observations at lookup time, not approved AVUQO offers."}</p></div><EbayPrivateImages items={items}/></>}
   {q&&!error&&readiness.ready&&items.length===0&&<p className={styles.note}>No matching UK listings were returned. Try a different product or model.</p>}
   <section className={styles.evidence}>
    <h2>Before any eBay product goes live</h2>
    <ul><li>Confirm UK application and eBay Partner Network permissions, API access and image-use terms</li><li>Separate eBay seller from the retailer-supplied brand and legally verified manufacturer</li><li>Match exact item variations using GTIN, MPN and model evidence rather than similar names alone</li><li>Check item condition, complete delivery cost, price timestamp and availability</li><li>Verify compliant affiliate tracking and approve each public offer separately</li></ul>
    <p>No automatic product imports, stored eBay credentials or live checkout links are introduced by this pilot.</p>
   </section>
  </div><Footer/>
 </main>;
}
