import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {Search,ShieldCheck,PackageSearch} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {ebayUkPrivateSearch} from "../../../lib/ebay/private-uk-browse";
import EbayPrivateImages from "./EbayPrivateImages";
import styles from "./ebay-private.module.css";
export const metadata:Metadata={title:"eBay UK private product pilot | AVUQO",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
 await connection();
 await requireControlCentreAccess();
 const {q:raw}=await searchParams;
 const q=typeof raw==="string"?raw.trim().slice(0,80):"";
 const configured=Boolean(process.env.EBAY_CLIENT_ID&&process.env.EBAY_CLIENT_SECRET);
 let error="",items:Awaited<ReturnType<typeof ebayUkPrivateSearch>>=[];
 if(q.length>=2){
  try{items=await ebayUkPrivateSearch(q);}catch(e){error=e instanceof Error?e.message:"eBay search unavailable";}
 }
 const affiliateConfigured=/^\d{10}$/.test(process.env.EBAY_EPN_CAMPAIGN_ID??"");
 return <main className={styles.page}>
  <Header/>
  <div className={styles.private}>OWNER-ONLY · EBAY UK SOURCE PILOT · NO PRODUCTS PUBLISHED</div>
  <div className={styles.shell}>
   <nav className={styles.breadcrumb}><Link href="/preview/storefront">Private shop</Link><span>/</span><Link href="/control-centre">Control Centre</Link><span>/</span>eBay UK pilot</nav>
   <div className={styles.intro}><span className={styles.eyebrow}>ANOTHER WAY TO FIND VALUE</span><h1>Explore eBay UK, privately.</h1>
    <p>Review actual eBay Browse API results alongside AVUQO’s existing shopping experience. This pilot does not import listings, publish photographs or create offers, and never treats an eBay seller as the manufacturer.</p>
   </div>
   <div className={styles.status}>
    <div><ShieldCheck size={19}/><span><strong>Developer API</strong><small>{configured?"Configured for owner search":"Not yet connected"}</small></span></div>
    <div><PackageSearch size={19}/><span><strong>eBay Partner Network</strong><small>{affiliateConfigured?"Campaign ID configured; affiliate permissions still require review":"Not configured for affiliate tracking"}</small></span></div>
    <div><ShieldCheck size={19}/><span><strong>Publication</strong><small>Private inspection only</small></span></div>
   </div>
   <form action="/preview/ebay" method="GET" className={styles.search} role="search">
    <Search size={20} aria-hidden="true"/><input name="q" type="search" aria-label="Search eBay UK privately" defaultValue={q} minLength={2} maxLength={80} placeholder="Try a model, product or brand" required/>
    <button type="submit">Search eBay UK</button>
   </form>
   {!configured&&<p className={styles.note}>To activate genuine UK search, configure <code>EBAY_CLIENT_ID</code> and <code>EBAY_CLIENT_SECRET</code> as server-side Vercel environment variables. Do not enter these credentials in chat or on a public form. The eBay source can remain paused.</p>}
   {error&&<p className={styles.error} role="alert">{error}</p>}
   {q&&items.length>0&&<><div className={styles.sectionHead}><h2>eBay results for “{q}”</h2><p>{items.length} listings returned. Prices are observations at lookup time, not approved AVUQO offers.</p></div><EbayPrivateImages items={items}/></>}
   {q&&!error&&configured&&items.length===0&&<p className={styles.note}>No matching UK listings were returned. Try a different product or model.</p>}
   <section className={styles.evidence}>
    <h2>Before any eBay product goes live</h2>
    <ul><li>Confirm UK application and eBay Partner Network permissions, API access and image-use terms</li><li>Separate eBay seller from the retailer-supplied brand and legally verified manufacturer</li><li>Match exact item variations using GTIN, MPN and model evidence rather than similar names alone</li><li>Check item condition, complete delivery cost, price timestamp and availability</li><li>Verify compliant affiliate tracking and approve each public offer separately</li></ul>
    <p>No automatic product imports, stored eBay credentials or live checkout links are introduced by this pilot.</p>
   </section>
  </div><Footer/>
 </main>;
}
