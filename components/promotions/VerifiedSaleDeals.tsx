import Link from "next/link";
import {connection} from "next/server";
import {ArrowRight,ShieldCheck,Package} from "lucide-react";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import {cardDescription,hasObservedReduction} from "../../lib/products/listing-description";
import styles from "./VerifiedSaleDeals.module.css";

const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export default async function VerifiedSaleDeals(){
 await connection();
 const rows=await verifiedProductIndex(60);
 const deals=rows.flatMap(item=>{
  const eligible=item.offers.filter(o=>hasObservedReduction(o.published)).sort((a,b)=>
    Number(a.offer.total_price??a.offer.price)-Number(b.offer.total_price??b.offer.price));
  const offer=eligible[0];
  return offer?[{item,offer}]:[];
 }).slice(0,8);
 return <section className={styles.section} aria-labelledby="verified-sale-heading">
  <div className="shell">
   <div className={styles.heading}><div><p>Price-history and retailer evidence</p>
     <h2 id="verified-sale-heading">Independently checked price reductions</h2>
     <span>These products have eligible retailer offers and supporting AVUQO price evidence. Advertiser-announced promotions above are a separate list.</span>
    </div><Link href="/live">See more eligible offers <ArrowRight size={16}/></Link></div>
   {deals.length?<div className={styles.grid}>
    {deals.map(({item,offer})=>{
     const image=item.offers.find(o=>o.published.image_url)?.published.image_url;
     return <article key={item.product.id} className={styles.card}>
      <Link href={`/products/${item.product.slug}`}>
       <div className={styles.art}>{image?<img src={image} loading="lazy" alt="" referrerPolicy="no-referrer"/>:<Package size={30} aria-hidden="true"/>}</div>
       <div className={styles.body}>
        <small>{offer.published.category} · {offer.published.merchant}</small>
        <h3>{item.product.canonical_title}</h3>
        <p>{cardDescription(item.product.description,180)}</p>
        <div className={styles.price}><strong>{gbp(Number(offer.offer.total_price??offer.offer.price))}</strong>
         <span>Observed reference {gbp(Number(offer.published.typical_price))}</span>
        </div>
        <span className={styles.saved}>Evidence-backed reduction · {gbp(Number(offer.published.saving_amount))} below reference</span>
        <strong className={styles.link}>View product &amp; compare <ArrowRight size={15}/></strong>
       </div>
      </Link>
     </article>;
    })}
   </div>:<p className={styles.empty}>No independently verified current price reductions are ready for this shelf. You can still explore the separately labelled retailer-announced sales above.</p>}
   <p className={styles.disclosure}><ShieldCheck size={16}/> Reference prices are historical or comparison evidence, not a promise of an equivalent previous shop price. Stock, delivery and final checkout prices can change.</p>
  </div>
 </section>;
}
