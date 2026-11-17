import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {createAdminClient} from "../../../lib/supabase/admin";
import styles from "./page.module.css";

export const instant=false;
type Props={params:Promise<{sku:string}>};
type Product={sku:string;title:string;price:number|string;category_name:string|null;
 image_url:string;affiliate_url:string;images:unknown;feed_observed_at:string};
const price=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
const allowedImage=(s:unknown):s is string=>typeof s==="string"&&s.length<=2048&&
 /^https:\/\/(www[.]tooled-up[.]com|images2[.]productserve[.]com)\//.test(s);
const allowedLink=(s:unknown):s is string=>typeof s==="string"&&s.length<=2400&&
 /^https:\/\/www[.]awin1[.]com\/pclick[.]php[?]/.test(s)&&
 /[?&]m=496(&|$)/.test(s)&&/[?&]a=3135746(&|$)/.test(s)&&/[?&]p=[^&]+/.test(s);
const gallery=(row:Product)=>{
 const images=[row.image_url],seen=new Set(images);
 if(Array.isArray(row.images))for(const item of row.images.slice(0,40)){
  const url=item&&typeof item==="object"&&!Array.isArray(item)?
   (item as Record<string,unknown>).url:null;
  if(allowedImage(url)&&!seen.has(url)){images.push(url);seen.add(url);}
  if(images.length>=24)break;
 }
 return images;
};
async function verifiedProduct(sku:string):Promise<Product|null>{
 if(!sku||sku.length>250||/[\u0000-\u001f\u007f]/.test(sku))return null;
 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tooled_up_product",{p_sku:sku});
  if(error||!Array.isArray(data)||data.length!==1)return null;
  const row=data[0] as Product;
  if(row.sku!==sku||typeof row.title!=="string"||!row.title.trim()||
    !Number.isFinite(Number(row.price))||Number(row.price)<=0||
    !allowedImage(row.image_url)||!allowedLink(row.affiliate_url))return null;
  return row;
 }catch{return null;}
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 await connection();
 const {sku}=await params;
 const item=await verifiedProduct(sku);
 if(!item)return {title:"Tool currently unavailable | AVUQO",robots:{index:false,follow:false}};
 return {title:`${item.title} | Tooled Up | AVUQO`,
  description:`See the authenticated Tooled Up supplier product price for ${item.title}, original photos and retailer availability information.`,
  alternates:{canonical:`/tools/${encodeURIComponent(item.sku)}`},
  robots:{index:true,follow:true}};
}
export default async function ToolDetail({params}:Props){
 await connection();
 const {sku}=await params;
 const item=await verifiedProduct(sku);
 if(!item)notFound();
 const photos=gallery(item);
 const lastSeen=new Date(item.feed_observed_at);
 const observed=Number.isFinite(lastSeen.getTime())
  ?new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}).format(lastSeen)
  :null;
 return <main className={styles.page}>
  <Header/>
  <div className={styles.wrap}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <Link href="/">Home</Link><span>/</span><Link href="/tools">Tools &amp; DIY</Link><span>/</span><strong>Product</strong>
   </nav>
   <section className={styles.product}>
    <div className={styles.visual}>
     <div className={styles.photo}><img src={item.image_url} alt={item.title} referrerPolicy="no-referrer"/></div>
     {photos.length>1&&<div className={styles.thumbnails} aria-label="Supplier product photos">
      {photos.map((url,i)=><a href={url} key={url} target="_blank" rel="noopener noreferrer"
       aria-label={`Open supplier image ${i+1} of ${photos.length}`}>
       <img src={url} alt={`${item.title}, supplied view ${i+1}`} loading="lazy" referrerPolicy="no-referrer"/>
      </a>)}
     </div>}
    </div>
    <div className={styles.info}>
     <p className={styles.eyebrow}>VERIFIED SUPPLIER PRODUCT · TOOled UP</p>
     <h1>{item.title}</h1>
     <p className={styles.category}>{item.category_name??"Tools & DIY"} · Supplier SKU {item.sku}</p>
     <div className={styles.price}><small>Current feed product price</small><strong>{price(Number(item.price))}</strong></div>
     <p>Product-only price. Delivery and final availability are confirmed by Tooled Up at checkout.</p>
     {observed&&<p className={styles.checked}>Awin supplier feed last authenticated: {observed} UK</p>}
     <a href={item.affiliate_url} target="_blank" rel="sponsored nofollow noopener noreferrer"
       className={styles.button}>View product at Tooled Up <span aria-hidden="true">↗</span></a>
     <p className={styles.disclosure}>This is a source-verified retailer listing, not an AVUQO-scored bargain. AVUQO may receive a commission from your visit, at no additional charge to you.</p>
     <Link href="/tools" className={styles.back}>Browse other verified tools</Link>
    </div>
   </section>
  </div>
  <Footer/>
 </main>;
}
