import Link from "next/link";
import {ArrowRight, Bell, BookOpen, Bookmark, CheckCircle2, ListChecks, Package, Plane, Scale, ShoppingBasket, ShieldCheck} from "lucide-react";
import type {PublicOffer,PublicProduct} from "../../lib/products/public-catalog";
import {RESEARCH_PRODUCT_GUIDES} from "../../lib/products/research-guides";
import styles from "./HomeShoppingDashboard.module.css";
export type DashboardEntry={product:PublicProduct;offers:PublicOffer[]};
const money=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value);
const tools=[
 {href:"/watches",title:"Watches",desc:"Products to revisit",icon:Bell},
 {href:"/saved",title:"Saved items",desc:"Your favourite finds",icon:Bookmark},
 {href:"/lists",title:"Shared lists",desc:"Plan with others",icon:ListChecks},
 {href:"/compare",title:"Compare contracts",desc:"Check the total cost",icon:Scale},
 {href:"/travel",title:"Travel",desc:"Plan your next trip",icon:Plane},
 {href:"/reality-check",title:"Value insights",desc:"Think before buying",icon:ShieldCheck},
] as const;

export default function HomeShoppingDashboard({items}:{items:DashboardEntry[]}){
 const picked=items.slice(0,3);
 const researchPicks=RESEARCH_PRODUCT_GUIDES.slice(0,3);
 return <section className={styles.section} aria-label="Everyday AVUQO shopping tools">
   <div className="shell">
    <div className={styles.heading}><div><p className={styles.kicker}>Useful shopping, all in one place</p><h2>Discover. Compare. Decide.</h2></div>
     <Link href="/discover">Explore AVUQO <ArrowRight size={17}/></Link></div>
    <div className={styles.grid}>
     <article className={styles.groceries}>
      <div className={styles.groceryPhoto} aria-hidden="true"/>
      <div className={styles.groceryCopy}>
       <p className={styles.kicker}><ShoppingBasket size={17}/> AVUQO Groceries</p>
       <h3>One shopping list. A clearer comparison.</h3>
       <p>Build a basket, check available supermarket evidence, and see where prices are missing.</p>
       <div className={styles.groceryChecks}>
        <span><CheckCircle2 size={15}/> Build your list</span>
        <span><CheckCircle2 size={15}/> Check price coverage</span>
        <span><CheckCircle2 size={15}/> Understand missing data</span>
       </div>
       <Link href="/groceries">Compare your basket <ArrowRight size={16}/></Link>
      </div>
     </article>
     <article className={styles.finds}>
      <div className={styles.findsHeading}><div><p className={styles.kicker}>A closer look</p><h3>{picked.length?"Verified shopping highlights":"Start with real product guides"}</h3></div>
        <Link href="/products">View all <ArrowRight size={16}/></Link></div>
      <div className={styles.findsGrid}>
        {picked.length?picked.map(({product,offers})=>{
          const best=[...offers].sort((a,b)=>Number(a.offer.total_price??a.offer.price)-Number(b.offer.total_price??b.offer.price))[0];
          if(!best)return null;
          const image=offers.find(x=>x.published.image_url)?.published.image_url;
          return <Link href={`/products/${product.slug}`} key={product.id} className={styles.find}>
            <span className={styles.findPhoto}>{image?<img src={image} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<Package size={42} aria-hidden="true"/>}</span>
            <strong>{product.canonical_title}</strong>
            <span>From {money(Number(best.offer.total_price??best.offer.price))}</span>
            <small>Eligible observed offer</small>
          </Link>;
        }):
        researchPicks.map(guide=><Link href={`/products/${guide.slug}`} key={guide.slug} className={styles.find}>
          <span className={styles.findPhoto} data-topic="research"><BookOpen size={37} aria-hidden="true"/></span>
          <strong>{guide.title}</strong><span>Explore this model</span>
          <small>Research guide · No verified retailer price</small>
        </Link>)}
      </div>
      <p className={styles.findsDisclosure}><ShieldCheck size={15}/> No unverified offers are represented as current deals.</p>
     </article>
     <aside className={styles.tools}>
      <p className={styles.kicker}>Your AVUQO tools</p>
      <h3>Keep things together.</h3>
      <nav aria-label="Your shopping tools">{tools.map(({href,title,desc,icon:Icon})=><Link key={href} href={href}>
       <span><Icon size={22}/></span><span><strong>{title}</strong><small>{desc}</small></span><ArrowRight size={15}/>
      </Link>)}</nav>
     </aside>
    </div>
   </div>
 </section>;
}
