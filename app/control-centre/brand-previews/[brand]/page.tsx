import type {Metadata} from "next";
import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,ShieldCheck,Store} from "lucide-react";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {findBrandPreview,findPilotPreview,productsForBrand,privatePilotHref} from "../../../../lib/products/private-preview";
import styles from "../../pilot-products/detail.module.css";
type Props={params:Promise<{brand:string}>};
type BrandProduct={slug:string;canonical_title:string;brand:string|null;status:string};
export const metadata:Metadata={title:"Private brand-area layout preview | AVUQO",robots:{index:false,follow:false}};
export default async function BrandPreview({params}:Props){
 await connection();
 await requireControlCentreAccess();
 const {brand}=await params;
 const config=findBrandPreview(brand);
 if(!config)notFound();
 const previewProducts=productsForBrand(brand);
 const db=createAdminClient();
 const records=await db.from("products").select("slug,canonical_title,brand,status")
  .in("slug",previewProducts.map(p=>p.slug)).eq("status","draft").order("canonical_title");
 const products=(records.data??[]) as BrandProduct[];
 return <div className={styles.page} data-theme={config.theme}>
  <header className={styles.pageHeader}><p className={styles.eyebrow}>Advertising &amp; Growth / Brand destination concepts</p>
   <div className={styles.headingRow}><div><h1>{config.displayName} area preview</h1>
    <p>Test a company-oriented collection before discussing agreements, imagery, content rights or commercial placements.</p></div>
    <Link className={styles.back} href="/control-centre/pilot-products"><ArrowLeft size={16}/> All products</Link></div>
   <div className={styles.privateNotice}><ShieldCheck size={19}/>
    <div><strong>Unlicensed brand-area concept, not an official brand shop</strong><span>No company endorsement, trademark logo use, advertising contract, payment, or live offers.</span></div>
   </div>
  </header>
  <div className={styles.browserMock}>
   <div className={styles.browserChrome}><span className={styles.browserDots}>● ● ●</span><span>AVUQO · Brand discovery concept</span><span>PRIVATE</span></div>
   <section className={styles.brandHero}>
    <p>AVUQO curated brand discovery concept</p>
    <h2>{config.headline}</h2>
    <span>{config.introduction}</span>
    <div className={styles.brandMark}><Store size={19}/> Text brand identifier only · Unaffiliated concept</div>
   </section>
   <div className={styles.mockBody}>
    <section className={styles.brandIntro}><div><p className={styles.productEyebrow}>Explore the collection</p>
      <h2>A company-focused starting point, with AVUQO&apos;s independence intact.</h2>
      <p>{config.customerAngle}</p></div></section>
    <section className={styles.focusSection}><h2>What visitors could browse</h2>
     <div className={styles.focusGrid}>{config.focusAreas.map((item,i)=><article key={item}>
      <span aria-hidden="true">{["✦","◈","◇"][i]}</span><h3>{item}</h3><p>Editorial navigation concept. Product claims and inventory will need verification.</p>
     </article>)}</div>
    </section>
    <section className={styles.collection}>
     <div><p className={styles.productEyebrow}>Imported products for layout checks</p>
       <h2>{config.displayName} product drafts</h2>
       <p>These are imported identities, not live stock, partner offers or advertised recommendations.</p></div>
     {records.error?<p role="alert">Private draft records are temporarily unavailable.</p>:<div className={styles.collectionGrid}>
      {products.map((p,i)=><Link key={p.slug} href={privatePilotHref(p.slug)} className={styles.collectionCard}>
       <div className={styles.collectionArt} aria-hidden="true"><span>Q</span><small>IMAGE RIGHTS PENDING</small></div>
       <div><p>PRIVATE PRODUCT PREVIEW {i+1}</p><h3>{findPilotPreview(p.slug)?.suggestedTitle??p.canonical_title}</h3><span>Inspect individual page <ArrowRight size={15}/></span></div>
      </Link>)}</div>}
    </section>
    <section className={styles.sponsorPolicy}>
     <div><p className={styles.productEyebrow}>Future commercial opportunity</p><h2>What a company-branded area could include</h2>
      <p>Approved brand storytelling, licensed media, agreed landing pages and clearly labelled paid slots. Organic product comparisons remain separate and independent.</p></div>
     <div className={styles.sponsorColumns}>
      <article><strong>Editorial brand directory</strong><span>Brand identification and category browsing; independent of paid relationships.</span></article>
      <article><strong>Clearly labelled sponsored feature</strong><span>Available only after contract, rights review and advertising controls are live.</span></article>
      <article><strong>Independent product comparisons</strong><span>Prices, scores, offer order and eligibility never sold to an advertiser.</span></article>
     </div>
     <Link href="/control-centre/site-advertising">Open the separate Site Advertising workspace <ArrowRight size={16}/></Link>
    </section>
    <div className={styles.disclosure}><ShieldCheck size={17}/>
      <span>This design is not affiliated with {config.displayName}. No official logos or product photos have been used; all imported drafts remain unpublished.</span></div>
   </div>
  </div>
  <div className={styles.sequence}><Link href="/control-centre/pilot-products"><ArrowLeft size={16}/> Return to product gallery</Link></div>
 </div>;
}
