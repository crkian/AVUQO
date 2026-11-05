import Link from "next/link";
import {ArrowRight, Gift, House, Utensils, Gamepad2, Shirt, Plane, Users, Bookmark, Heart} from "lucide-react";
import type {HomeSeasonalMoment} from "../../lib/marketing/seasonal-calendar";
import styles from "./ChristmasHomeFeature.module.css";

const paths=[
 {href:"/gifts",label:"Gifts",copy:"Thoughtful ideas for everyone",icon:Gift},
 {href:"/home",label:"Home & decor",copy:"Make room for cosy moments",icon:House},
 {href:"/groceries",label:"Food & drink",copy:"Organise the festive shop",icon:Utensils},
 {href:"/toys",label:"Toys & games",copy:"Play, make and discover",icon:Gamepad2},
 {href:"/fashion",label:"Fashion",copy:"Comfortable winter favourites",icon:Shirt},
 {href:"/travel",label:"Travel",copy:"Ideas for time away",icon:Plane},
] as const;
const stories=[
 {href:"/gifts",title:"Thoughtful gifts",copy:"Ideas for people you care about",photo:"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80"},
 {href:"/home",title:"Festive home",copy:"Create a welcoming space",photo:"https://images.unsplash.com/photo-1544428000-5b622c57fcd4?auto=format&fit=crop&w=800&q=80"},
 {href:"/groceries",title:"Festive essentials",copy:"One useful shopping list",photo:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"},
] as const;
const plans=[
 {href:"/groceries",title:"Groceries",copy:"Prepare your basket",icon:Utensils},
 {href:"/lists",title:"Shared lists",copy:"Organise gift ideas",icon:Users},
 {href:"/saved",title:"Saved items",copy:"Keep favourites close",icon:Bookmark},
 {href:"/gifts",title:"Gifting",copy:"Choose with care",icon:Heart},
] as const;

export default function ChristmasHomeFeature({moment}:{moment:HomeSeasonalMoment}){
 return <section className={styles.section} aria-labelledby="christmas-collection-heading">
  <div className="shell">
   <div className={styles.heading}>
    <div><p className={styles.eyebrow}>Christmas discovery</p><h2 id="christmas-collection-heading">{moment.cardTitle}</h2><p>{moment.cardSummary}</p></div>
    <Link href="/christmas">Explore Christmas <ArrowRight size={18}/></Link>
   </div>
   <nav className={styles.paths} aria-label="Christmas inspiration by category">
    {paths.map(({href,label,copy,icon:Icon})=><Link href={href} key={href} className={styles.path}>
     <Icon size={25} aria-hidden="true"/><strong>{label}</strong><small>{copy}</small>
    </Link>)}
   </nav>
   <div className={styles.panels}>
    <article className={styles.editorial}>
     <h3>Explore Christmas ideas</h3><p>Gifting, home comforts and all the little things.</p>
     <div className={styles.stories}>{stories.map(item=><Link href={item.href} key={item.href} className={styles.story} style={{backgroundImage:`linear-gradient(0deg,rgba(36,25,33,.73),transparent 75%),url("${item.photo}")`}}>
      <strong>{item.title}</strong><span>{item.copy} <ArrowRight size={15}/></span>
     </Link>)}</div>
    </article>
    <article className={styles.planning}>
     <h3>Plan Christmas smarter</h3><p>A few helpful tools to keep the season organised.</p>
     <div className={styles.planningGrid}>{plans.map(({href,title,copy,icon:Icon})=><Link href={href} key={href}>
      <Icon size={25} aria-hidden="true"/><strong>{title}</strong><small>{copy}</small>
     </Link>)}</div>
    </article>
   </div>
   <p className={styles.disclosure}>Seasonal inspiration only. These images are illustrative and do not represent verified prices, discounts, product availability or delivery promises.</p>
  </div>
 </section>;
}
