import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, Heart, ShoppingBag, Sparkles, Truck, ShieldCheck, House, Utensils, Gamepad2, Shirt, Plane, Users, Bookmark } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import GiftFinder from "./GiftFinder";
import PublishedChristmasCrafts from "./PublishedChristmasCrafts";
import ChristmasFestiveFinds from "../../components/home/ChristmasFestiveFinds";
import { Suspense } from "react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Christmas 2026 | Gift ideas and festive value",
  description: "Plan a more thoughtful Christmas with AVUQO's gift ideas, crafts and festive shopping guides. Compare total costs and check retailer terms before buying.",
  alternates: { canonical: "/christmas" },
};

const giftBudgets = [
  { label: "Under £10", q: "Christmas gifts under £10", detail: "Small gifts, craft ideas and stocking fillers", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=700&q=80" },
  { label: "Under £25", q: "Christmas gifts under £25", detail: "Thoughtful presents without stretching the budget", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80" },
  { label: "Under £50", q: "Christmas gifts under £50", detail: "Gifts worth considering for family and friends", image: "https://images.unsplash.com/photo-1544428000-5b622c57fcd4?auto=format&fit=crop&w=700&q=80" },
  { label: "Make & create", q: "Christmas craft kits", detail: "Craft activities, decorations and handmade gifting", image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=700&q=80" },
];


const festivePaths = [
 {href:"/gifts",title:"Gifts",copy:"Thoughtful ideas for everyone",icon:Gift},
 {href:"/home",title:"Home & decor",copy:"A cosy Christmas at home",icon:House},
 {href:"/groceries",title:"Food & drink",copy:"Plan the festive essentials",icon:Utensils},
 {href:"/toys",title:"Toys & games",copy:"Play and creativity",icon:Gamepad2},
 {href:"/fashion",title:"Fashion",copy:"Winter favourites",icon:Shirt},
 {href:"/travel",title:"Travel",copy:"Time away together",icon:Plane},
] as const;
const festiveStories = [
 {href:"/gifts",title:"Gifts for everyone",copy:"A thoughtful place to start",image:"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80"},
 {href:"/home",title:"Festive home inspiration",copy:"Cosy, considered comforts",image:"https://images.unsplash.com/photo-1544428000-5b622c57fcd4?auto=format&fit=crop&w=900&q=80"},
 {href:"/groceries",title:"Food and festive planning",copy:"Lists and everyday essentials",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"},
] as const;

export default function ChristmasPage() {
  return <main>
    <Header />
    <section className={styles.hero}>
      <div className={styles.heroPhoto} aria-hidden="true"/><div className={styles.heroWash} aria-hidden="true"/>
      <div className={`shell ${styles.heroLayout}`}>
        <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><Sparkles size={16} /> Thoughtful festive planning</p>
        <h1>Christmas at <span>AVUQO</span></h1>
        <p>Thoughtful gifting, festive home inspiration and useful planning, all in one place. Find what’s worth it this Christmas, without the pressure of an invented bargain.</p>
        <div className={styles.heroActions}><Link className={styles.primary} href="#gift-finder-heading">Find gift ideas <ArrowRight size={17}/></Link><Link className={styles.secondary} href="/lists">Plan a gift list</Link></div>
        </div>

      </div>
    </section>

    <nav className={`shell ${styles.categoryRail}`} aria-label="Christmas departments">
      {festivePaths.map(({href,title,copy,icon:Icon})=><Link href={href} className={styles.categoryLink} key={href}>
        <Icon size={26} aria-hidden="true"/><strong>{title}</strong><span>{copy}</span>
      </Link>)}
    </nav>
    <section className={`shell ${styles.discoverySection}`} aria-label="Christmas inspiration and planning">
      <article className={styles.discoveryEditorial}>
        <div className={styles.discoveryHeading}><h2>Christmas discovery</h2><p>Thoughtful gifts, welcoming spaces and the little things that bring people together.</p></div>
        <div className={styles.discoveryStories}>
          {festiveStories.map(item=><Link href={item.href} key={item.href} className={styles.discoveryStory} style={{backgroundImage:`linear-gradient(0deg,rgba(32,20,29,.75),transparent 72%),url("${item.image}")`}}>
            <strong>{item.title}</strong><span>{item.copy} <ArrowRight size={15}/></span>
          </Link>)}
        </div>
      </article>
      <article className={styles.discoveryPlanning}>
        <div className={styles.discoveryHeading}><h2>Plan Christmas smarter</h2><p>Useful shopping tools, without the rush.</p></div>
        <div className={styles.planningLinks}>
          <Link href="/groceries"><Utensils size={26}/><strong>Groceries</strong><span>Plan your seasonal shop</span></Link>
          <Link href="/lists"><Users size={26}/><strong>Shared lists</strong><span>Get gift ideas together</span></Link>
          <Link href="/saved"><Bookmark size={26}/><strong>Saved items</strong><span>Keep favourites close</span></Link>
          <Link href="/gifts"><Heart size={26}/><strong>Gift inspiration</strong><span>Choose what matters</span></Link>
        </div>
      </article>
    </section>
    <Suspense fallback={<section className="shell section">Checking approved festive finds…</section>}>
      <ChristmasFestiveFinds/>
    </Suspense>
    <section className={`shell ${styles.confidenceStrip}`} aria-label="Christmas shopping guidance">
      <div className={styles.confidenceIntro}><ShieldCheck size={25} aria-hidden="true"/><strong>Shop with confidence this Christmas</strong></div>
      <div className={styles.confidencePoint}><Truck size={23} aria-hidden="true"/><span><strong>Check delivery dates</strong><small>Confirm stock and delivery deadlines.</small></span></div>
      <div className={styles.confidencePoint}><ShoppingBag size={23} aria-hidden="true"/><span><strong>Know the total cost</strong><small>Include delivery, fees and minimum spend.</small></span></div>
      <div className={styles.confidencePoint}><Heart size={23} aria-hidden="true"/><span><strong>Buy for the person</strong><small>Use a gift list to stay focused.</small></span></div>
    </section>
    <section className={`shell ${styles.supportingSection}`} id="gift-ideas">
      <div className="section-title"><div><p className="kicker">Find your starting point</p><h2>Gifts for every budget.</h2><p>Browse ideas, then check current prices, availability and delivery charges with the retailer.</p></div></div>
      <div className={styles.grid}>{giftBudgets.map(item => <Link href={`/search?q=${encodeURIComponent(item.q)}`} className={styles.tile} key={item.label}><div className={styles.tilePhoto} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/><div className={styles.tileCopy}><Gift size={22}/><h3>{item.label}</h3><p>{item.detail}</p><span>Explore <ArrowRight size={15}/></span></div></Link>)}</div>
    </section>
    <GiftFinder />
    <section className={`shell ${styles.supportingSection}`}>
      <div className={styles.spotlight}>
        <div><p className="kicker">Crafts & creative gifting</p><h2>Make something worth keeping.</h2><p>Explore crystal art, painting kits and hands-on creative gifts. AVUQO has an approved affiliate partnership with Craft Buddy Shop. Its product feed is being checked before individual items are published here.</p><Link className={styles.primary} href="/search?q=craft%20kits">Explore craft ideas <ArrowRight size={17}/></Link></div>
        <div className={styles.decoration} aria-hidden="true" />
      </div>
    </section>
    <Suspense fallback={<section className="shell section">Checking published Christmas offers…</section>}><PublishedChristmasCrafts /></Suspense>
    <section className={`shell ${styles.supportingSection}`}><div className={styles.notice}><strong>Our transparency promise</strong><p>This is an editorial shopping guide, not a live multi-retailer Christmas price comparison. Product prices and stock are not shown until source data has been checked and approved for publication. AVUQO may earn commission from eligible affiliate links, but commission does not control organic rankings.</p></div></section>
    <Footer />
  </main>;
}
