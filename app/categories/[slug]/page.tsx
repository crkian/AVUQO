import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {ArrowRight,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,topicHref} from "../../../lib/categories/browse-tree";
import {marketplaceDepartmentBySlug,departmentJourneys} from "../../../lib/marketplace/journeys";
import styles from "../../marketplace/marketplace.module.css";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return BROWSE_DEPARTMENTS.filter(d=>!d.landing).map(d=>({slug:d.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const department=marketplaceDepartmentBySlug(slug);
 return {title:department?department.name+" | AVUQO Marketplace":"Marketplace category | AVUQO",
  description:department?.intro,robots:{index:false,follow:true}};
}
export default async function DepartmentPage({params}:Props){
 const {slug}=await params;const d=marketplaceDepartmentBySlug(slug);
 if(!d||d.landing)notFound();
 const ways=departmentJourneys(d);
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className={styles.shell}><p className={styles.eyebrow}>AVUQO / THE CATEGORY ATLAS</p>
   <h1>{d.name}.<br/><span>Worth a closer look.</span></h1><p>{d.intro}</p>
   <div className={styles.heroActions}><Link href="#topics" className={styles.primary}>Explore the topics <ArrowRight size={17}/></Link>
    <Link href={ways.compare} className={styles.secondary}>Relevant comparison tools <ArrowRight size={17}/></Link></div>
  </div></section>
  <div className={styles.shell+" "+styles.section}>
   <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/marketplace">Marketplace</Link><span>/</span><Link href="/categories">Categories</Link><span>/</span><span>{d.name}</span></nav>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>Four ways to explore</p>
    <h2>Follow your curiosity.</h2><p className={styles.sub}>Discover useful topics and makers, browse eligible product listings, or compare only where the evidence allows.</p></div></div>
   <div className={styles.journeyGrid}>
    <Link className={styles.journey} href="#topics"><span className={styles.journeyNumber}>01 / EXPLORE</span><h3>Discover</h3><p>Explore the questions and specialisms behind {d.name.toLowerCase()}.</p><strong>Browse topics →</strong></Link>
    <Link className={styles.journey} href={ways.shop}><span className={styles.journeyNumber}>02 / SHOP</span><h3>Find products</h3><p>Search for category-related products, with private imports excluded from public results.</p><strong>Search products →</strong></Link>
    <Link className={styles.journey} href={ways.compare}><span className={styles.journeyNumber}>03 / COMPARE</span><h3>Understand value</h3><p>Use an appropriate specialist comparison or buying guide, not a misleading one-size-fits-all ranking.</p><strong>Compare responsibly →</strong></Link>
    <Link className={styles.journey} href={ways.whosWho}><span className={styles.journeyNumber}>04 / WHO&apos;S WHO</span><h3>Meet the market</h3><p>Browse manufacturers, category specialists and genuinely approved retailers.</p><strong>Explore the directory →</strong></Link>
   </div>
  </div>
  <section id="topics" className={styles.directory}><div className={styles.shell}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>The starting points</p><h2>Explore {d.name.toLowerCase()}.</h2><p className={styles.sub}>Editorial navigation topics are not representations of connected product feeds or available stock.</p></div></div>
   <div className={styles.topicGrid}>{d.topics.map(topic=><Link href={topicHref(topic)} className={styles.topic} key={topic}>{topic}<ArrowRight size={16}/></Link>)}</div>
  </div></section>
  <div className={styles.shell+" "+styles.section}><aside className={styles.notice}><ShieldCheck size={16}/> {d.advice} We only make public retailer or price claims after the underlying source, rights, identity and freshness checks pass.</aside>
   <p style={{marginTop:24}}><Link href="/marketplace" className={styles.textLink}>← All marketplace departments</Link></p>
  </div><Footer/>
 </main>;
}
