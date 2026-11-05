import Link from "next/link";
import {ArrowRight,ShieldCheck} from "lucide-react";
import {lifestylePages} from "../../lib/lifestyle/landing-data";
import OwnerCollectionLink from "./OwnerCollectionLink";
import styles from "./ShoppingDepartmentShelf.module.css";
/** These are editorial departments, not public representations of imported products. */
const collections=[
 {title:"Tools & DIY",description:"Tools, workwear, projects and practical buying advice.",href:"/search?q=tools%20and%20DIY",ownerHref:"/preview/products/tooled-up",image:lifestylePages.shopping.featureImage,merchant:"Tooled-Up"},
 {title:"Gifts & chocolate",description:"Thoughtful gifts and the details that make them right.",href:"/gifts",ownerHref:"/preview/products?merchant=736",image:lifestylePages.gifts.hero,merchant:"Cadbury Gifts Direct"},
 {title:"Pets & care",description:"Feeding, hydration and products for your companions.",href:"/pets",ownerHref:"/preview/products?merchant=77952",image:"/illustrations/avuqo-pets-care.svg",merchant:"Petlibro"},
 {title:"Crafts & creativity",description:"Creative projects, kits and the joy of making.",href:"/search?q=craft%20kits",ownerHref:"/preview/products?merchant=45747",image:lifestylePages.shopping.hero,merchant:"Craft Buddy"},
 {title:"Technology & phones",description:"Devices, mobile plans and practical technology choices.",href:"/tech",ownerHref:"/preview/products?merchant=31539",image:lifestylePages.tech.hero,merchant:"Mozillion"},
 {title:"Motoring & services",description:"Tyres, journeys and the full cost of getting around.",href:"/motoring",ownerHref:"/control-centre/general-feed-import",image:lifestylePages.shopping.featureImage,merchant:"Tyres UK"}
] as const;
export default function ShoppingDepartmentShelf({compact=false}:{compact?:boolean}){
 return <section className={compact?`${styles.section} ${styles.compact}`:styles.section} aria-labelledby={compact?"avuqo-shop-categories-compact":"avuqo-shop-categories"}>
  <div className="shell">
   <div className={styles.heading}>
    <div><p className={styles.eyebrow}>Explore the departments</p>
     <h2 id={compact?"avuqo-shop-categories-compact":"avuqo-shop-categories"}>Find your kind of worth it.</h2>
     <p>Browse the AVUQO shopping worlds, with helpful guidance before the price tag. Verified merchant listings will appear as they become eligible.</p>
    </div>
    <Link href="/categories">All categories <ArrowRight size={17} aria-hidden="true"/></Link>
   </div>
   <div className={styles.grid}>{(compact?collections.slice(0,4):collections).map(item=><article className={styles.card} key={item.title}>
    <Link href={item.href} className={styles.publicLink}>
     <div className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
     <div className={styles.copy}><span>Thoughtful shopping</span><h3>{item.title}</h3><p>{item.description}</p><strong>Explore department <ArrowRight size={16} aria-hidden="true"/></strong></div>
    </Link>
    <OwnerCollectionLink href={item.ownerHref} merchant={item.merchant}/>
   </article>)}</div>
   <p className={styles.disclosure}><ShieldCheck size={16} aria-hidden="true"/> Images are illustrative. Imported merchant prices and photographs remain private until listing and usage rights are verified.</p>
  </div>
 </section>;
}
