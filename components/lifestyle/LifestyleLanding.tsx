import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, ReceiptText, Search, ShieldCheck, Sparkles } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { type Landing } from "../../lib/lifestyle/landing-data";
import styles from "./LifestyleLanding.module.css";

const photo = (image: string): CSSProperties => ({backgroundImage:`url("${image}")`});
const links = [
  {href:"/shopping",label:"Shopping"},{href:"/groceries",label:"Groceries"},{href:"/travel",label:"Travel"},
  {href:"/home",label:"Home"},{href:"/tech",label:"Tech"},
  {href:"/beauty",label:"Beauty"},{href:"/gifts",label:"Gifts"},
  {href:"/toys",label:"Toys"},{href:"/pets",label:"Pets"},
  {href:"/christmas",label:"Christmas"}
];
export default function LifestyleLanding({config}: {config:Landing}) {
  const theme = {"--accent":config.accent} as CSSProperties;
  return <main className={styles.page} style={theme}>
    <Header />
    <nav className={styles.subnav} aria-label="Explore shopping categories">
      <div className={`shell ${styles.subnavLinks}`}>{links.map(item=>
        <Link key={item.href} href={item.href} aria-current={item.href===`/${config.slug}`?"page":undefined}>{item.label}</Link>
      )}<Link href="/categories">More categories <ArrowRight size={13}/></Link></div>
    </nav>
    <section className={styles.hero} aria-labelledby="lifestyle-title">
      <div className={styles.heroPhoto} style={{...photo(config.hero),backgroundPosition:config.heroPosition??"center"}} aria-hidden="true"/>
      <div className={styles.heroWash} aria-hidden="true"/>
      <div className={`shell ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15}/>{config.eyebrow}</p>
          <h1 id="lifestyle-title">{config.headline}<span>{config.highlight}</span></h1>
          <p>{config.intro}</p>
          <div className={styles.heroActions}>
            <Link href="#explore" className={styles.cta}>Explore {config.slug==="home"?"home ideas":config.slug} <ArrowRight size={18}/></Link>
            <Link href="/lists" className={styles.secondary}>Create a shortlist</Link>
          </div>
        </div>
      </div>
    </section>
    <div className={styles.trustWrap}>
      <div className={`shell ${styles.trustBar}`}>
        <div><ShieldCheck size={22}/><span><strong>Trust-first discovery</strong><small>Source quality matters</small></span></div>
        <div><ReceiptText size={22}/><span><strong>Total-cost thinking</strong><small>Look beyond the headline</small></span></div>
        <div><Heart size={22}/><span><strong>Find your fit</strong><small>Choose what suits you</small></span></div>
        <div><CheckCircle2 size={22}/><span><strong>Clear next steps</strong><small>Verify with the retailer</small></span></div>
      </div>
    </div>
    <section className={`shell ${styles.section}`} id="explore">
      <div className={styles.sectionHeading}>
        <div><p className={styles.kicker}>Explore the possibilities</p><h2>Find what matters to you.</h2><p>Browse inspiration and use AVUQO search to explore the right category for your needs.</p></div>
        <Link href="/categories">All categories <ArrowRight size={17}/></Link>
      </div>
      <div className={styles.tileGrid}>
        {config.tiles.map(tile=><Link className={styles.tile} key={tile.title} href={`/search?q=${encodeURIComponent(tile.search)}`}>
          <div className={styles.tilePhoto} style={photo(tile.image)} aria-hidden="true"/>
          <div className={styles.tileBody}><h3>{tile.title}</h3><p>{tile.copy}</p><ArrowRight size={19} aria-hidden="true"/></div>
        </Link>)}
      </div>
      <p className={styles.editorialNote}>Lifestyle photographs illustrate categories and are not representations of specific listed products. Search results are still evolving as retailer sources are verified.</p>
    </section>
    <section className={styles.feature}>
      <div className={`shell ${styles.featureInner}`}>
        <div className={styles.featureText}>
          <p className={styles.kicker}>Worth considering</p><h2>{config.featureTitle}</h2>
          <p>{config.featureCopy}</p>
          <Link href="/reality-check" className={styles.textLink}>Reality-check a claim <ArrowRight size={17}/></Link>
        </div>
        <div className={styles.featurePhoto} style={photo(config.featureImage)} aria-hidden="true"/>
      </div>
    </section>
    <section className={`shell ${styles.section}`}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>A better buying checklist</p><h2>See past the price tag.</h2></div></div>
      <div className={styles.tipGrid}>{config.tips.map((tip,i)=><article key={tip.title} className={styles.tip}><span>{String(i+1).padStart(2,"0")}</span><h3>{tip.title}</h3><p>{tip.copy}</p></article>)}</div>
    </section>
    <section className={`shell ${styles.searchWrap}`}>
      <div className={styles.searchPanel}><div><p className={styles.kicker}>Find what&apos;s worth it</p><h2>Know what you&apos;re looking for?</h2><p>Search AVUQO and refine your choices. Listings and offers are only live when independently validated.</p></div>
        <form action="/search" method="get" className={styles.searchForm}><Search size={20}/><input name="q" aria-label="Search AVUQO" placeholder={`Search ${config.slug} ideas…`} required/><button type="submit">Search</button></form>
      </div>
    </section>
    <Footer />
  </main>;
}
