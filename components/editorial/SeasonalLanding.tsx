import Link from "next/link";
import type {CSSProperties} from "react";
import {ArrowRight, Bookmark, CalendarDays, CheckCircle2, Gift, House, Laptop, ListChecks, Plane, Scale, ShieldCheck, ShoppingBasket, Shirt} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {seasonal,type Season} from "../../lib/editorial/seasonal";
import styles from "./SeasonalLanding.module.css";

const names:Record<Season,string>={
  sales:"Sales & Seasonal Savings",
  "black-friday":"Black Friday",
  easter:"Easter",
  valentines:"Valentine's",
};
const photographs:Record<string,string>={
  "/tech":"/editorial/electronics.webp",
  "/home":"/editorial/home-living.webp",
  "/gifts":"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=720&q=80",
  "/christmas":"https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=720&q=80",
  "/toys":"https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=720&q=80",
  "/fashion":"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=720&q=80",
  "/groceries":"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80",
  "/travel":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=720&q=80",
  "/beauty":"/editorial/beauty.webp",
  "/experiences":"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=720&q=80",
  "/sales":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=720&q=80",
  "/black-friday":"/editorial/black-friday.webp",
  "/categories":"https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=720&q=80",
  "/reality-check":"https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=720&q=80",
  "/lists":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=720&q=80",
};
function photo(href:string):string{return photographs[href]??photographs["/gifts"];}
function categoryIcon(href:string){
 if(href.includes("home"))return House;
 if(href.includes("tech"))return Laptop;
 if(href.includes("groceries"))return ShoppingBasket;
 if(href.includes("travel")||href.includes("experiences"))return Plane;
 if(href.includes("fashion"))return Shirt;
 if(href.includes("lists"))return ListChecks;
 if(href.includes("reality"))return Scale;
 return Gift;
}
const planner=[
 {href:"/groceries",label:"Groceries",summary:"Start your essentials list",icon:ShoppingBasket},
 {href:"/lists",label:"Shared lists",summary:"Organise ideas together",icon:ListChecks},
 {href:"/saved",label:"Saved items",summary:"Keep favourites handy",icon:Bookmark},
 {href:"/reality-check",label:"Budgeting & value",summary:"Think through the full cost",icon:Scale},
] as const;

export default function SeasonalLanding({kind}:{kind:Season}){
 const d=seasonal[kind],name=names[kind];
 const custom={"--tone":d.color,"--wash":d.wash,"--season-photo":`url("${d.photo}")`} as CSSProperties;
 return <main className={styles.page} data-season={kind} style={custom}>
   <Header/>
   <section className={styles.hero} aria-labelledby={`season-${kind}`}>
    <div className={`shell ${styles.heroContent}`}>
      <h1 id={`season-${kind}`}>{kind==="sales"?<>Sales &amp; <em>Seasonal Savings</em></>:<>{name} at <em>AVUQO</em></>}</h1>
      <p className={styles.lead}>{d.intro}</p>
      <div className={styles.heroActions}>
        <a href="#seasonal-discovery" className={styles.primary}>Explore {name} ideas <ArrowRight size={16}/></a>
        <Link href="/lists" className={styles.secondary}>Plan with a list</Link>
      </div>
      <p className={styles.status}><ShieldCheck size={15} aria-hidden="true"/> {d.status}</p>
    </div>
   </section>

   <nav className={`shell ${styles.categoryRail}`} aria-label={`Explore ${name} categories`}>
     {d.cards.map(([title,copy,href])=>{
       const Icon=categoryIcon(href);
       return <Link href={href} key={title} className={styles.category}>
         <Icon size={24} aria-hidden="true"/><strong>{title}</strong><small>{copy}</small>
         <span className={styles.categoryPhoto} style={{backgroundImage:`url("${photo(href)}")`}} aria-hidden="true"/>
       </Link>;
     })}
   </nav>

   <section className={`shell ${styles.discovery}`} id="seasonal-discovery" aria-labelledby={`discover-${kind}`}>
    <article className={styles.editorial}>
      <div className={styles.titleBar}><div><p className={styles.kicker}>{name} discovery</p><h2 id={`discover-${kind}`}>A season to explore.</h2><p>Considered ideas for people, places and everyday moments.</p></div><Link href="/categories">All departments <ArrowRight size={16}/></Link></div>
      <div className={styles.storyGrid}>{d.cards.slice(0,kind==="easter"?4:3).map(([title,copy,href])=>
        <Link href={href} key={title} className={styles.story} style={{backgroundImage:`linear-gradient(0deg,rgba(36,22,34,.83),transparent 76%),url("${photo(href)}")`}}>
          <strong>{title}</strong><span>{copy}</span><small>Explore <ArrowRight size={14}/></small>
        </Link>)}</div>
    </article>
    <article className={styles.planning}>
      <p className={styles.kicker}>Plan {name} smarter</p>
      <h2>Make room for the good things.</h2>
      <p>Helpful tools to choose carefully, keep your list organised and avoid spending just because a season has a name.</p>
      <div className={styles.plannerGrid}>{planner.map(({href,label,summary,icon:Icon})=><Link href={href} key={href}>
        <Icon size={25} aria-hidden="true"/><strong>{label}</strong><span>{summary}</span><small>Open <ArrowRight size={13}/></small>
      </Link>)}</div>
    </article>
   </section>

   <section className={`shell ${styles.editorialFinds}`}>
    <div className={styles.findsHeading}><div><p className={styles.kicker}><Gift size={15} aria-hidden="true"/> Seasonal inspiration</p>
      <h2>Curated ideas, never invented deals.</h2>
      <p>These are editorial starting points only. No retailer product, score, crossed-out price or promotion is asserted without the required source evidence.</p></div>
      <Link href="/products">Verified product collection <ArrowRight size={16}/></Link></div>
    <div className={styles.findGrid}>{d.cards.slice(0,4).map(([title,copy,href])=><Link href={href} key={title}>
      <span className={styles.findPhoto} style={{backgroundImage:`url("${photo(href)}")`}} aria-hidden="true"/>
      <strong>{title}</strong><small>{copy}</small><span>Explore ideas <ArrowRight size={15}/></span>
    </Link>)}</div>
   </section>

   <section className={`shell ${styles.valueRibbon}`} aria-label="Shop with confidence">
     <strong>Shop with confidence</strong>
     <div><CalendarDays size={25}/><span><b>Check the details</b><small>Availability, dates and retailer terms.</small></span></div>
     <div><Scale size={25}/><span><b>Know the total cost</b><small>Delivery, extras and ongoing fees.</small></span></div>
     <div><ShieldCheck size={25}/><span><b>Find genuine value</b><small>Verified sources and thoughtful guidance.</small></span></div>
   </section>
   <section className={`shell ${styles.tips}`}>
     <h2>Three habits worth keeping.</h2>
     <div>{d.tips.map(([title,description])=><article key={title}><CheckCircle2 size={21}/><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
   </section>
   <section className={`shell ${styles.notice}`}><strong>Editorial and pricing disclosure</strong>
      <p>{d.notice} Advertiser relationships do not determine organic recommendations. <Link href="/editorial-policy">Our editorial policy</Link>.</p>
   </section>
   <Footer/>
 </main>;
}
