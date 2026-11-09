import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,Compass,Store,Scale,Users,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,departmentHref} from "../../lib/categories/browse-tree";
import {MARKETPLACE_JOURNEYS,summarizeMarketCategories} from "../../lib/marketplace/journeys";
import styles from "./marketplace.module.css";

export const metadata:Metadata={
 title:"AVUQO Marketplace | Explore, Shop, Compare and Who's Who",
 description:"Discover 25 AVUQO departments, shop verified retailer offers, compare the real costs and explore the brands and businesses behind your choices.",
 alternates:{canonical:"/marketplace"}
};
const icons=[Compass,Store,Scale,Users];
export default function Marketplace(){
 const {departments,topics}=summarizeMarketCategories();
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className={styles.shell+" "+styles.heroGrid}>
   <div><p className={styles.eyebrow}>AVUQO / THE MARKETPLACE</p>
    <h1>Everything worth exploring.<br/><span>One place to choose.</span></h1>
    <p>Discover the categories, get to know the makers, shop eligible retailer offers or compare like-for-like. The journey is yours; the evidence stays clear.</p>
    <div className={styles.heroActions}>
     <Link href="#marketplace-journeys" className={styles.primary}>Choose your journey <ArrowRight size={17}/></Link>
     <Link href="/whos-who" className={styles.secondary}>Discover Who&apos;s Who <ArrowRight size={17}/></Link>
    </div>
   </div>
   <div className={styles.orbit} aria-hidden="true"><span className={styles.orbitCore}>Q</span><span className={styles.orbitLabel}>EXPLORE</span><span className={styles.orbitLabel}>SHOP</span><span className={styles.orbitLabel}>COMPARE</span><span className={styles.orbitLabel}>WHO&apos;S WHO</span></div>
  </div></section>
  <section id="marketplace-journeys" className={styles.shell+" "+styles.section}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>Four ways to make a good choice</p>
    <h2>Look around. Find your fit.</h2><p className={styles.sub}>You don&apos;t have to compare prices to enjoy the marketplace. Explore at your own pace, with genuine product and retailer data clearly distinguished from guides.</p></div></div>
   <div className={styles.journeyGrid}>{MARKETPLACE_JOURNEYS.map((journey,i)=>{
    const Icon=icons[i];
    return <Link key={journey.id} href={journey.href} className={styles.journey}>
     <span className={styles.journeyNumber}>0{i+1} / {journey.name.toUpperCase()}</span><span className={styles.journeyIcon}><Icon size={27}/></span>
     <h3>{journey.name}</h3><p>{journey.description}</p><strong>Open {journey.name} →</strong>
    </Link>;
   })}</div>
  </section>
  <section className={styles.directory}><div className={styles.shell}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>The category atlas</p>
    <h2>{departments} worlds to explore.</h2><p className={styles.sub}>{topics} curated starting topics across products, services, life, travel, groceries, motoring and more. Editorial categories are not claims of live stock.</p></div>
    <Link href="/categories" className={styles.textLink}>Full category directory <ArrowRight size={17}/></Link></div>
   <div className={styles.departmentGrid}>{BROWSE_DEPARTMENTS.map((department,index)=><Link key={department.slug} href={departmentHref(department)} className={styles.department}>
    <span className={styles.departmentIcon}>{String(index+1).padStart(2,"0")}</span><h3>{department.name}</h3>
    <p>{department.intro}</p><strong>Explore {department.topics.length} starting topics →</strong></Link>)}</div>
  </div></section>
  <section className={styles.shell+" "+styles.section}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>One coherent experience</p>
    <h2>Browse beautifully. Decide clearly.</h2></div></div>
   <div className={styles.steps}>
    <article className={styles.step}><span>01 / DISCOVER</span><h3>Get to know the category</h3><p>Discover makers, specialist retailers, products and practical context without being forced into a comparison.</p></article>
    <article className={styles.step}><span>02 / VERIFY</span><h3>Understand the evidence</h3><p>Technical variants, availability, permissions and retailer terms matter more than a flashy price tag.</p></article>
    <article className={styles.step}><span>03 / CHOOSE</span><h3>Pick your preferred path</h3><p>Browse verified products, check a trustworthy like-for-like comparison or return to a saved list.</p></article>
   </div>
   <div style={{height:26}}/>
   <div className={styles.softBand}><div><p className={styles.kicker} style={{color:"#edbed9"}}>A marketplace with a conscience</p>
    <h2>Real comparisons. No invented offers.</h2><p>Our private imports and unapproved supplier images stay behind the Control Centre. A network partnership, brand mention or example photograph is never presented as a live merchant offer.</p></div>
    <Link href="/trust">How AVUQO builds trust <ShieldCheck size={17}/></Link></div>
  </section>
  <Footer/>
 </main>;
}
