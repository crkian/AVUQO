import Link from "next/link";
import type {Metadata} from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {tyreBrandNames,tyreBrandSlug} from "../../../lib/tyres/catalogue";
import styles from "../tyres.module.css";
export const metadata:Metadata={title:"Tyre manufacturers | AVUQO",description:"Explore tyre manufacturer guides and learn what to check before choosing a model.",robots:{index:false,follow:true}};
export default function Brands(){
 return <main className={styles.page}><Header/>
 <section className={styles.hero}><div className={styles.shell}>
  <span className={styles.eyebrow}>Tyre manufacturer directory</span>
  <h1>Know the brand.<br/><em>Check the exact tyre.</em></h1>
  <p>Manufacturer names are a browsing starting point. Real products, model variants and prices need independent evidence before comparison.</p>
 </div></section>
 <div className={`${styles.shell} ${styles.main}`}>
  <nav className={styles.breadcrumb}><Link href="/tyres">Tyres</Link><span>/</span><span>Manufacturers</span></nav>
  <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Browse alphabetically</p>
   <h2>Tyre manufacturers</h2><p className={styles.sub}>Editorial directory only. No manufacturer listing here represents an approved seller, a live offer or a tyre fitting recommendation.</p></div></div>
   <div className={styles.brandGrid}>{tyreBrandNames.map(name=><Link className={styles.brandLink} key={name} href={`/tyres/brands/${tyreBrandSlug(name)}`}>{name}<span aria-hidden="true">→</span></Link>)}</div>
  </section>
  <aside className={styles.notice}>Individual manufacturer pages are informational previews while approved product listings are being prepared. Confirm exact tyre specifications, vehicle fitment and final fitted cost with a qualified provider.</aside>
 </div><Footer/></main>;
}