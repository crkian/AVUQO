import Link from "next/link";
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ExternalLink,ShieldCheck} from "lucide-react";
import {departmentBlueprint} from "../../lib/products/department-showrooms";
import type {ResearchProductGuide} from "../../lib/products/research-guides";
import styles from "../../app/products/[slug]/page.module.css";

/**
 * Public research-only page: no demo offer, merchant image, price, score, stock,
 * affiliate URL, Saved action or live comparison widget can be displayed here.
 * When a real approved offer later exists, the route's verifiedProduct path wins.
 */
export default function ResearchProductDetails({guide}:{guide:ResearchProductGuide}){
 const dept=departmentBlueprint(guide.department);
 return <div className={`${styles.productPage} ${styles.researchPage}`}>
  <section className={styles.hero}><div className="shell">
   <Link className={styles.back} href="/products"><ArrowLeft size={17}/> All product guides</Link>
   <div className={styles.heroGrid}>
    <div className={styles.art}><div className={styles.researchIllustration} role="img" aria-label="Editorial guide illustration, not a manufacturer product photograph">
     <BookOpen size={58} aria-hidden="true"/><span>Research guide</span>
     <small>No licensed product photograph displayed</small>
    </div></div>
    <div className={styles.copy}>
     <p className={styles.kicker}>{guide.brand} · Editorial product research</p>
     <h1>{guide.title}</h1>
     <p className={styles.intro}>{guide.teaser}</p>
     <div className={`${styles.topPrice} ${styles.researchStatus}`}>
      <span>Retailer comparison status</span><strong>Not verified yet</strong>
      <small>No current retailer price, discount, stock claim, AVUQO Score or affiliate buying link is available for this research guide. Demo records and unapproved feeds are not used as offers.</small>
     </div>
     <div className={styles.heroActions}>
      <Link className={styles.action} href={"#research-checklist"}>What to check <ArrowRight size={17}/></Link>
      <Link className={styles.researchSecondary} href={"/categories/"+guide.department+"/products"}>More {dept?.name??"products"} guides</Link>
     </div>
     <p className={styles.assurance}><ShieldCheck size={17}/> Research-first, independent of affiliate commissions.</p>
    </div>
   </div>
  </div></section>

  <section className={`shell ${styles.templateSection} ${styles.researchSection}`} id="research-checklist">
   <div className={styles.templateHeading}><p className={styles.kicker}>Before you compare</p>
    <h2>Know the exact model.</h2><p>{guide.modelNote}</p></div>
   <div className={styles.researchChecklist}>
    {guide.checklist.map((point,i)=><article key={point}><CheckCircle2 size={22} aria-hidden="true"/>
     <div><small>Check {i+1}</small><p>{point}</p></div></article>)}
   </div>
  </section>

  <section className={`shell ${styles.researchManufacturer}`} aria-labelledby="manufacturer-guide-heading">
   <div><p className={styles.kicker}>Check at the source</p><h2 id="manufacturer-guide-heading">Manufacturer information</h2>
    <p>Review the manufacturer&apos;s published model details. Specifications and bundles can vary by country or product suffix, so confirm the exact item before purchasing.</p>
    <a href={guide.manufacturerInfoUrl} target="_blank" rel="noopener noreferrer">
     See official manufacturer information <ExternalLink size={17} aria-hidden="true"/>
    </a>
   </div>
   {dept&&<aside><p className={styles.kicker}>{dept.name} buying context</p><h3>{dept.focus}</h3>
    <ul>{dept.checklist.map(point=><li key={point}><CheckCircle2 size={17} aria-hidden="true"/>{point}</li>)}</ul></aside>}
  </section>
  <section className={`shell ${styles.disclaimer}`}>
   <strong>About this guide</strong>
   <p>This is an independent product research starting point, not an approved merchant offer, a price comparison, an endorsement or a claim of availability. Product names are used for identification; imagery is editorial only. Retailer comparisons will appear through AVUQO&apos;s separate source, variant, freshness, rights and owner-review controls. <Link href="/editorial-policy">Editorial policy</Link> · <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.</p>
  </section>
 </div>;
}
