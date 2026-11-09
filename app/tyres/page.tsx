import Link from "next/link";
import type {Metadata} from "next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {tyreCollections} from "../../lib/tyres/catalogue";
import styles from "./tyres.module.css";

export const metadata:Metadata={
 title:"Tyres & tyre buying guide | AVUQO",
 description:"Understand tyre sizes, ratings and the full fitted cost before you compare. AVUQO tyre products are being verified for release.",
 alternates:{canonical:"/tyres"}
};
export default function TyresPage(){
 return <main className={styles.page}>
  <Header/>
  <section className={styles.hero}>
   <div className={`${styles.shell} ${styles.heroGrid}`}>
    <div>
     <span className={styles.eyebrow}>AVUQO · Motoring intelligence</span>
     <h1>Better tyres.<br/><em>Clearer decisions.</em></h1>
     <p>Find your way through tyre sizes, brands and specifications. The right choice starts with the tyres your vehicle requires, not a misleading headline price.</p>
     <div className={styles.heroActions}>
      <Link className={styles.cta} href="#browse">Explore tyre types</Link>
      <Link className={styles.ghost} href="/tyres/brands">Browse manufacturers</Link>
     </div>
    </div>
    <div className={styles.tyreArt} aria-hidden="true"/>
   </div>
  </section>
  <div className={styles.privateBar}>Tyre comparisons are being prepared. No live tyre offers, stock, fitment recommendations or fitted prices are available on AVUQO yet.</div>
  <div className={`${styles.shell} ${styles.main}`}>
   <section className={styles.section} id="browse">
    <div className={styles.headingRow}><div><p className={styles.kicker}>Explore</p><h2>Browse by tyre type</h2><p className={styles.sub}>These are buying-guide categories, not verified product matches. Each product must be individually classified before it appears in a customer comparison.</p></div></div>
    <div className={styles.cardGrid}>{tyreCollections.map(type=><article className={styles.card} key={type.slug}>
     <h3>{type.title}</h3><p>{type.description}</p>
     <Link href={`/tyres/categories/${type.slug}`}>Explore guide →</Link>
    </article>)}</div>
   </section>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>Know your fit</p><h2>Three numbers. One important starting point.</h2><p className={styles.sub}>The size marking on your tyre is a useful starting point. It does not by itself establish vehicle suitability.</p></div></div>
    <div className={styles.infoGrid}>
     <div className={styles.info}><b>Width</b><p>In a marking such as 205/55 R16, 205 is the nominal tyre width in millimetres.</p></div>
     <div className={styles.info}><b>Profile</b><p>55 is the aspect ratio. It describes sidewall height as a percentage of nominal width.</p></div>
     <div className={styles.info}><b>Rim diameter</b><p>R16 indicates radial construction and a 16-inch rim diameter. Load and speed ratings must also be checked.</p></div>
    </div>
   </section>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>What makes value?</p><h2>The real cost goes beyond a tyre price.</h2></div></div>
    <div className={styles.infoGrid}>
     <div className={styles.info}><b>Correct fitment</b><p>Check your vehicle handbook, approved tyre size and the required load and speed ratings before purchase.</p></div>
     <div className={styles.info}><b>Full fitted price</b><p>Include fitting, balancing, valves, delivery and disposal charges where applicable. Confirm what the quote covers.</p></div>
     <div className={styles.info}><b>Reliable specifications</b><p>Tyre labels, season type, run-flat capability and exact model variants require evidence, not assumptions.</p></div>
    </div>
   </section>
   <aside className={styles.notice}><strong>AVUQO verification standard:</strong> Our existing Awin tyre feed is held in private review. Prices and technical details from that import are historical, unverified supplier observations. We will only show live customer offers after data rights, availability, exact variants, safe fitment information and total costs are checked.</aside>
  </div>
  <Footer/>
 </main>;
}
