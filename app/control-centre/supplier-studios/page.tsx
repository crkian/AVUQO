import Link from "next/link";
import {connection} from "next/server";
import type {CSSProperties} from "react";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {PARTNERS,partnerHref} from "../../../lib/partners/advertiser-directory";
import {partnerStudio} from "../../../lib/partners/studio-editorial";
import {departmentsForPartner} from "../../../lib/partners/catalogue-taxonomy";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Supplier Studio Design Review | AVUQO Control Centre",robots:{index:false,follow:false}};
export default async function SupplierStudiosReview(){
 await connection();
 const {role}=await requireControlCentreAccess();
 const studios=PARTNERS.flatMap(partner=>{
  const editorial=partnerStudio(partner.slug);
  return editorial?[{partner,editorial,departments:departmentsForPartner(partner.slug)}]:[];
 });
 return <main className={styles.page}>
  <nav className={styles.breadcrumb}>
   <Link href="/control-centre">← Control Centre</Link>
   <Link href="/control-centre/supplier-readiness">Supplier feed and product readiness</Link>
   <Link href="/partners">Public retailer directory</Link>
  </nav>
  <header className={styles.hero}>
   <p className={styles.kicker}>OWNER OPERATIONS / {role.toUpperCase()} / EDITORIAL QUALITY</p>
   <h1>Every supplier deserves a proper shop window.</h1>
   <p>Review the 21 individually authored AVUQO retailer studios, their bespoke visual direction, buying guides and customer journeys. These are AVUQO editorial treatments, not representations of official brand identity or merchant endorsement.</p>
   <div className={styles.metrics}>
    <div><b>{studios.length}</b><span>Individual studio designs</span></div>
    <div><b>{studios.reduce((n,s)=>n+s.editorial.chapters.length,0)}</b><span>Distinct buyer-guide modules</span></div>
    <div><b>25</b><span>Original departments preserved</span></div>
   </div>
  </header>
  <section className={styles.intro} aria-labelledby="studio-review-heading">
   <div><h2 id="studio-review-heading">Review each shop window</h2>
    <p>Check the actual public route while signed out, including product images, outbound destinations, mobile layout and affiliate disclosure. A high-quality studio does not imply a supplier feed is working or that permissions are granted.</p>
   </div>
   <Link href="/control-centre/supplier-readiness">Inspect live feed and product blockers ↗</Link>
  </section>
  <section className={styles.grid} aria-label="Supplier studio visual identities">
   {studios.map(({partner,editorial,departments})=><article className={styles.card} key={partner.slug}
    style={{"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties}>
    <div className={styles.art}><span aria-hidden="true">{partner.symbol}</span>
     <strong aria-hidden="true">{editorial.heroWord}</strong>
     <small>{editorial.stamp}</small>
    </div>
    <div className={styles.body}>
     <small className={styles.edition}>{editorial.edition}</small>
     <h3>{partner.name}</h3>
     <p className={styles.lead}>{editorial.lead}</p>
     <div className={styles.chapters}>{editorial.chapters.map(c=><span key={c.title}>{c.title}</span>)}</div>
     <p className={styles.departments}>{departments.map(d=>d.name).join(" · ")||"Existing AVUQO category"}</p>
     <div className={styles.actions}>
      <Link href={partnerHref(partner)}>Review public studio ↗</Link>
      <Link href={partner.categoryHref}>Category ↗</Link>
     </div>
    </div>
   </article>)}
  </section>
  <section className={styles.checklist}>
   <h2>Before an advertiser sees the page</h2>
   <ol>
    <li>Visit the public studio without authentication and check the layout at mobile and desktop sizes.</li>
    <li>Confirm displayed photographs came only from current rights-cleared, individually approved source offers. No private feed snapshot becomes a public photo.</li>
    <li>Check titles, descriptions, category associations and every external link against the exact supplier identity and published offer.</li>
    <li>For services, obtain a provider-specific quote or tariff adapter before publishing live price, guaranteed availability or booking totals.</li>
    <li>Use the existing supplier-readiness and source-approval controls for evidence; this design review page cannot release offers or alter independent rankings.</li>
   </ol>
   <div className={styles.actions}><Link href="/control-centre/source-readiness">Source permissions ↗</Link><Link href="/control-centre/awin-feed-updates">Awin feed monitor ↗</Link><Link href="/advertise">Public partnership information ↗</Link></div>
  </section>
 </main>;
}
