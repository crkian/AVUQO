import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight, Search, ShieldCheck, Sparkles} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import LiveDealRail from "../../components/live/LiveDealRail";
import {lifestylePages} from "../../lib/lifestyle/landing-data";
import {activeHomeSeasonalMoment} from "../../lib/marketing/seasonal-calendar";
import styles from "./page.module.css";

export const metadata:Metadata={
  title:"Discover worthwhile choices | AVUQO",
  description:"Explore thoughtful shopping, seasonal guidance and approved retailer offers with AVUQO.",
  alternates:{canonical:"/discover"},
};

const discoveries=[
 {title:"Verified products",copy:"Look at exact models and eligible retailer offers.",href:"/products",image:lifestylePages.tech.tiles[0].image,tag:"The product collection"},
 {title:"Home & living",copy:"Thoughtful comforts, useful upgrades and the details.",href:"/home",image:lifestylePages.home.hero,tag:"Make room for better"},
 {title:"Technology",copy:"Devices that earn their place in everyday life.",href:"/tech",image:lifestylePages.tech.hero,tag:"Useful technology"},
 {title:"Gifts",copy:"Good ideas for the people who matter.",href:"/gifts",image:lifestylePages.gifts.hero,tag:"Thoughtful giving"},
 {title:"Beauty & care",copy:"Find routines and products worth considering.",href:"/beauty",image:lifestylePages.beauty.hero,tag:"Feel good"},
 {title:"Groceries",copy:"Build a basket and understand price coverage.",href:"/groceries",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=850&q=80",tag:"Plan the weekly shop"},
 {title:"Travel",copy:"Plan journeys with the whole cost in mind.",href:"/travel",image:lifestylePages.travel.hero,tag:"Beyond the everyday"},
 {title:"Fashion",copy:"Find what fits and think about cost per wear.",href:"/fashion",image:lifestylePages.fashion.hero,tag:"Thoughtful style"},
] as const;

async function DiscoverContent(){
  await connection();
  const christmas=activeHomeSeasonalMoment();
  return <>
    <section className={styles.hero} aria-labelledby="discover-heading">
      <div className="shell">
        <p className={styles.kicker}><Sparkles size={15} aria-hidden="true"/> Welcome to AVUQO Discover</p>
        <h1 id="discover-heading">There&apos;s more to <em>worth it.</em></h1>
        <p>Explore ideas for your home, gifts, technology, groceries and everyday life. Find clarity before the next decision.</p>
        <form className={styles.search} action="/search" method="get" role="search">
          <Search size={19} aria-hidden="true"/>
          <input name="q" type="search" maxLength={120} aria-label="Search AVUQO" placeholder="Search things you'd like to explore" required/>
          <button type="submit">Find value <ArrowRight size={17}/></button>
        </form>
        {christmas&&<Link className={styles.seasonLink} href="/christmas">{christmas.actionLabel} <ArrowRight size={16}/></Link>}
      </div>
    </section>
    <section className={`shell ${styles.section}`} aria-labelledby="discovery-worlds">
      <div className={styles.heading}>
        <div><p className={styles.kicker}>Shopping worlds</p><h2 id="discovery-worlds">Start somewhere lovely.</h2>
          <p>These are inspiration and category guides, not claims that any featured photograph depicts a verified offer.</p>
        </div>
        <Link href="/categories">All categories <ArrowRight size={17}/></Link>
      </div>
      <div className={styles.discoveryGrid}>
        {discoveries.map((item,index)=><Link key={item.href} href={item.href} className={styles.discoveryCard} data-large={index<2?"true":undefined}>
          <div className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
          <div className={styles.discoveryCopy}><p>{item.tag}</p><h3>{item.title}</h3><span>{item.copy}</span><strong>Explore <ArrowRight size={16}/></strong></div>
        </Link>)}
      </div>
    </section>
    <section className={styles.offerBand} aria-labelledby="verified-offers">
      <div className="shell">
        <div className={styles.heading}>
          <div><p className={styles.kicker}><ShieldCheck size={16} aria-hidden="true"/> Only current eligible records</p>
            <h2 id="verified-offers">A closer look at available offers.</h2>
            <p>These records have passed the public publishing gates. Their images, prices and eligibility can change, so always recheck retailer terms.</p>
          </div>
          <Link href="/live">All eligible offers <ArrowRight size={17}/></Link>
        </div>
        <Suspense fallback={<p className={styles.loading}>Checking current offer evidence…</p>}><LiveDealRail limit={6}/></Suspense>
        <p className={styles.provenance}>No example prices, unpublished merchant feeds or unapproved affiliate offers are used as live deals. <Link href="/trust">How AVUQO builds trust</Link>.</p>
      </div>
    </section>
  </>;
}

export default function DiscoverPage(){
  return <main className={styles.page}>
    <Header/>
    <Suspense fallback={<section className="shell section">Exploring AVUQO&apos;s shopping worlds…</section>}>
      <DiscoverContent/>
    </Suspense>
    <Footer/>
  </main>;
}
