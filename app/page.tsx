import { Suspense, type CSSProperties } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CirclePlay, Search, ShieldCheck, Sparkles, Scale } from "lucide-react";
import { publishedEditorial } from "../lib/content/editorial";
import { lifestylePages } from "../lib/lifestyle/landing-data";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HomeCampaignCarousel from "../components/home/HomeCampaignCarousel";
import OwnerStorefrontShortcut from "../components/home/OwnerStorefrontShortcut";
import {loadHomeCampaigns} from "../lib/marketing/homepage";
import { activeHomeSeasonalMoment } from "../lib/marketing/seasonal-calendar";
import ChristmasHomeFeature from "../components/home/ChristmasHomeFeature";
import ChristmasFestiveFinds from "../components/home/ChristmasFestiveFinds";
import StorefrontQuickLinks from "../components/home/StorefrontQuickLinks";
import HomeShoppingDashboard from "../components/home/HomeShoppingDashboard";
import {verifiedProductIndex} from "../lib/products/public-catalog";
import styles from "./homepage-warm.module.css";

export const metadata: Metadata = {
  title: "AVUQO | Find what's worth it",
  description: "A welcoming home for smarter shopping, grocery lists, everyday comparisons, helpful watches and more considered decisions.",
};

function SearchForm() {
  return <form className={styles.search} action="/search" method="get" role="search">
    <Search size={21} aria-hidden="true"/>
    <input type="search" name="q" placeholder="What would you like to explore?" aria-label="Search AVUQO" required/>
    <button type="submit">Find value <ArrowRight size={17}/></button>
  </form>;
}

function HeroPlaceholder() {
  return <section className={styles.hero}>
    <div className={`shell ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Welcome to AVUQO</p>
        <h1>Find what’s worth it.</h1>
        <p className={styles.heroText}>A more thoughtful way to explore shopping, groceries, travel and everyday decisions.</p>
        <SearchForm/>
      </div>
      <div className={styles.heroArt} style={{backgroundImage:`url("${lifestylePages.home.hero}")`}} aria-hidden="true"/>
    </div>
  </section>;
}

async function HomeContent() {
  await connection();
  const moment = activeHomeSeasonalMoment();
  const [editorial,campaigns,products] = await Promise.all([publishedEditorial("home"),loadHomeCampaigns(),verifiedProductIndex(8)]);
  return <main className={styles.page}>
    <Header/>
    <section className={`${styles.hero} ${styles.storefrontHero}`} style={{"--storefront-photo": `url("${lifestylePages.home.hero}")`} as CSSProperties} aria-labelledby="home-title">
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15}/>{moment ? moment.eyebrow : "Your place for better choices"}</p>
          <h1 id="home-title">Shop smarter.<br/><em>Find what’s worth it.</em></h1>
          <p className={styles.heroText}>{moment ? moment.summary : editorial.description}</p>
          <div className={styles.storefrontHeroActions}><Link href="/products" className={styles.storefrontPrimary}>Start comparing <ArrowRight size={17}/></Link><Link href="/trust" className={styles.storefrontSecondary}><CirclePlay size={17} aria-hidden="true"/> How AVUQO works</Link></div>
          {moment&&<Link href="/christmas" className={styles.seasonalNudge}>Christmas is on its way. {moment.actionLabel} <ArrowRight size={15}/></Link>}

          <OwnerStorefrontShortcut/>
        </div>
        <div className={styles.heroVisual}>
          <aside className={styles.heroIntelligence} aria-label="Your AVUQO shopping intelligence">
            <h2>Your Shopping Intelligence</h2>
            <div className={styles.heroIntelligenceInner}>
              <span className={styles.intelligenceRing}><ShieldCheck size={38}/><small>Evidence<br/>first</small></span>
              <ul>
                <li><CheckCircle2 size={18}/>Only eligible price evidence</li>
                <li><CheckCircle2 size={18}/>Real retailer context</li>
                <li><CheckCircle2 size={18}/>Total cost, not just headlines</li>
                <li><CheckCircle2 size={18}/>Independent buying guidance</li>
              </ul>
            </div>
            <Link href="/products">Explore product comparisons <ArrowRight size={17}/></Link>
          </aside>
        </div>
      </div>
    </section>

    {/* The storefront structure stays the same all year; only approved seasonal content changes. */}
    <StorefrontQuickLinks/>
    <HomeShoppingDashboard items={products}/>
    {moment?.stage==="early"&&<section className={styles.christmasBuildUp} aria-label="Christmas build-up">
      <div className="shell">
        <div><p className={styles.kicker}>Christmas is coming</p><h2>Start with thoughtful ideas.</h2>
          <p>Save gift inspiration and plan the little things, without the rush or invented seasonal deals.</p></div>
        <Link href="/christmas">Explore Christmas inspiration <ArrowRight size={18}/></Link>
      </div>
    </section>}
    {moment&&moment.stage!=="early"&&<ChristmasHomeFeature moment={moment}/>}
    {moment?.stage==="near"&&<Suspense fallback={<section className="shell section">Checking festive product evidence…</section>}>
      <ChristmasFestiveFinds/>
    </Suspense>}
    <div className={styles.reassurance}>
      <div className={`shell ${styles.reassuranceInner}`}>
        <span><ShieldCheck size={19}/> Independent thinking</span>
        <span><Scale size={19}/> Compare like with like</span>
        <span><CheckCircle2 size={19}/> No pressure to buy</span>
      </div>
    </div>


    <HomeCampaignCarousel campaigns={campaigns}/>
    <Footer/>
  </main>;
}

export default function Home() {
  return <Suspense fallback={<main className={styles.page}><Header/><HeroPlaceholder/></main>}><HomeContent/></Suspense>;
}
