import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {createAdminClient} from "../../../../lib/supabase/admin";
import ProductGallery from "../../../../components/products/ProductGallery";
import styles from "./page.module.css";
export const instant=false;
type Params={params:Promise<{sku:string}>};
type Tyre={sku:string;title:string;brand:string|null;price:number|string;
 image_url:string;affiliate_url:string;images:unknown;
 width:number|null;profile:number|null;rim:number|null;observed_at:string};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
const photo=(s:unknown):s is string=>typeof s==="string"&&s.length<=2048&&
 /^https:\/\/(static[.]tyres[.]net|images2[.]productserve[.]com)\//.test(s);
const link=(s:unknown):s is string=>{
 if(typeof s!=="string"||s.length>2400)return false;
 try{
  const u=new URL(s);
  return u.protocol==="https:"&&["awin1.com","www.awin1.com"].includes(u.hostname)&&
   ((u.pathname==="/pclick.php"&&u.searchParams.get("m")==="12715"&&
    u.searchParams.get("a")==="3135746"&&!!u.searchParams.get("p"))||
    (u.pathname==="/cread.php"&&u.searchParams.get("awinmid")==="12715"&&
    u.searchParams.get("awinaffid")==="3135746"));
 }catch{return false;}
};
async function verified(sku:string):Promise<Tyre|null>{
 if(!sku||sku.length>250||/[\u0000-\u001f\u007f]/.test(sku))return null;
 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tyres_uk_product",{p_sku:sku});
  if(error||!Array.isArray(data)||data.length!==1)return null;
  const x=data[0] as Tyre;
  if(x.sku!==sku||!x.title||Number(x.price)<=0||!photo(x.image_url)||!link(x.affiliate_url))return null;
  return x;
 }catch{return null;}
}
export async function generateMetadata({params}:Params):Promise<Metadata>{
 await connection();const {sku}=await params,x=await verified(sku);
 if(!x)return {title:"Tyre currently unavailable | AVUQO",robots:{index:false,follow:false}};
 return {title:`${x.title} | Tyres UK | AVUQO`,
  description:`Verified Tyres UK retailer unit price and photographs for exact SKU ${x.sku}. Confirm vehicle suitability, load, speed, delivery and fitting with the retailer.`,
  alternates:{canonical:`/tyres/shop/${encodeURIComponent(sku)}`},
  robots:{index:true,follow:true}};
}
export default async function Page({params}:Params){
 await connection();const {sku}=await params,x=await verified(sku);
 if(!x)notFound();
 const extras: string[]=[],seen=new Set<string>([x.image_url]);
 if(Array.isArray(x.images))for(const item of x.images.slice(0,40)){
  const u=item&&typeof item==="object"&&!Array.isArray(item)?(item as Record<string,unknown>).url:null;
  if(photo(u)&&!seen.has(u)){seen.add(u);extras.push(u);}
  if(extras.length>=23)break;
 }
 const size=x.width&&x.profile&&x.rim?`${x.width}/${x.profile} R${x.rim}`:"Size requires confirmation";
 const observed=new Date(x.observed_at);
 const check=Number.isFinite(observed.getTime())?new Intl.DateTimeFormat("en-GB",{
  dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}).format(observed):"unavailable";
 return <main className={styles.page}><Header/><div className={styles.wrap}>
  <nav className={styles.breadcrumb}><Link href="/tyres">Tyres</Link> / <Link href="/tyres/shop">Shop tyres</Link> / Exact SKU</nav>
  <section className={styles.grid}>
   <div className={styles.visual}><ProductGallery images={[x.image_url,...extras]} title={x.title}/></div>
   <div className={styles.info}>
    <p className={styles.kicker}>LIVE RETAILER LISTING · TYRES UK / TYRES.NET</p>
    <h1>{x.title}</h1>
    <p className={styles.size}>{size}</p>
    <p>Supplier-listed {x.brand??"tyre"} product for size {size}. Verify the exact load, speed, season and reinforced/run-flat markings against your vehicle requirements before purchase.</p>
    <p>{x.brand??"Supplier manufacturer unspecified"} · exact supplier SKU {x.sku}</p>
    <div className={styles.price}><small>Retailer product price per tyre</small><strong>{money(Number(x.price))}</strong></div>
    <p>Delivery, fitting, balancing, valves and disposal are <strong>not included or verified</strong> in this unit price.</p>
    <p>Authenticated feed last observed: {check} UK.</p>
    <a href={x.affiliate_url} target="_blank" rel="sponsored nofollow noopener noreferrer"
     className={styles.button}>See this exact tyre at Tyres.net</a>
    <p className={styles.warning}><strong>Safety and fitment:</strong> A supplier-size match is not vehicle approval. Check the vehicle handbook or tyre placard and required load/speed ratings, XL/run-flat/season markings and installed total with the retailer or qualified fitter. Those technical properties are not independently verified by this shopping listing.</p>
    <p className={styles.disclosure}>This is an authenticated supplier listing, not an AVUQO-scored deal. AVUQO may earn commission when you visit the retailer.</p>
    <Link className={styles.back} href="/tyres/shop">Browse other tyre sizes</Link>
   </div>
  </section></div><Footer/></main>;
}
