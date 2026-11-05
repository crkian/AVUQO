import Link from "next/link";
import {Grid2X2} from "lucide-react";
import styles from "./StorefrontQuickLinks.module.css";

/** Category imagery is editorial, never a source claim for a specific retailer product. */
const departments=[
 {href:"/tech",title:"Electronics & Tech"},
 {href:"/home",title:"Home & Garden"},
 {href:"/search?q=kitchen%20appliances",title:"Kitchen & Appliances"},
 {href:"/fashion",title:"Fashion & Accessories"},
 {href:"/beauty",title:"Health & Beauty"},
 {href:"/toys",title:"Toys & Games"},
 {href:"/pets",title:"Pets"},
 {href:"/search?q=sports%20outdoors",title:"Sports & Outdoors"},
 {href:"/gifts",title:"Gifts & Occasions"},
] as const;
export default function StorefrontQuickLinks(){
 return <section className={styles.section} aria-label="Shop by department">
   <div className="shell">
    <nav className={styles.grid} aria-label="Popular shopping departments">
      {departments.map(({href,title})=><Link href={href} key={href} className={styles.card}>
        <span className={styles.photo} aria-hidden="true"/>
        <strong>{title}</strong>
      </Link>)}
      <Link href="/categories" className={`${styles.card} ${styles.all}`}>
        <span className={styles.allIcon}><Grid2X2 size={31} aria-hidden="true"/></span>
        <strong>All Categories</strong>
      </Link>
    </nav>
   </div>
 </section>;
}
