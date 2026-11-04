"use client";
import {useState} from "react";
import Link from "next/link";
import styles from "./cards.module.css";
type Item={id:string;title:string;brand:string|null;category_path:string|null;price:number|string|null;currency:string;image_url:string|null;availability:string|null;model:string|null;ean:string|null};
function imageFromTooledUp(raw:string|null){
 if(!raw)return null;
 try{
  const u=new URL(raw);
  return u.protocol==="https:"&&u.hostname==="www.tooled-up.com"&&!u.username&&!u.password?u.href:null;
 }catch{return null;}
}
export default function TooledUpCards({items}:{items:Item[]}){
 const [images,setImages]=useState(false);
 const [broken,setBroken]=useState<string[]>([]);
 return <section className={styles.root}>
  <div className={styles.imageControls}>
   <div><strong>Private product photography</strong><p style={{fontSize:13,margin:"4px 0",color:"#695f73"}}>Images load directly from Tooled-Up only after you choose to inspect them. Publication rights are not confirmed.</p></div>
   <button type="button" onClick={()=>setImages(v=>!v)} aria-pressed={images} style={{padding:"11px 15px",border:"1px solid #6749ab",borderRadius:9,background:"#fff",fontWeight:700}}>{images?"Hide images":"Show imported images privately"}</button>
  </div>
  {items.length===0?<p>No staged products match these filters. Try another brand or department.</p>:
  <div className={styles.grid}>
   {items.map(item=>{
    const img=images&&!broken.includes(item.id)?imageFromTooledUp(item.image_url):null;
    return <article key={item.id} className={styles.card}>
     <div className={styles.art}>
      {img?<img src={img} alt={item.title} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBroken(old=>[...old,item.id])} className={styles.photo}/>:<span style={{textAlign:"center",fontSize:12,color:"#81798b"}}>{images?"Image unavailable / cannot be loaded":"Merchant image hidden"}</span>}
     </div>
     <div className={styles.copy}>
      <span style={{fontSize:12,color:"#6b5693",fontWeight:800}}>{item.brand||"Brand not supplied"}</span>
      <h2 className={styles.title}>{item.title}</h2>
      <span style={{fontSize:12,color:"#74707b"}}>{item.category_path?.split(" > ").slice(0,3).join(" › ")||"Unclassified"}</span>
      {item.model&&<span style={{fontSize:12}}>Model: {item.model}</span>}
      {item.ean&&<span style={{fontSize:12}}>EAN: {item.ean}</span>}
      {item.availability&&<span style={{fontSize:12}}>Feed stock: {item.availability} (unverified)</span>}
      <strong>{item.price===null?"Price missing":`£${Number(item.price).toFixed(2)}`}</strong>
      <small style={{color:"#756f7e"}}>Historical feed price, not a current offer</small>
      <Link className={styles.detail} href={`/preview/products/${item.id}`}>Inspect product details</Link>
     </div>
    </article>;
   })}
  </div>}
 </section>;
}
