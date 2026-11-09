import {Suspense} from "react";
import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {ArrowRight,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {verifiedOffers,verifiedProductIndex} from "../../lib/products/public-catalog";
import {BROWSE_DEPARTMENTS,departmentHref} from "../../lib/categories/browse-tree";
import styles from "../marketplace/marketplace.module.css";

export const metadata:Metadata={
 title:"Who's Who | AVUQO Marketplace",
 description:"Explore manufacturers, category specialists and retailers, with approved commercial relationships distinguished from editorial information.",
 alternates:{canonical:"/whos-who"}
};

async function EvidenceDirectory(){
 await connection();
 const [offers,products]=await Promise.all([verifiedOffers({limit:60}),verifiedProductIndex(60)]);
 const retailers=[...new Set(offers.map(x=>x.published.merchant.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const brands=[...new Set(products.map(x=>x.product.brand?.trim()??"").filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 return <section className={styles.catalogue}>
  <div className={styles.shell}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>Verified commercial listings</p><h2>Who can you shop with on AVUQO?</h2>
    <p className={styles.sub}>This list comes only from retailer offers passing AVUQO&apos;s current public-release checks. Being mentioned in an editorial directory does not make a brand an AVUQO partner.</p></div></div>
   {retailers.length?<div className={styles.brandGrid}>{retailers.map(name=><article className={styles.brand} key={name}>
    <span className={styles.kicker}>Retailer in an eligible offer</span><h3>{name}</h3>
    <p>Relevant product offers have passed current source and public-release checks. Verify each seller&apos;s latest stock, price and terms.</p>
    <Link href="/products">View eligible products <ArrowRight size={14}/></Link>
   </article>)}</div>:<div className={styles.notice}>No independent retailer listing is currently eligible for this directory. We will add merchants only when their offers pass source rights, product, freshness and publication checks.</div>}
   <div style={{height:34}}/>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>Manufacturer evidence</p><h2>Brands in approved product records</h2>
    <p className={styles.sub}>A brand name in an eligible product record is not a claim of manufacturer sponsorship or endorsement.</p></div></div>
   {brands.length?<div className={styles.brandGrid}>{brands.map(name=><article className={styles.brand} key={name}><h3>{name}</h3>
    <p>Brand observed on an approved, eligible AVUQO product record.</p>
    <Link href={"/search?q="+encodeURIComponent(name)}>Explore eligible results <ArrowRight size={14}/></Link>
   </article>)}</div>:<p className={styles.warning}>No qualifying brand-level commercial products are available to display. Explore the editorial category directory instead.</p>}
  </div>
 </section>;
}
export default function WhosWho(){return <main className={styles.page}><Header/>
 <section className={styles.hero}><div className={styles.shell}><p className={styles.eyebrow}>AVUQO / WHO&apos;S WHO</p>
  <h1>The names behind<br/><span>the things we choose.</span></h1>
  <p>Explore makers, specialist categories and retail businesses. Discover without having to compare prices, and see clearly which supplier offers are actually approved.</p>
  <div className={styles.heroActions}><Link href="#markets" className={styles.primary}>Explore the directory <ArrowRight size={17}/></Link>
   <Link href="/marketplace" className={styles.secondary}>All marketplace journeys <ArrowRight size={17}/></Link></div>
 </div></section>
 <section id="markets" className={styles.shell+" "+styles.section}>
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>Across the marketplace</p><h2>Every field has its specialists.</h2>
   <p className={styles.sub}>These are editorial sectors to explore. Their presence does not mean AVUQO has a contract with every business in that sector.</p></div>
   <Link href="/categories" className={styles.textLink}>All categories <ArrowRight size={17}/></Link></div>
  <div className={styles.departmentGrid}>{BROWSE_DEPARTMENTS.map((d,index)=><Link className={styles.department} href={departmentHref(d)} key={d.slug}>
   <span className={styles.departmentIcon}>{String(index+1).padStart(2,"0")}</span><h3>{d.name}</h3><p>{d.intro}</p><strong>Discover the category →</strong></Link>)}</div>
 </section>
 <section className={styles.shell+" "+styles.section}>
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>Featured specialist directory</p><h2>Get to know tyre manufacturers.</h2>
   <p className={styles.sub}>AVUQO Tyres already has a dedicated editorial maker directory. It is not a guarantee of authorised live products or a manufacturer&apos;s endorsement.</p></div>
   <Link href="/tyres/brands" className={styles.textLink}>Discover tyre brands <ArrowRight size={17}/></Link></div>
  <div className={styles.steps}><article className={styles.step}><span>01 / MAKERS</span><h3>Manufacturer guides</h3><p>Explore product lines, materials, features and the specifications worth checking before purchase.</p></article>
  <article className={styles.step}><span>02 / SELLERS</span><h3>Retailer profiles</h3><p>Only sellers evidenced by eligible offers appear as active AVUQO shopping partners.</p></article>
  <article className={styles.step}><span>03 / SPECIALISTS</span><h3>Services and expertise</h3><p>Fitting, installations and other service providers will require local coverage and separate approval.</p></article></div>
 </section>
 <Suspense fallback={<section className={styles.shell+" "+styles.section}>Checking verified supplier listings…</section>}><EvidenceDirectory/></Suspense>
 <section className={styles.shell+" "+styles.section}><aside className={styles.notice}><ShieldCheck size={16}/> Editorial information, approved retailer offers and paid placements are different things. Where commercial relationships apply, AVUQO will disclose them. Organic comparisons are not ranked by commission.</aside></section>
 <Footer/></main>;}
