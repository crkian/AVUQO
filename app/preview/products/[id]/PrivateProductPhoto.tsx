"use client";
import {useState} from "react";
import styles from "./detail.module.css";
const allowed=new Set(["cdn.shopify.com","www.cadburygiftsdirect.co.uk","www.tooled-up.com"]);
function safeImage(input:string|null){if(!input)return null;try{const u=new URL(input);return u.protocol==="https:"&&allowed.has(u.hostname)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export default function PrivateProductPhoto({url,title}:{url:string|null;title:string}){
 const [visible,setVisible]=useState(false);
 const image=visible?safeImage(url):null;
 return <div className={styles.photobox}>
  {image?<img src={image} alt={title} loading="lazy" referrerPolicy="no-referrer" className={styles.productPhoto}/>:<div className={styles.placeholder}><strong>Q</strong><span>{visible?"Image unavailable from recognised feed host":"Merchant photograph hidden until requested"}</span></div>}
  <button type="button" aria-pressed={visible} onClick={()=>setVisible(x=>!x)}>{visible?"Hide private image":"View private feed image"}</button>
  <small>Owner-only inspection · Image reuse rights not confirmed</small>
 </div>;
}
