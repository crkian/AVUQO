import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, HeartHandshake, ListChecks, Search, ShieldCheck, Sparkles, Eye, Scale, ReceiptText } from "lucide-react";
import { publishedEditorial } from "../lib/content/editorial";
import { lifestylePages } from "../lib/lifestyle/landing-data";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LifestyleExplorer from "../components/lifestyle/LifestyleExplorer";
import ShoppingDepartmentShelf from "../components/shopping/ShoppingDepartmentShelf";
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
    <section className={`${styles.hero} ${moment ? styles.christmasHero : styles.storefrontHero}`} style={moment?undefined:{backgroundImage:`linear-gradient(90deg,rgba(251,247,242,.99),rgba(251,247,242,.93) 37%,rgba(251,247,242,.28) 80%),url("${lifestylePages.home.hero}")`}} aria-labelledby="home-title">
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15}/>{moment ? moment.eyebrow : "Your place for better choices"}</p>
          <h1 id="home-title">{moment ? moment.headline : <>Shop smarter.<br/><em>Find what’s worth it.</em></>}</h1>
          <p className={styles.heroText}>{moment ? moment.summary : editorial.description}</p>
          {!moment&&<div className={styles.storefrontHeroActions}><Link href="/products" className={styles.storefrontPrimary}>Start comparing <ArrowRight size={17}/></Link><Link href="/trust" className={styles.storefrontSecondary}>How AVUQO works</Link></div>}
          {moment && <div className={styles.christmasHeroActions}><Link className={styles.christmasHeroLink} href="/christmas">{moment.actionLabel} <ArrowRight size={17}/></Link><Link className={styles.christmasSecondaryLink} href="/lists">Plan a gift list</Link></div>}
          {moment && <SearchForm/>}
          <nav className={styles.heroShortcuts} aria-label="Quick ways to explore">
            <span>Start with</span>
            <Link href="/sales">Deals &amp; Sales</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/groceries">Groceries</Link>
            <Link href="/travel">Travel</Link>
          </nav>
          <p className={styles.heroAside}>{moment ? "Find what’s worth it this Christmas, without invented deals or pressure." : "Compare carefully, check the evidence, and decide at your own pace."}</p>
          <OwnerStorefrontShortcut/>
        </div>
        <div className={styles.heroVisual}>
          {moment?<>
            <div className={styles.heroArt} style={{backgroundImage:'url("https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1600&q=85")'}} role="img" aria-label="A warmly decorated Christmas living room"/>
            <div className={styles.heroCard}><span className={styles.heroCardIcon}><HeartHandshake size={21}/></span><span><strong>Christmas, thoughtfully</strong><small>Ideas, lists and everyday value.</small></span></div>
          </>:<aside className={styles.heroIntelligence} aria-label="Your AVUQO shopping intelligence">
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
          </aside>}
        </div>
      </div>
    </section>

    {moment ? <>
      <ChristmasHomeFeature moment={moment}/>
      <Suspense fallback={<section className="shell section">Checking festive product evidence…</section>}>
        <ChristmasFestiveFinds/>
      </Suspense>
    </> : <>
    <StorefrontQuickLinks/>
    <HomeShoppingDashboard items={products}/>
    <div className={styles.reassurance}>
      <div className={`shell ${styles.reassuranceInner}`}>
        <span><ShieldCheck size={19}/> Independent thinking</span>
        <span><Scale size={19}/> Compare like with like</span>
        <span><CheckCircle2 size={19}/> No pressure to buy</span>
      </div>
    </div>


    <section className={`shell ${styles.storySection}`} aria-labelledby="why-avuqo">
      <div className={styles.storyHeading}>
        <p className={styles.kicker}>More than a shopfront</p>
        <h2 id="why-avuqo">A little more clarity for life’s purchases.</h2>
        <p>AVUQO brings everyday shopping and useful decision tools into one welcoming place. Browse for inspiration, or settle in and compare the details.</p>
      </div>
      <div className={styles.helpGrid}>
        <article className={styles.helpCard}>
          <span className={styles.helpIcon}><ReceiptText size={25}/></span>
          <p className={styles.kicker}>Plan the weekly shop</p>
          <h3>One list, a clearer picture.</h3>
          <p>Build your supermarket basket, see which prices are available and understand what is still missing.</p>
          <Link href="/groceries">Explore Groceries <ArrowRight size={17}/></Link>
        </article>
        <article className={styles.helpCard}>
          <span className={styles.helpIcon}><Scale size={25}/></span>
          <p className={styles.kicker}>Look beyond the headline</p>
          <h3>See the full cost.</h3>
          <p>Compare mobile, broadband and TV contracts using the figures you enter. Examples are illustrative, not live provider quotes.</p>
          <Link href="/compare">Compare contract costs <ArrowRight size={17}/></Link>
        </article>
        <article className={styles.helpCard}>
          <span className={styles.helpIcon}><ListChecks size={25}/></span>
          <p className={styles.kicker}>Keep plans together</p>
          <h3>Make room for your lists.</h3>
          <p>Collect household ideas, gifts and plans in one place instead of starting from scratch each time.</p>
          <Link href="/lists">Explore Shared Lists <ArrowRight size={17}/></Link>
        </article>
        <article className={styles.helpCard}>
          <span className={styles.helpIcon}><Eye size={25}/></span>
          <p className={styles.kicker}>Stay curious</p>
          <h3>Keep an eye on what matters.</h3>
          <p>Keep a Watch list of products you may want to revisit. Saved records do not mean automatic alerts are running.</p>
          <Link href="/watches">Explore Watches <ArrowRight size={17}/></Link>
        </article>
      </div>
    </section>

    <HomeCampaignCarousel campaigns={campaigns}/>
    <LifestyleExplorer/>
    <ShoppingDepartmentShelf compact/>

    <section className={styles.editorialBand} aria-labelledby="reality-heading">
      <div className={`shell ${styles.editorialGrid}`}>
        <div className={styles.editorialImage} style={{backgroundImage:`url("${lifestylePages.shopping.featureImage}")`}} role="img" aria-label="A warmly lit, thoughtfully arranged shop interior"/>
        <div className={styles.editorialCopy}>
          <p className={styles.kicker}>Worth a second look</p>
          <h2 id="reality-heading">A big sale label isn’t the whole story.</h2>
          <p>Before you decide, consider the real price, product fit, ongoing costs and what the evidence can actually tell you.</p>
          <Link className={styles.softButton} href="/reality-check">Explore Reality Check <ArrowUpRight size={18}/></Link>
        </div>
      </div>
    </section>

    <section className={styles.trustBand}>
      <div className={`shell ${styles.trustInner}`}>
        <div><p className={styles.kicker}>Our promise to you</p><h2>We put your judgement before a commission.</h2></div>
        <div><p>Affiliate relationships can help fund AVUQO. They do not determine our independent scores, organic rankings or basket comparisons.</p><Link href="/trust">How we build trust <ArrowRight size={17}/></Link></div>
      </div>
    </section>
    </>}
    <Footer/>
  </main>;
}

export default function Home() {
  return <Suspense fallback={<main className={styles.page}><Header/><HeroPlaceholder/></main>}><HomeContent/></Suspense>;
}
