import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {ArrowRight,CheckCircle2} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {tyreCollections} from "../../../../lib/tyres/catalogue";
import styles from "../../tyres.module.css";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return tyreCollections.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const category=tyreCollections.find(c=>c.slug===slug);
 return {title:category?category.title+" | AVUQO tyre guide":"Tyre category | AVUQO",
  description:category?category.description:undefined,robots:{index:false,follow:true}};
}
export default async function Category({params}:Props){
 const {slug}=await params;const category=tyreCollections.find(c=>c.slug===slug);
 if(!category)notFound();
 const index=tyreCollections.findIndex(x=>x.slug===slug)+1;
 return <main className={styles.page}><Header/>
  <section className={styles.categoryHero}><div className={styles.heroTexture}/>
   <div className={styles.shell+" "+styles.categoryHeroInner}>
    <div><p className={styles.studioEyebrow}><span className={styles.eyebrowDash}/> TYRE COLLECTION / {String(index).padStart(2,"0")}</p>
     <h1>{category.title}<br/><span>Know the difference.</span></h1>
     <p>{category.description}</p>
     <Link className={styles.premiumButton} href="/tyres/sizes">Understand tyre sizes <ArrowRight size={18}/></Link>
     <Link className={styles.lightButton} href="/tyres/find">Browse eligible variants <ArrowRight size={18}/></Link>
    </div>
    <div className={styles.categoryHalo} aria-hidden="true"><span>{String(index).padStart(2,"0")}</span></div>
   </div>
  </section>
  <div className={styles.shell+" "+styles.main}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/tyres">Tyres</Link><span>/</span>{category.title}</nav>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>THE DETAILS / BEFORE YOU CHOOSE</p>
     <h2>A useful guide.<br/><span className={styles.softHeading}>Not a guess at fitment.</span></h2>
     <p className={styles.sub}>Tyre names and types can overlap. We only categorise exact products when the manufacturer or an authorised source provides reliable evidence.</p></div></div>
    <div className={styles.infoGrid}>
     <article className={styles.info}><CheckCircle2 size={25}/><b>Match your vehicle</b><p>Confirm the approved size, load index, speed rating and vehicle-specific requirements before shopping.</p></article>
     <article className={styles.info}><CheckCircle2 size={25}/><b>Verify this tyre type</b><p>{category.readiness}. Never infer a winter, run-flat, reinforced or commercial-vehicle specification from a marketing name.</p></article>
     <article className={styles.info}><CheckCircle2 size={25}/><b>Compare like-for-like</b><p>Review the exact model, current availability, suitable installation and all fitting or delivery charges.</p></article>
    </div>
   </section>
   <section className={styles.storySection}>
    <div className={styles.storyMark}><span>THE DETAIL MATTERS</span><strong>RIGHT<span>.</span> FIT</strong><div className={styles.numberExplainer}><span>SIZE</span><span>RATING</span><span>TYPE</span></div></div>
    <div className={styles.storyCopy}><p className={styles.kicker}>PROPERLY CONSIDERED</p><h2>Every detail.<br/><em>Before every deal.</em></h2><p>AVUQO now has a verified-variant product finder, exact single-tyre pages and technical model comparisons. Only source-cleared real products can appear in them.</p>
     <Link className={styles.darkButton} href="/tyres/find">Find eligible tyre models <ArrowRight size={17}/></Link></div>
   </section>
   <aside className={styles.notice}><strong>Current availability:</strong> This is an editorial buying guide. No historical or unapproved Tyres UK supplier product is published here. No live tyre offer or vehicle compatibility result is implied.</aside>
  </div><Footer/></main>;
}