import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, HeartHandshake, ListChecks, Search, ShieldCheck, Sparkles, Eye, Scale, ReceiptText } from "lucide-react";
import { publishedEditorial } from "../lib/content/editorial";
import { lifestylePages } from "../lib/lifestyle/landing-data";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LifestyleExplorer from "../components/lifestyle/LifestyleExplorer";
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
  const editorial = await publishedEditorial("home");
  return <main className={styles.page}>
    <Header/>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15}/> Your place for better choices</p>
          <h1 id="home-title">{editorial.headline}</h1>
          <p className={styles.heroText}>{editorial.description}</p>
          <SearchForm/>
          <p className={styles.heroAside}>Look around, compare carefully, and decide at your own pace.</p>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroArt} style={{backgroundImage:`url("${lifestylePages.home.hero}")`}} role="img" aria-label="A welcoming, sunlit living room"/>
          <div className={styles.heroCard}>
            <span className={styles.heroCardIcon}><HeartHandshake size={21}/></span>
            <span><strong>Good choices begin here</strong><small>Clear thinking, everyday value.</small></span>
          </div>
        </div>
      </div>
    </section>

    <div className={styles.reassurance}>
      <div className={`shell ${styles.reassuranceInner}`}>
        <span><ShieldCheck size={19}/> Independent thinking</span>
        <span><Scale size={19}/> Compare like with like</span>
        <span><CheckCircle2 size={19}/> No pressure to buy</span>
      </div>
    </div>

    <LifestyleExplorer/>

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
          <p>Explore AVUQO Watches and the price-tracking tools available in your account.</p>
          <Link href="/watches">Explore Watches <ArrowRight size={17}/></Link>
        </article>
      </div>
    </section>

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

    <section className={`shell ${styles.seasonSection}`} aria-labelledby="season-heading">
      <div className={styles.seasonHeading}>
        <p className={styles.kicker}>Little corners to explore</p>
        <h2 id="season-heading">Something for every season of life.</h2>
      </div>
      <div className={styles.seasonGrid}>
        <Link className={`${styles.seasonCard} ${styles.petsCard}`} href="/pets">
          <div><p>For the animals in our lives</p><h3>Care for your companions.</h3><span>Explore Pets <ArrowRight size={17}/></span></div>
          <img src="/illustrations/avuqo-pets-care.svg" alt="" loading="lazy"/>
        </Link>
        <Link className={`${styles.seasonCard} ${styles.christmasCard}`} href="/christmas">
          <div><p>Thoughtful festive planning</p><h3>Make the season feel special.</h3><span>Explore Christmas <ArrowRight size={17}/></span></div>
          <img src="/illustrations/avuqo-christmas-gifts.svg" alt="" loading="lazy"/>
        </Link>
      </div>
    </section>

    <section className={styles.trustBand}>
      <div className={`shell ${styles.trustInner}`}>
        <div><p className={styles.kicker}>Our promise to you</p><h2>We put your judgement before a commission.</h2></div>
        <div><p>Affiliate relationships can help fund AVUQO. They do not determine our independent scores, organic rankings or basket comparisons.</p><Link href="/trust">How we build trust <ArrowRight size={17}/></Link></div>
      </div>
    </section>
    <Footer/>
  </main>;
}

export default function Home() {
  return <Suspense fallback={<main className={styles.page}><Header/><HeroPlaceholder/></main>}><HomeContent/></Suspense>;
}
