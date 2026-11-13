import Link from "next/link";
import {Grid2X2} from "lucide-react";
import styles from "./StorefrontQuickLinks.module.css";

/** Editorial category photography only, not a retailer product image or live offer. */
const image=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&q=75`;
const departments=[
 {href:"/tech",title:"Electronics & Tech",image:image("photo-1498049794561-7780e7231661")},
 {href:"/home",title:"Home & Garden",image:image("photo-1600210492486-724fe5c67fb0")},
 {href:"/search?q=kitchen%20appliances",title:"Kitchen & Appliances",image:image("photo-1556911220-bff31c812dba")},
 {href:"/fashion",title:"Fashion & Accessories",image:image("photo-1483985988355-763728e1935b")},
 {href:"/beauty",title:"Health & Beauty",image:image("photo-1596462502278-27bfdc403348")},
 {href:"/toys",title:"Toys & Games",image:image("photo-1558060370-d644479cb6f7")},
 {href:"/pets",title:"Pets",image:image("photo-1583337130417-3346a1be7dee")},
 {href:"/search?q=sports%20outdoors",title:"Sports & Outdoors",image:image("photo-1461896836934-ffe607ba8211")},
 {href:"/gifts",title:"Gifts & Occasions",image:image("photo-1549465220-1a8b9238cd48")}
] as const;

export default function StorefrontQuickLinks(){
 return <section className={styles.section} aria-label="Shop by department">
   <div className="shell">
    <nav className={styles.grid} aria-label="Popular shopping departments">
      {departments.map(({href,title,image:src})=><Link href={href} key={href} className={styles.card}>
        <span className={styles.photo} style={{backgroundImage:`url("${src}")`}} aria-hidden="true"/>
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
