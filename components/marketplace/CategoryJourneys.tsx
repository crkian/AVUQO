import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {departmentBySlug} from "../../lib/categories/browse-tree";
import {departmentJourneys} from "../../lib/marketplace/journeys";
import styles from "./CategoryJourneys.module.css";
export default function CategoryJourneys({slug}:{slug:string}){
 const department=departmentBySlug(slug);
 const paths=department?departmentJourneys(department):
  {explore:"/categories",shop:"/products",compare:"/marketplace/compare",whosWho:"/whos-who"};
 const cards=[
  {title:"Explore",desc:"Ideas and expertise",href:paths.explore},
  {title:"Shop",desc:"Eligible products only",href:paths.shop},
  {title:"Compare",desc:"Like-for-like evidence",href:paths.compare},
  {title:"Who's Who",desc:"Meet the makers and sellers",href:paths.whosWho}
 ];
 return <section className={styles.wrap} aria-label="Four ways to explore this category">
  <div className="shell">
   <div className={styles.intro}><div><span>ONE AVUQO MARKETPLACE</span><h2>However you like to shop.</h2></div>
    <Link href="/marketplace">Explore the whole marketplace <ArrowRight size={16}/></Link></div>
   <div className={styles.grid}>{cards.map((card,i)=><Link href={card.href} className={styles.card} key={card.title}>
    <small>0{i+1}</small><strong>{card.title}</strong><span>{card.desc}</span><ArrowRight size={17} aria-hidden="true"/></Link>)}</div>
   <p className={styles.note}>Editorial browsing does not establish a supplier relationship. Offers and prices appear only when verified and approved for public display.</p>
  </div>
 </section>;
}
