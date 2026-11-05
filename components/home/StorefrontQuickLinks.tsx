import Link from "next/link";
import {Grid2X2} from "lucide-react";
import styles from "./StorefrontQuickLinks.module.css";

/** Category imagery is editorial, never a source claim for a specific retailer product. */
const departments=[
 {href:"/tech",title:"Electronics & Tech",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=480&q=80"},
 {href:"/home",title:"Home & Garden",image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=480&q=80"},
 {href:"/search?q=kitchen%20appliances",title:"Kitchen & Appliances",image:"https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=480&q=80"},
 {href:"/fashion",title:"Fashion & Accessories",image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=480&q=80"},
 {href:"/beauty",title:"Health & Beauty",image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=480&q=80"},
 {href:"/toys",title:"Toys & Games",image:"https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=480&q=80"},
 {href:"/pets",title:"Pets",image:"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=480&q=80"},
 {href:"/search?q=sports%20outdoors",title:"Sports & Outdoors",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=480&q=80"},
 {href:"/gifts",title:"Gifts & Occasions",image:"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=480&q=80"},
] as const;
export default function StorefrontQuickLinks(){
 return <section className={styles.section} aria-label="Shop by department">
   <div className="shell">
    <nav className={styles.grid} aria-label="Popular shopping departments">
      {departments.map(({href,title,image})=><Link href={href} key={href} className={styles.card}>
        <span className={styles.photo} style={{backgroundImage:`url("${image}")`}} aria-hidden="true"/>
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
