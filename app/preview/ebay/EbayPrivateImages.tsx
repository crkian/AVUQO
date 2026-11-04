"use client";
import {useState} from "react";
import type {EbayPilotItem} from "../../../lib/ebay/private-uk-browse";
import styles from "./ebay-private.module.css";
export default function EbayPrivateImages({items}:{items:EbayPilotItem[]}){
 const [images,setImages]=useState(false),[failed,setFailed]=useState<string[]>([]);
 return <section className={styles.results}>
  <div className={styles.imageBar}><div><strong>eBay seller photographs</strong><p>Images remain hidden unless you choose to inspect them privately. No rights to publish them on AVUQO are implied.</p></div>
   <button type="button" aria-pressed={images} onClick={()=>setImages(v=>!v)}>{images?"Hide seller images":"Inspect seller images privately"}</button>
  </div>
  <div className={styles.grid}>{items.map(item=><article key={item.itemId} className={styles.card}>
   <div className={styles.photo}>
    {images&&item.imageUrl&&!failed.includes(item.itemId)?<img src={item.imageUrl} referrerPolicy="no-referrer" loading="lazy" alt={item.title} onError={()=>setFailed(old=>old.includes(item.itemId)?old:[...old,item.itemId])}/>:<span>{images?"Image unavailable":"Seller image hidden"}</span>}
   </div>
   <div className={styles.cardCopy}>
    <p className={styles.tag}>EBAY UK · PRIVATE API OBSERVATION</p>
    <h3>{item.title}</h3>
    {item.brand&&<p><b>Listed brand:</b> {item.brand} (unverified)</p>}
    {item.mpn&&<p><b>MPN:</b> {item.mpn}</p>}
    {item.condition&&<p><b>Condition:</b> {item.condition}</p>}
    {item.seller&&<p><b>Seller:</b> {item.seller}</p>}
    {item.categoryPath&&<p><b>Category:</b> {item.categoryPath}</p>}
    <strong className={styles.price}>{item.priceGBP===null?"GBP price unavailable":new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(item.priceGBP)}</strong>
    <small>{item.shippingGBP===null?"Delivery charge not confirmed":`Reported delivery: £${item.shippingGBP.toFixed(2)}`}</small>
    <small>{item.hasAffiliateTracking?"Affiliate reference present; publication still blocked":"Affiliate tracking not verified"}</small>
    <div className={styles.noCheckout}>Preview only · AVUQO checkout disabled</div>
   </div>
  </article>)}</div>
 </section>;
}
