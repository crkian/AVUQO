"use client";
import {useState} from "react";
import Link from "next/link";
import styles from "./private-storefront.module.css";
type Sample={id:string;title:string;brand:string|null;image_url:string|null;merchant_id:string;merchant_name:string;price:number|string|null;currency:string;category:string|null};
const hosts=new Set(["www.tooled-up.com","www.cadburygiftsdirect.co.uk","cdn.shopify.com"]);
function privateImage(value:string|null){
 if(!value)return null;
 try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&hosts.has(u.hostname)?u.href:null;}
 catch{return null;}
}
export default function PrivateStorefrontImages({items}:{items:Sample[]}){
 const [visible,setVisible]=useState(false);
 const [broken,setBroken]=useState<string[]>([]);
 return <div className={styles.galleryRoot}>
  <div className={styles.imageControls}>
   <span><strong>Owner image inspection</strong><small>Merchant photographs remain hidden by default and are not licensed for public use.</small></span>
   <button type="button" aria-pressed={visible} onClick={()=>setVisible(x=>!x)}>
    {visible?"Hide imported photographs":"Show imported photographs privately"}
   </button>
  </div>
  <div className={styles.productGrid}>{items.map(item=>{
   const image=visible&&!broken.includes(item.id)?privateImage(item.image_url):null;
   return <article className={styles.productCard} key={item.id}>
    <div className={styles.productArt}>
     {image?<img src={image} alt={item.title} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBroken(x=>x.includes(item.id)?x:[...x,item.id])}/>:<span>{visible?"Image unavailable":"Photograph hidden for private review"}</span>}
    </div>
    <div className={styles.productCopy}>
     <span className={styles.productMerchant}>{item.merchant_name}</span>
     <span className={styles.productBrand}>{item.brand||"Retailer brand not supplied"}</span>
     <h3>{item.title}</h3>
     <span className={styles.productCategory}>{item.category||"Category review needed"}</span>
     <strong>{item.currency==="GBP"&&item.price!==null?`£${Number(item.price).toFixed(2)}`:"Price unavailable"}</strong>
     <small>Historical feed price · not a current offer</small>
     <Link href={`/preview/products/${item.id}`}>Inspect product details →</Link>
    </div>
   </article>;
  })}</div>
 </div>;
}
