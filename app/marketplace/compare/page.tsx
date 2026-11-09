import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,Scale,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import styles from "../marketplace.module.css";
export const metadata:Metadata={title:"Compare with context | AVUQO Marketplace",
 description:"Choose the right comparison for shopping, groceries, tyres, contracts and travel. Understand what is comparable and what remains unverified.",alternates:{canonical:"/marketplace/compare"}};
const areas=[
 {title:"Products & retailers",href:"/products",description:"Exact verified product records with eligible current retailer offers. Unapproved feed entries never appear.",scope:"Product variants and approved offers"},
 {title:"Supermarket baskets",href:"/groceries",description:"Build a list, inspect the available evidence and understand missing prices before comparing basket totals.",scope:"Like-for-like units and complete baskets"},
 {title:"Tyres & fitting",href:"/tyres",description:"Explore exact tyre sizes and manufacturers. Full retailer and fitted-price comparison requires additional approved feed data.",scope:"Same tyre variant, same quantity, complete costs"},
 {title:"Broadband, mobile & TV",href:"/compare",description:"Calculate full contract costs from the figures you enter. Illustrative calculations are not live provider quotes.",scope:"Whole-term costs and conditions"},
 {title:"Travel & experiences",href:"/travel",description:"Consider baggage, transfers, flexibility and the true total cost. Live comparable booking feeds are not yet established.",scope:"Dates, inclusions and booking terms"},
 {title:"Insurance & finance",href:"/insurance",description:"Understand coverage, exclusions, excesses and eligibility. Informational guidance, not regulated recommendations or live quotations.",scope:"Cover and terms, not just premium"}
];
export default function ComparisonIndex(){return <main className={styles.page}><Header/>
 <section className={styles.hero}><div className={styles.shell}>
  <p className={styles.eyebrow}>AVUQO / COMPARE</p>
  <h1>Compare the real thing.<br/><span>Not just the number.</span></h1>
  <p>Different categories need different comparison rules. Choose an experience built around the costs and conditions that actually matter.</p>
  <div className={styles.heroActions}><Link href="/marketplace" className={styles.primary}>Explore the marketplace <ArrowRight size={17}/></Link>
   <Link href="/products" className={styles.secondary}>Approved product offers <ArrowRight size={17}/></Link></div>
 </div></section>
 <div className={styles.shell+" "+styles.section}><div className={styles.sectionHeading}><div>
  <p className={styles.kicker}>Six comparison journeys</p><h2>The right comparison for the right decision.</h2>
  <p className={styles.sub}>Each destination explains the information it can and cannot currently verify.</p></div></div>
  <div className={styles.brandGrid}>{areas.map(area=><article key={area.href} className={styles.brand}>
   <span className={styles.kicker}>{area.scope}</span><h3>{area.title}</h3><p>{area.description}</p>
   <Link href={area.href}>Open comparison journey <ArrowRight size={14}/></Link></article>)}</div>
  <div style={{height:25}}/><aside className={styles.notice}><ShieldCheck size={17} style={{verticalAlign:"middle"}}/> Comparison rankings and lowest-price claims require genuine fresh comparable data, including unavoidable fees. A missing price or a disconnected feed is never treated as zero cost.</aside>
  <div style={{height:25}}/><Link className={styles.textLink} href="/whos-who"><Scale size={17}/> Not comparing today? Explore Who&apos;s Who instead.</Link>
 </div><Footer/></main>}
