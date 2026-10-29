import {Suspense} from "react";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import LiveDealRail from "../../components/live/LiveDealRail";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Discover worthwhile choices",description:"Thoughtful shopping, seasonal guides and only approved, fresh retailer offers from AVUQO.",alternates:{canonical:"/discover"}};
const rooms=[
 {title:"Individual products",copy:"Exact variants and verified retailer evidence, when approved.",url:"/products"},
 {title:"Black Friday",copy:"Plan the 2026 sales without the discount noise.",url:"/black-friday"},
 {title:"Christmas",copy:"Thoughtful gifting, lists and seasonal inspiration.",url:"/christmas"},
 {title:"Your grocery basket",copy:"Compare what you can, and see clearly where prices are missing.",url:"/groceries"},
 {title:"Home & living",copy:"Make space for choices that fit real life.",url:"/home"},
 {title:"Travel",copy:"Journeys and escapes with the whole cost in mind.",url:"/travel"},
];
export default function DiscoverPage(){return <main><Header/>
<section className={styles.hero}><div className="shell"><p className="kicker">Welcome to AVUQO Discover</p><h1>Worth exploring. Not just worth clicking.</h1><p>Find thoughtful departments, everyday comparisons, and genuine offers only when enough verified evidence exists to stand behind them.</p></div></section>
<section className={`shell ${styles.section}`}><div className={styles.heading}><div><p>Take a look around</p><h2>Find your own starting point.</h2></div><Link href="/categories">All categories <ArrowRight size={17}/></Link></div>
<div className={styles.discoveryGrid}>{rooms.map(room=><Link key={room.url} href={room.url} className={styles.discoveryCard}><h3>{room.title}</h3><p>{room.copy}</p><span>Explore <ArrowRight size={17}/></span></Link>)}</div></section>
<section className={`shell ${styles.section}`}><div className={styles.heading}><div><p>From verified sources only</p><h2>Eligible retailer offers</h2></div><Link href="/live">All approved offers <ArrowRight size={17}/></Link></div><Suspense fallback={<p>Checking current offer evidence…</p>}><LiveDealRail limit={6}/></Suspense><p className={styles.provenance}>No sample prices, unpublished feed records or unapproved affiliate offers are shown here.</p></section>
<Footer/></main>}