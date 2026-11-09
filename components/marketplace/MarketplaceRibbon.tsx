"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Compass,ShoppingBag,Scale,Users,Grid3X3} from "lucide-react";
import styles from "../../app/marketplace/marketplace.module.css";
const entries=[
 {href:"/marketplace",label:"Explore",Icon:Compass},
 {href:"/products",label:"Shop",Icon:ShoppingBag},
 {href:"/marketplace/compare",label:"Compare",Icon:Scale},
 {href:"/whos-who",label:"Who's Who",Icon:Users},
 {href:"/categories",label:"25 categories",Icon:Grid3X3}
];
export default function MarketplaceRibbon(){
 const path=usePathname();
 return <nav className={styles.marketRibbon} aria-label="Marketplace journeys">
  <div className={styles.shell+" "+styles.marketLinks}>
   <span>AVUQO MARKETPLACE</span>
   {entries.map(({href,label,Icon})=><Link href={href} key={href}
    aria-current={path===href?"page":undefined}><Icon size={14} aria-hidden="true"/>{label}</Link>)}
  </div>
 </nav>;
}
