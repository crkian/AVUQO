import Link from "next/link";
import type {CSSProperties} from "react";
import type {Metadata} from "next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {PARTNERS,partnerHref,type PartnerKind} from "../../lib/partners/advertiser-directory";
import styles from "./partners.module.css";
export const metadata:Metadata={
 title:"The Retail Park | Explore AVUQO partner shops and services",
 description:"Explore our 21 documented Awin advertisers: shopping, mobile phones, broadband, travel, motoring and services. Prices appear only where retailer evidence is independently eligible.",
 alternates:{canonical:"/partners"}
};
const categories:{kind:PartnerKind;title:string;intro:string}[]=[
 {kind:"retail",title:"Shops, gifts and creative finds",intro:"Browse partner stores and eligible AVUQO products. Feed availability alone does not guarantee published prices."},
 {kind:"mobile",title:"Mobile phones and SIM plans",intro:"Find handset shopping and links to provider plans. Confirm allowances, network, contract duration and total cost."},
 {kind:"broadband",title:"Broadband and home connections",intro:"Explore broadband and fibre partners. A service quote is address- and term-specific, never a guessed product price."},
 {kind:"travel",title:"Travel and booking services",intro:"Airport parking, hotels, lounges and travel extras. Live quotes depend on your dates and destination."},
 {kind:"motoring",title:"Vehicles and motoring services",intro:"Tyre sizes, fitting, MOT and breakdown cover need specialist checks."},
 {kind:"energy",title:"Energy",intro:"Energy products are quoted by provider, property and usage, not a fixed national price."},
 {kind:"services",title:"Everyday services",intro:"Explore specialists, with the right service specification before any quote is compared."}
];
export default function PartnerDirectory(){return <><Header/><main className={styles.directoryPage}>
 <section className={styles.directoryHero}><div className={styles.shell}>
  <p style={{letterSpacing:".13em",fontSize:12,fontWeight:800,textTransform:"uppercase",color:"#E8C9FA"}}>AVUQO · The online retail park</p>
  <h1>Explore more shops.<br/>Keep your options open.</h1>
  <p>Meet participating Awin advertisers, compare independently eligible product offers and reach genuine provider booking pages. Not every partner offers a conventional product CSV feed, and an affiliate relationship never determines AVUQO&apos;s cheapest-price ranking.</p>
  <div className={styles.strip}><Link className={styles.heroButton} href="/products">Explore verified products ↗</Link><Link className={styles.heroGhost} href="/mobile">Mobile and SIM</Link><Link className={styles.heroGhost} href="/groceries">Supermarket basket</Link></div>
 </div></section>
 <div className={styles.shell+" "+styles.directoryMain}>
  {categories.map(group=>{
   const items=PARTNERS.filter(p=>p.kind===group.kind);if(!items.length)return null;
   return <section id={group.kind} key={group.kind} className={styles.directoryGroup} aria-label={group.title}>
    <div className={styles.directoryHead}><div><p className={styles.kicker}>Meet the participating providers</p><h2>{group.title}</h2><p className={styles.sectionIntro}>{group.intro}</p></div><span className={styles.tag}>{items.length} advertiser{items.length===1?"":"s"}</span></div>
    <div className={styles.directory}>{items.map(partner=>{
     const theme={"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties;
     return <Link className={styles.directoryCard} style={theme} href={partnerHref(partner)} key={partner.slug}>
      <span className={styles.emoji} aria-hidden="true">{partner.symbol}</span>
      <b>{partner.name}</b><p>{partner.tagline}</p>
      <strong>Explore this partner ↗</strong>
     </Link>;
    })}</div>
   </section>;
  })}
  <section className={styles.notice} style={{marginTop:30}}>
   <strong>21 owner-confirmed Awin programmes, not 21 live price feeds.</strong> A participating advertiser may have only a referral or service-booking programme. Exact product prices, service quotes, permitted photos and genuine reductions appear on AVUQO only after their respective evidence checks. <Link href="/trust">Our evidence standards</Link> · <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/partners/ebay-uk">Explore eBay UK separately</Link>.
  </section>
 </div>
 </main><Footer/></>}
