import Link from "next/link";
import {ArrowRight,Grid3X3,ShoppingBag,Store} from "lucide-react";
import styles from "./CatalogueGateway.module.css";

/** Adds two clear catalogues without replacing existing AVUQO category cards or home shopping. */
export default function CatalogueGateway({compact=false}:{compact?:boolean}){
 return <section className={styles.section+(compact?" "+styles.compact:"")} aria-label="Browse AVUQO catalogues">
  <div className="shell">
   <div className={styles.heading}><div><p>THE AVUQO RETAIL PARK</p><h2>Find a product. Or find your shop.</h2>
    <span>One familiar shopping experience, with all 25 original departments and an individual page for each participating advertiser.</span></div>
    <Link href="/catalogue">Everything AVUQO offers <ArrowRight size={15}/></Link>
   </div>
   <div className={styles.links}>
    <Link href="/products" className={styles.card}><span><ShoppingBag size={24}/></span><strong>Product catalogue</strong><small>Browse independently eligible products, guides and live retailer offers.</small><b>Shop products <ArrowRight size={16}/></b></Link>
    <Link href="/partners" className={styles.card}><span><Store size={24}/></span><strong>Retailer catalogue</strong><small>Find a retailer or service, including an individual shop page for each advertiser.</small><b>Browse shops <ArrowRight size={16}/></b></Link>
    <Link href="/categories" className={styles.card}><span><Grid3X3 size={24}/></span><strong>All 25 departments</strong><small>The same AVUQO categories, topics, specialist pages and buying advice.</small><b>Browse categories <ArrowRight size={16}/></b></Link>
   </div>
  </div>
 </section>;
}
