import type {Metadata} from "next";
import Link from "next/link";
import {ArrowRight,CheckCircle2,Compass,Heart,LayoutGrid,ListChecks,Megaphone,ShieldCheck,ShoppingBasket,Tag,Truck,Watch} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import styles from "./page.module.css";

export const metadata:Metadata={
 title:"Explore the whole AVUQO website",
 description:"Take a tour of AVUQO shopping, comparisons, groceries, tyres, travel, personal tools and seasonal inspiration. See what is available and what still requires verified sources.",
 alternates:{canonical:"/explore-avuqo"}
};

const journeys=[
 {title:"Shopping and departments",subtitle:"Explore thoughtful shopping, categories and individual product guides.",icon:LayoutGrid,links:[["Explore shopping","/shopping"],["Browse all categories","/categories"],["Product guides","/products"],["Compare products","/marketplace/compare"]]},
 {title:"Bargains and occasions",subtitle:"Seasonal ideas, sales and editorial inspiration without invented discounts.",icon:Tag,links:[["Deals & sales","/sales"],["Christmas","/christmas"],["Black Friday","/black-friday"],["Discover","/discover"]]},
 {title:"Groceries and planning",subtitle:"Build a list and explore basket tools. Store price comparisons depend on eligible current evidence.",icon:ShoppingBasket,links:[["Groceries","/groceries"],["My lists","/lists"],["Comparison basket","/basket"]]},
 {title:"Motoring and tyres",subtitle:"Research tyre sizes and options. No unverified fitment or supplier price is presented as confirmed.",icon:Truck,links:[["Tyres overview","/tyres"],["Find tyres","/tyres/find"],["Tyre comparisons","/tyres/compare"],["Motoring","/motoring"]]},
 {title:"Travel and everyday services",subtitle:"Explore guidance before provider-specific live availability or regulated quotes are approved.",icon:Compass,links:[["Travel","/travel"],["Insurance","/insurance"],["Broadband","/broadband"],["Contract cost calculator","/compare"]]},
 {title:"Your AVUQO",subtitle:"Discover personal tools. Sign-in may be required to view or save your own items.",icon:Heart,links:[["My account","/account"],["Saved items","/saved"],["Watches","/watches"],["Shared lists","/lists"]]},
] as const;

export default function ExploreAvuqoPage(){
 return <><Header/><main className={styles.page}>
  <section className={styles.hero}><div className="shell">
    <p className={styles.eyebrow}><Compass size={17} aria-hidden="true"/> YOUR AVUQO TOUR</p>
    <h1>Explore the whole <em>AVUQO experience.</em></h1>
    <p className={styles.intro}>From everyday shopping to groceries, tyres, travel and the tools that help you plan. The website is open to explore while more sources and automation are carefully connected.</p>
    <div className={styles.heroLinks}><Link href="/shopping" className={styles.primary}>Start shopping <ArrowRight size={18}/></Link><Link href="/categories" className={styles.secondary}>See all categories <ArrowRight size={18}/></Link></div>
  </div></section>
  <section className={styles.notice}><div className="shell"><ShieldCheck size={22} aria-hidden="true"/><p><strong>Designed to explore, grounded in evidence.</strong> A live page does not mean every merchant feed, price, image or automatic alert is active. AVUQO only publishes current offers when their source, rights and product checks pass.</p></div></section>
  <section className={`shell ${styles.content}`} aria-labelledby="tour-heading">
   <div className={styles.heading}><p className={styles.eyebrow}>FIND YOUR WAY</p><h2 id="tour-heading">All the main journeys, in one place.</h2><p>Choose an area to see the real website. Links open live public routes or their sign-in screens, not a separate mock-up.</p></div>
   <div className={styles.grid}>{journeys.map(({title,subtitle,icon:Icon,links})=><section key={title} className={styles.card} aria-label={title}>
    <div className={styles.cardIcon}><Icon size={23} aria-hidden="true"/></div>
    <h3>{title}</h3><p>{subtitle}</p>
    <ul>{links.map(([label,href])=><li key={href+label}><Link href={href}>{label}<ArrowRight size={16} aria-hidden="true"/></Link></li>)}</ul>
   </section>)}</div>
  </section>
  <section className={styles.bottom}><div className="shell"><div className={styles.bottomGrid}><div><p className={styles.eyebrow}>BEHIND THE SCENES</p><h2>The platform grows without guessing.</h2><p>Our private Control Centre manages feed reviews, marketing and publishing approvals. Those administrative tools are reserved for authorised owners, while everyone can explore the customer experience.</p></div><div className={styles.points}><p><CheckCircle2 size={18}/> Independent comparison principles</p><p><ListChecks size={18}/> Personal planning and shopping tools</p><p><Megaphone size={18}/> Seasonal editorial inspiration</p><p><Watch size={18}/> Watches without promises of unenabled alerts</p><Link href="/trust">How AVUQO builds trust <ArrowRight size={17}/></Link></div></div></div></section>
 </main><Footer/></>;
}
