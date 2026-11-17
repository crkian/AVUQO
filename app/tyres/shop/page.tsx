import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {createAdminClient} from "../../../lib/supabase/admin";
import styles from "./page.module.css";

export const instant=false;
export const metadata:Metadata={
 title:"Shop tyres by size | Verified UK retailer prices | AVUQO",
 description:"Browse exact supplier tyre SKUs and current GBP unit prices. Size and final vehicle fitment must be independently confirmed.",
 alternates:{canonical:"/tyres/shop"}
};
type Filters={width?:string;profile?:string;rim?:string;page?:string};
type Tyre={sku:string;title:string;brand:string|null;price:number|string;
 image_url:string;affiliate_url:string;images:unknown;width:number|null;
 profile:number|null;rim:number|null;supplier_category:string|null;observed_at:string};
const sizes={width:[155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305],
 profile:[30,35,40,45,50,55,60,65,70,75,80],
 rim:[13,14,15,16,17,18,19,20,21,22]};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{currency:"GBP",style:"currency"}).format(n);
const validImage=(s:unknown):s is string=>typeof s==="string"&&s.length<2049&&
 /^https:\/\/(static[.]tyres[.]net|images2[.]productserve[.]com)\//.test(s);
const validAffiliate=(s:unknown):s is string=>{
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
function queryParams(q:Filters){
 const w=sizes.width.includes(Number(q.width))?Number(q.width):null;
 const p=sizes.profile.includes(Number(q.profile))?Number(q.profile):null;
 const r=sizes.rim.includes(Number(q.rim))?Number(q.rim):null;
 const sizeSpecified=Boolean(q.width||q.profile||q.rim);
 const valid=!sizeSpecified||Boolean(w&&p&&r);
 const rawPage=Number(q.page??"1");
 const page=Number.isSafeInteger(rawPage)&&rawPage>=1&&rawPage<=2000?rawPage:1;
 return {w,p,r,page,valid};
}
async function products(w:number|null,p:number|null,r:number|null,page:number):Promise<Tyre[]>{
 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tyres_uk_shop",{
   p_width:w,p_profile:p,p_rim:r,p_limit:49,p_offset:(page-1)*48
  });
  if(error||!Array.isArray(data))return [];
  return data.filter((x:Tyre)=>typeof x.sku==="string"&&x.sku.length>0&&
   Number(x.price)>0&&validImage(x.image_url)&&validAffiliate(x.affiliate_url));
 }catch{return [];}
}
export default async function TyreShop({searchParams}:{searchParams:Promise<Filters>}){
 await connection();
 const raw=await searchParams,params=queryParams(raw);
 const entries=params.valid?await products(params.w,params.p,params.r,params.page):[];
 const next=entries.length>48,shown=entries.slice(0,48);
 const href=(n:number)=>{
  const sp=new URLSearchParams();
  if(params.w&&params.p&&params.r){
   sp.set("width",String(params.w));sp.set("profile",String(params.p));sp.set("rim",String(params.r));
  }
  sp.set("page",String(n));return "/tyres/shop?"+sp.toString();
 };
 return <main className={styles.page}><Header/>
  <div className={styles.wrap}>
   <nav className={styles.breadcrumb}><Link href="/tyres">Tyres</Link><span>/</span><strong>Shop retailer tyres</strong></nav>
   <p className={styles.eyebrow}>SOURCE-VERIFIED SHOPPING · NOT A FITMENT SERVICE</p>
   <h1>Find the exact tyre size.</h1>
   <p className={styles.lead}>Browse supplier tyre SKUs with current authenticated GBP unit prices, genuine source photographs and tracked retailer links. Check the full specification and suitability for your vehicle before buying.</p>
   <form method="get" action="/tyres/shop" className={styles.filters}>
    {(["width","profile","rim"] as const).map(name=>
     <label key={name}>{name==="width"?"Width (mm)":name==="profile"?"Profile (%)":"Rim (inches)"}
      <select name={name} defaultValue={raw[name]??""}>
       <option value="">Choose {name}</option>
       {sizes[name].map(n=><option value={n} key={n}>{name==="rim"?"R":""}{n}</option>)}
      </select>
     </label>)}
    <button type="submit">Find exact size</button>
    <Link href="/tyres/shop">All available sizes</Link>
   </form>
   {!params.valid&&<p role="alert" className={styles.notice}>Select all three dimensions, or clear all filters. A partial size is not a complete tyre match.</p>}
   <p className={styles.notice}><strong>Important:</strong> Supplier product prices exclude delivery, fitting, balancing, valves and disposal unless the retailer confirms those charges. A matching tyre size alone does not certify vehicle fitment, load or speed requirements. Products shown here are retailer listings, not AVUQO-scored deals.</p>
   <p className={styles.count}>{shown.length} currently source-verified products on this page</p>
   {shown.length?<section className={styles.grid}>
    {shown.map(t=><article key={t.sku} className={styles.card}>
     <Link href={"/tyres/shop/"+encodeURIComponent(t.sku)} className={styles.photo}>
      <img src={t.image_url} alt={t.title} loading="lazy" referrerPolicy="no-referrer"/>
     </Link>
     <div className={styles.body}>
      <small>{t.brand??"Tyres UK"} · Tyres.net</small>
      <h2><Link href={"/tyres/shop/"+encodeURIComponent(t.sku)}>{t.title}</Link></h2>
      <p>{t.width&&t.profile&&t.rim? `${t.width}/${t.profile} R${t.rim}`:"Full size needs confirmation"}</p>
      <small>Exact source SKU {t.sku}</small>
      <strong>{money(Number(t.price))} <small>/ tyre</small></strong>
      <Link className={styles.details} href={"/tyres/shop/"+encodeURIComponent(t.sku)}>View exact product and supplier photos</Link>
      <a className={styles.retailer} target="_blank" rel="sponsored nofollow noopener noreferrer" href={t.affiliate_url}>View at Tyres.net</a>
     </div>
    </article>)}
   </section>:<div className={styles.empty}>No currently verified retailer products match that size. The authenticated supplier feed is rechecked regularly. Check again after the next source cycle.</div>}
   {params.valid&&<nav className={styles.pagination} aria-label="Tyre product pages">
    {params.page>1&&<Link href={href(params.page-1)}>Previous</Link>}
    <span>Page {params.page}</span>
    {next&&<Link href={href(params.page+1)}>Next</Link>}
   </nav>}
  </div><Footer/></main>;
}
