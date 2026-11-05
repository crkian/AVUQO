import Link from "next/link";
import {ArrowRight, Package, ShieldCheck} from "lucide-react";
import type {PublicProduct,PublicOffer} from "../../lib/products/public-catalog";
import styles from "./VerifiedProductCards.module.css";

export type VerifiedProductEntry={product:PublicProduct;offers:PublicOffer[]};

const money=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value);
function cost(row:PublicOffer){return Number(row.offer.total_price??row.offer.price);}

export default function VerifiedProductCards({items}:{items:VerifiedProductEntry[]}){
  return <div className={styles.grid}>
    {items.map(({product,offers})=>{
      const sorted=[...offers].sort((a,b)=>cost(a)-cost(b));
      const best=sorted[0];
      if(!best)return null;
      // Only the public admission gate may authorise a product photo.
      // Never use products.primary_image_url without checking image rights.
      const image=sorted.find(row=>row.published.image_url)?.published.image_url??null;
      const merchants=new Set(sorted.map(row=>row.published.merchant)).size;
      const score=Number(best.published.avuqo_score);
      const scoreVisible=Number.isFinite(score)&&score>=0&&score<=100;
      return <article className={styles.card} key={product.id}>
        <Link className={styles.productLink} href={`/products/${product.slug}`} aria-label={`Explore ${product.canonical_title}`}>
          <div className={styles.art}>
            {image?<img src={image} alt="" loading="lazy" referrerPolicy="no-referrer"/>:
              <div className={styles.placeholder}><Package size={47} aria-hidden="true"/><span>Photo not verified for publication</span></div>}
            <span className={styles.checked}><ShieldCheck size={13} aria-hidden="true"/> Eligible offers</span>
          </div>
          <div className={styles.copy}>
            <p className={styles.brand}>{product.brand??"Product guide"}</p>
            <h3>{product.canonical_title}</h3>
            <div className={styles.valueRow}><div><span>From an eligible observed offer</span><strong>{money(cost(best))}</strong></div>
              {scoreVisible&&<div className={styles.score}><strong>{Math.round(score)}</strong><small>AVUQO<br/>Score</small></div>}
            </div>
            <p className={styles.merchant}>{merchants} verified {merchants===1?"retailer":"retailers"} · {offers.length} eligible {offers.length===1?"offer":"offers"}</p>
            <span className={styles.action}>Compare this product <ArrowRight size={16} aria-hidden="true"/></span>
          </div>
        </Link>
      </article>;
    })}
  </div>;
}
