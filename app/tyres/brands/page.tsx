import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,ArrowUpRight} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import TyreWheelVisual from "../TyreWheelVisual";
import {tyreBrandNames,tyreBrandSlug} from "../../../lib/tyres/catalogue";
import styles from "../tyres.module.css";

export const metadata:Metadata={
 title:"Explore tyre manufacturers | AVUQO",
 description:"Browse tyre makers and learn what matters when choosing an exact tyre size and model.",
 robots:{index:false,follow:true}
};
export default function Brands(){
 return <main className={styles.page}><Header/>
  <section className={styles.studioHero}><div className={styles.heroTexture} aria-hidden="true"/>
   <div className={styles.shell+" "+styles.studioGrid}>
    <div className={styles.studioCopy}><p className={styles.studioEyebrow}><span className={styles.eyebrowDash}/> THE MAKERS / AVUQO TYRES</p>
     <h1>Every brand.<br/><span>A better way</span><br/>to explore.</h1>
     <p className={styles.studioLead}>Discover the names behind the tyres. Then look deeper: model, dimensions, safety ratings and the full fitted cost are what make a choice right for you.</p>
     <div className={styles.heroActions}><Link className={styles.premiumButton} href="/tyres">Back to tyre showroom <ArrowRight size={17}/></Link></div>
    </div>
    <div className={styles.visualStage}><div className={styles.visualHalo}/><TyreWheelVisual small/></div>
   </div>
  </section>
  <div className={styles.shell+" "+styles.main}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/tyres">Tyres</Link><span>/</span><span>Manufacturers</span></nav>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>THE MANUFACTURER DIRECTORY</p><h2>Find your familiar name.<br/><span className={styles.softHeading}>Then explore the detail.</span></h2>
     <p className={styles.sub}>This alphabetical guide is educational. Manufacturer names do not imply an endorsement, tyre availability, verified prices or authorised commercial listings.</p>
    </div></div>
    <div className={styles.featuredBrands}>{tyreBrandNames.map((name,i)=><Link className={styles.featuredBrand} key={name} href={"/tyres/brands/"+tyreBrandSlug(name)}>
     <span className={styles.brandSerial}>{String(i+1).padStart(2,"0")}</span><span>{name}</span><ArrowUpRight size={19}/>
    </Link>)}</div>
   </section>
   <section className={styles.storySection}>
    <div className={styles.storyMark}><span>BRAND IS ONLY THE BEGINNING</span><strong>FIT<span>.</span> FIRST</strong><div className={styles.numberExplainer}><span>SIZE</span><span>LOAD</span><span>SPEED</span></div></div>
    <div className={styles.storyCopy}><p className={styles.kicker}>WHAT REALLY MATTERS</p><h2>Same badge.<br/><em>Different tyres.</em></h2>
     <p>Manufacturers offer many models and versions. Even within a model range, different sizes, load ratings and constructions can require different checks. Start with the exact vehicle-approved specification.</p>
     <Link className={styles.darkButton} href="/tyres/sizes">Understand tyre sizes <ArrowRight size={17}/></Link>
    </div>
   </section>
   <aside className={styles.notice}><strong>Publication status:</strong> AVUQO tyre manufacturer pages are informational guides. Individual live products will only appear after retailer permissions, technical suitability information, current offer evidence and full costs have been verified.</aside>
  </div><Footer/></main>;
}