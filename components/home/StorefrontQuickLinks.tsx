import Link from "next/link";
import {ArrowRight, Gift, House, Laptop, PawPrint, Plane, ShoppingBasket, Sparkles, Shirt} from "lucide-react";
import {lifestylePages} from "../../lib/lifestyle/landing-data";
import styles from "./StorefrontQuickLinks.module.css";

/** Editorial navigation only; no implied listing, merchant or price availability. */
const departments=[
 {href:"/tech",title:"Tech",image:lifestylePages.tech.tiles[0].image,icon:Laptop},
 {href:"/home",title:"Home & living",image:lifestylePages.home.hero,icon:House},
 {href:"/beauty",title:"Beauty",image:lifestylePages.beauty.hero,icon:Sparkles},
 {href:"/fashion",title:"Fashion",image:lifestylePages.fashion.hero,icon:Shirt},
 {href:"/gifts",title:"Gifts",image:lifestylePages.gifts.hero,icon:Gift},
 {href:"/groceries",title:"Groceries",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=650&q=80",icon:ShoppingBasket},
 {href:"/travel",title:"Travel",image:lifestylePages.travel.hero,icon:Plane},
 {href:"/pets",title:"Pets",image:"/illustrations/avuqo-pets-care.svg",icon:PawPrint},
] as const;

export default function StorefrontQuickLinks(){
 return <section className={styles.section} aria-label="Explore AVUQO shopping departments">
  <div className="shell">
   <div className={styles.intro}><div><p className={styles.eyebrow}>Browse your world</p><h2>Find your next good thing.</h2></div><Link href="/categories">All departments <ArrowRight size={16}/></Link></div>
   <div className={styles.grid}>
    {departments.map(({href,title,image,icon:Icon})=><Link href={href} key={href} className={styles.card}>
     <span className={styles.photo} style={{backgroundImage:`url("${image}")`}} aria-hidden="true"/>
     <span className={styles.label}><Icon size={17} aria-hidden="true"/><strong>{title}</strong><ArrowRight size={14} aria-hidden="true"/></span>
    </Link>)}
   </div>
   <p className={styles.note}>Images are category inspiration, not representations of verified retailer products.</p>
  </div>
 </section>;
}
