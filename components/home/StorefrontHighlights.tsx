import Link from "next/link";
import {ArrowRight, ShieldCheck, Sparkles} from "lucide-react";
import {lifestylePages} from "../../lib/lifestyle/landing-data";
import type {VerifiedProductEntry} from "../products/VerifiedProductCards";
import VerifiedProductCards from "../products/VerifiedProductCards";
import styles from "./StorefrontHighlights.module.css";

/** When no products qualify for public display, show navigation, not invented deals. */
const editorial=[
 {href:"/tech",title:"Useful technology",copy:"Practical gadgets, simpler decisions",image:lifestylePages.tech.tiles[2].image},
 {href:"/home",title:"A home that feels right",copy:"Thoughtful furniture and everyday comforts",image:lifestylePages.home.tiles[0].image},
 {href:"/beauty",title:"Considered beauty",copy:"Routines, ingredients and personal fit",image:lifestylePages.beauty.tiles[0].image},
 {href:"/gifts",title:"Gifts with meaning",copy:"Find ideas worth giving",image:lifestylePages.gifts.tiles[0].image},
] as const;

export default function StorefrontHighlights({items}:{items:VerifiedProductEntry[]}){
 return <section className={styles.section} aria-labelledby="storefront-highlights">
  <div className="shell">
   <div className={styles.heading}>
    <div><p className={styles.eyebrow}>{items.length?"Checked shopping highlights":"Shopping inspiration"}</p>
      <h2 id="storefront-highlights">{items.length?"Product finds worth exploring.":"Find what fits your world."}</h2>
      <p>{items.length
        ?"These products currently have eligible retailer evidence. Compare the exact variants and recheck the final price before buying."
        :"Discover what matters to you while we verify which retailer products and offers can be shown publicly."}</p>
    </div>
    <Link href={items.length?"/products":"/categories"}>{items.length?"Explore verified products":"Browse all categories"} <ArrowRight size={17}/></Link>
   </div>
   {items.length?<VerifiedProductCards items={items}/>:
     <div className={styles.editorialGrid}>
       {editorial.map(item=><Link href={item.href} key={item.href} className={styles.editorialCard}>
         <div className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
         <div className={styles.copy}><p><Sparkles size={13} aria-hidden="true"/> Discover</p><h3>{item.title}</h3><span>{item.copy}</span><strong>Explore ideas <ArrowRight size={16}/></strong></div>
       </Link>)}
     </div>}
   <div className={styles.trust}><ShieldCheck size={19} aria-hidden="true"/>
     <span>{items.length?"Every displayed offer has passed AVUQO's current public eligibility gate. Prices and stock may change.":"No preview feed, sample price or unapproved product is promoted as a live deal."}</span>
     <Link href="/trust">How we verify <ArrowRight size={15}/></Link>
   </div>
  </div>
 </section>;
}
