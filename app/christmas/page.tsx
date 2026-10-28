import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, Heart, ShoppingBag, Sparkles, Truck } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import GiftFinder from "./GiftFinder";
import PublishedChristmasCrafts from "./PublishedChristmasCrafts";
import { Suspense } from "react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Christmas 2026 | Gift ideas and festive value",
  description: "Plan a more thoughtful Christmas with AVUQO's gift ideas, crafts and festive shopping guides. Compare total costs and check retailer terms before buying.",
  alternates: { canonical: "/christmas" },
};

const giftBudgets = [
  { label: "Under £10", q: "Christmas gifts under £10", detail: "Small gifts, craft ideas and stocking fillers" },
  { label: "Under £25", q: "Christmas gifts under £25", detail: "Thoughtful presents without stretching the budget" },
  { label: "Under £50", q: "Christmas gifts under £50", detail: "Gifts worth considering for family and friends" },
  { label: "Make & create", q: "Christmas craft kits", detail: "Craft activities, decorations and handmade gifting" },
];

export default function ChristmasPage() {
  return <main>
    <Header />
    <section className={styles.hero}>
      <div className={`shell ${styles.heroLayout}`}>
        <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><Sparkles size={16} /> AVUQO Christmas 2026</p>
        <h1>More festive joy.<br /><span>Less guesswork.</span></h1>
        <p>Find Christmas gift ideas, creative projects and practical ways to keep seasonal spending in check. We focus on the total cost and the details that matter, not just a flashy discount.</p>
        <div className={styles.heroActions}><Link className={styles.primary} href="#gift-ideas">Explore gift ideas <ArrowRight size={17}/></Link><Link className={styles.secondary} href="/lists">Plan a gift list</Link></div>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true" />
      </div>
    </section>
    <section className="shell section" id="gift-ideas">
      <div className="section-title"><div><p className="kicker">Find your starting point</p><h2>Gifts for every budget.</h2><p>Browse ideas, then check current prices, availability and delivery charges with the retailer.</p></div></div>
      <div className={styles.grid}>{giftBudgets.map(item => <Link href={`/search?q=${encodeURIComponent(item.q)}`} className={styles.tile} key={item.label}><Gift size={25}/><h3>{item.label}</h3><p>{item.detail}</p><span>Explore <ArrowRight size={15}/></span></Link>)}</div>
    </section>
    <GiftFinder />
    <section className="shell section">
      <div className={styles.spotlight}>
        <div><p className="kicker">Crafts & creative gifting</p><h2>Make something worth keeping.</h2><p>Explore crystal art, painting kits and hands-on creative gifts. AVUQO has an approved affiliate partnership with Craft Buddy Shop. Its product feed is being checked before individual items are published here.</p><Link className={styles.primary} href="/search?q=craft%20kits">Explore craft ideas <ArrowRight size={17}/></Link></div>
        <div className={styles.decoration} aria-hidden="true" />
      </div>
    </section>
    <Suspense fallback={<section className="shell section">Checking published Christmas offers…</section>}><PublishedChristmasCrafts /></Suspense>
    <section className="shell section">
      <div className="section-title"><div><p className="kicker">Shop with your eyes open</p><h2>What makes a festive deal worthwhile?</h2></div></div>
      <div className={styles.grid3}><article><ShoppingBag size={24}/><h3>Check the full price</h3><p>Account for delivery, fees and any minimum spend before comparing offers.</p></article><article><Truck size={24}/><h3>Check delivery dates</h3><p>Confirm stock, dispatch and final delivery deadlines with the retailer.</p></article><article><Heart size={24}/><h3>Buy for the person</h3><p>Use a gift list to stay focused on what the recipient actually wants.</p></article></div>
    </section>
    <section className="shell section"><div className={styles.notice}><strong>Our transparency promise</strong><p>This is an editorial shopping guide, not a live multi-retailer Christmas price comparison. Product prices and stock are not shown until source data has been checked and approved for publication. AVUQO may earn commission from eligible affiliate links, but commission does not control organic rankings.</p></div></section>
    <Footer />
  </main>;
}
