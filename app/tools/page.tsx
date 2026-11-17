import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {createAdminClient} from "../../lib/supabase/admin";
import styles from "./page.module.css";

// Authenticated source recency must be evaluated on each request, not during static prerender.
export const instant = false;
export const metadata:Metadata={
 title:"Verified Tools & DIY Products | AVUQO",
 description:"Browse Tooled Up products with recently authenticated Awin prices, supplier photos and tracked shopping links. Product prices exclude unverified delivery charges.",
 alternates:{canonical:"/tools"},
 robots:{index:true,follow:true}
};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
type Product={sku:string;title:string;price:number|string;category_name:string|null;
 image_url:string;affiliate_url:string;images:unknown;feed_observed_at:string};
const safeImage=(value:string)=>typeof value==="string"&&
 /^https:\/\/(www[.]tooled-up[.]com|images2[.]productserve[.]com)\//.test(value)&&value.length<=2048;
const safeLink=(value:string)=>typeof value==="string"&&value.length<=2400&&
 /^https:\/\/www[.]awin1[.]com\/pclick[.]php[?]/.test(value)&&
 /[?&]m=496(&|$)/.test(value)&&/[?&]a=3135746(&|$)/.test(value)&&
 /[?&]p=[^&]+/.test(value);
async function liveCatalogue():Promise<Product[]>{
 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tooled_up_catalogue",{
   p_limit:100,p_offset:0
  });
  if(error||!Array.isArray(data))return [];
  return data.filter((p:Product)=>p&&typeof p.title==="string"&&
   p.title.trim().length>0&&Number.isFinite(Number(p.price))&&Number(p.price)>0&&
   safeImage(p.image_url)&&safeLink(p.affiliate_url));
 }catch{return [];}
}
export default async function ToolsPage(){
 await connection();
 const entries=await liveCatalogue();
 const freshest=entries.length?new Date(entries[0].feed_observed_at):null;
 const seenAt=freshest&&Number.isFinite(freshest.getTime())
  ?new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}).format(freshest):null;
 return <main className={styles.page}>
  <Header/>
  <div className={styles.wrap}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/categories">Categories</Link><span>/</span><strong>Tools &amp; DIY</strong></nav>
   <section className={styles.intro}>
    <p className={styles.eyebrow}>AVUQO VERIFIED RETAIL CATALOGUE</p>
    <h1>Tools, materials &amp; work essentials</h1>
    <p>Real supplier products, with product prices and images checked against the authorised Tooled Up Awin feed. Browse the current listings without mistaking an ordinary price for a special deal.</p>
    <div className={styles.meta}>
     <span>{entries.length?entries.length+" verified products shown":"Awaiting the next authenticated update"}</span>
     {seenAt&&<span>Feed last authenticated: {seenAt} UK</span>}
    </div>
   </section>
   {entries.length===0?<section className={styles.empty} role="status">
    <h2>No currently verified tools to display</h2>
    <p>Products are hidden when the authenticated supplier-feed evidence is too old or the publication controls do not pass. The private catalogue is still being refreshed.</p>
    <Link href="/categories">Explore other departments</Link>
   </section>:<>
    <p className={styles.disclosure}>These are verified supplier product listings, <strong>not AVUQO-scored deals</strong>. Prices are in GBP for the product alone; delivery, any options and final availability must be checked with Tooled Up before purchase. Links are affiliate links and may earn AVUQO a commission.</p>
    <section className={styles.grid} aria-label="Current supplier product listings">
     {entries.map(product=><article className={styles.card} key={product.sku}>
      <div className={styles.photo}>
       {/* The supplied image is an authorised original feed URL, not a substitute. */}
       <img src={product.image_url} alt={product.title} loading="lazy" referrerPolicy="no-referrer"/>
      </div>
      <div className={styles.body}>
       <span className={styles.category}>{product.category_name??"Tools & DIY"} · Tooled Up</span>
       <h2>{product.title}</h2>
       <p className={styles.sku}>Supplier SKU {product.sku}</p>
       <strong className={styles.price}>{money(Number(product.price))}</strong>
       <p className={styles.delivery}>Product price · delivery calculated by retailer</p>
       <a className={styles.visit} href={product.affiliate_url} target="_blank"
         rel="sponsored nofollow noopener noreferrer">View at Tooled Up <span aria-hidden="true">↗</span></a>
      </div>
     </article>)}
    </section>
   </>}
  </div>
  <Footer/>
 </main>;
}
