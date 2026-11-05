import { Suspense, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, ReceiptText, Search, ShieldCheck, Sparkles } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { type Landing } from "../../lib/lifestyle/landing-data";
import {storyFor,storySearchHref} from "../../lib/lifestyle/category-story";
import CategoryMoments from "./CategoryMoments";
import CategoryVerifiedShelf from "./CategoryVerifiedShelf";
import styles from "./LifestyleLanding.module.css";

const photo = (image: string): CSSProperties => ({backgroundImage:`url("${image}")`});
export default function LifestyleLanding({config,afterTrust}: {config:Landing;afterTrust?:ReactNode}) {
  const story=storyFor(config.slug);
  const theme = {"--accent":config.accent} as CSSProperties;
  return <main className={styles.page} style={theme} data-category={config.slug}>
    <Header />
    <section className={styles.hero} aria-labelledby="lifestyle-title">
      <div className={styles.heroPhoto} style={{...photo(config.hero),backgroundPosition:config.heroPosition??"center"}} aria-hidden="true"/>
      <div className={styles.heroWash} aria-hidden="true"/>
      <div className={`shell ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15}/>{story?.identity??config.eyebrow}</p>
          <h1 id="lifestyle-title">{config.headline}<span>{config.highlight}</span></h1>
          {story&&<p className={styles.categoryPromise}>{story.strapline}</p>}
          <p>{config.intro}</p>
          <div className={styles.heroActions}>
            <Link href="#explore" className={styles.cta}>Explore {config.slug==="home"?"Home & Living":config.slug==="tech"?"Tech":config.slug==="beauty"?"Beauty":config.slug} <ArrowRight size={18}/></Link>
            <Link href="/trust" className={styles.secondary}>How AVUQO compares <ArrowRight size={16}/></Link>
          </div>
          <p className={styles.heroEvidence}><ShieldCheck size={17} aria-hidden="true"/> Verified prices and offers are displayed only when reliable, authorised evidence exists.</p>
        </div>
      </div>
    </section>
    <nav className={`shell ${styles.quickCategories}`} aria-label={`Explore ${config.slug} topics`}>
      {config.tiles.map(tile=><Link href={`/search?q=${encodeURIComponent(tile.search)}`} key={tile.title} className={styles.quickCategory}>
        <span className={styles.quickPhoto} style={photo(tile.image)} aria-hidden="true"/>
        <span>{tile.title}</span>
      </Link>)}
    </nav>
    <div className={styles.trustWrap}>
      <div className={`shell ${styles.trustBar}`}>
        <div><ShieldCheck size={22}/><span><strong>Trust-first discovery</strong><small>Source quality matters</small></span></div>
        <div><ReceiptText size={22}/><span><strong>Total-cost thinking</strong><small>Look beyond the headline</small></span></div>
        <div><Heart size={22}/><span><strong>Find your fit</strong><small>Choose what suits you</small></span></div>
        <div><CheckCircle2 size={22}/><span><strong>Clear next steps</strong><small>Verify with the retailer</small></span></div>
      </div>
    </div>
    {afterTrust}
    
    <section className={`shell ${styles.section}`} id="explore">
      <div className={styles.sectionHeading}>
        <div><p className={styles.kicker}>Explore the possibilities</p><h2>{story?.browseLabel??"Find what matters to you."}</h2><p>Browse this category, then search for eligible products and independent guidance. Some searches may not yet have verified matches.</p></div>
        <Link href="/categories">All categories <ArrowRight size={17}/></Link>
      </div>
      <div className={styles.tileGrid}>
        {config.tiles.slice(0,4).map(tile=><Link className={styles.tile} key={tile.title} href={`/search?q=${encodeURIComponent(tile.search)}`}>
          <div className={styles.tilePhoto} style={photo(tile.image)} aria-hidden="true"/>
          <div className={styles.tileBody}><h3>{tile.title}</h3><p>{tile.copy}</p><ArrowRight size={19} aria-hidden="true"/></div>
        </Link>)}
      </div>
      <p className={styles.editorialNote}>Lifestyle photographs illustrate categories and are not representations of specific listed products. Search results are still evolving as retailer sources are verified.</p>
    </section>

    <section className={`shell ${styles.guidanceSection}`} aria-labelledby={`guidance-title-${config.slug}`}>
      <div className={styles.guidanceHeading}><h2 id={`guidance-title-${config.slug}`}>Shop smarter in {config.slug==="tech"?"tech":config.slug}.</h2></div>
      <div className={styles.guidanceGrid}>
        {config.tips.map((tip,i)=><article key={tip.title} className={styles.guidanceCard}>
          <span className={styles.guidanceSymbol}>{i===0?<ReceiptText size={25}/>:i===1?<ShieldCheck size={25}/>:<Heart size={25}/>}</span>
          <div><h3>{tip.title}</h3><p>{tip.copy}</p></div>
        </article>)}
        <article className={styles.guidanceCard}><span className={styles.guidanceSymbol}><CheckCircle2 size={25}/></span>
          <div><h3>Make it yours</h3><p>{story?.focus??"Choose the details that matter, then check the current evidence."}</p></div></article>
      </div>
    </section>
    <Suspense fallback={<section className="shell section">Checking approved product evidence…</section>}>
      <CategoryVerifiedShelf config={config}/>
    </Suspense>
    {story&&!["tech","home","beauty"].includes(config.slug)&&<CategoryMoments story={story} images={config.tiles.map(tile=>tile.image)}/>}
    {!["tech","home","beauty"].includes(config.slug)&&<section className={styles.feature}>
      <div className={`shell ${styles.featureInner}`}>
        <div className={styles.featureText}>
          <p className={styles.kicker}>Worth considering</p><h2>{config.featureTitle}</h2>
          <p>{config.featureCopy}</p>
          <Link href="/reality-check" className={styles.textLink}>Reality-check a claim <ArrowRight size={17}/></Link>
        </div>
        <div className={styles.featurePhoto} style={photo(config.featureImage)} aria-hidden="true"/>
      </div>
    </section>}
    <section className={`shell ${styles.searchWrap}`}>
      <div className={styles.searchPanel}><div><p className={styles.kicker}>Find what&apos;s worth it</p><h2>Know what you&apos;re looking for?</h2><p>Search AVUQO and refine your choices. Listings and offers are only live when independently validated.</p></div>
        <form action="/search" method="get" className={styles.searchForm}><Search size={20}/><input name="q" aria-label="Search AVUQO" placeholder={story?.searchPlaceholder??`Search ${config.slug} ideas…`} list={`category-suggestions-${config.slug}`} maxLength={120} required/>
          {story&&<datalist id={`category-suggestions-${config.slug}`}>{story.moments.map(m=><option key={m.title} value={m.query}/>)}</datalist>}<button type="submit">Search</button></form>
        {story&&<nav aria-label={`Suggested ${config.slug} searches`} className={styles.suggestedSearches}>
          <span>Popular ways to explore</span>
          {story.moments.map(item=><Link key={item.title} href={storySearchHref(item.query)}>{item.title}<ArrowRight size={14}/></Link>)}
        </nav>}
      </div>
    </section>
    <Footer />
  </main>;
}
