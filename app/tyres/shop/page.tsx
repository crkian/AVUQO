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
type SizeFacet={width:number;profile:number;rim:number;listing_count:number|string};
const range=(start:number,end:number)=>Array.from({length:end-start+1},(_,i)=>i+start);
const bounds={width:range(125,385),profile:range(20,95),rim:range(10,26)};
async function sizeFacets():Promise<SizeFacet[]>{
 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tyres_uk_size_facets");
  return error||!Array.isArray(data)?[]:(data as SizeFacet[]).filter(f=>bounds.width.includes(f.width)&&bounds.profile.includes(f.profile)&&bounds.rim.includes(f.rim)&&Number(f.listing_count)>0);
 }catch{return [];}
}
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
 const w=bounds.width.includes(Number(q.width))?Number(q.width):null;
 const p=bounds.profile.includes(Number(q.profile))?Number(q.profile):null;
 const r=bounds.rim.includes(Number(q.rim))?Number(q.rim):null;
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
 const [entries,facets]=await Promise.all([params.valid?products(params.w,params.p,params.r,params.page):Promise.resolve([]),sizeFacets()]);
 const sizes={width:[...new Set(facets.map(f=>f.width))],profile:[...new Set(facets.map(f=>f.profile))],rim:[...new Set(facets.map(f=>f.rim))]};
 const selected={width:params.w,profile:params.p,rim:params.r};
 for(const key of ["width","profile","rim"] as const){
  const value=selected[key];
  if(value&&!sizes[key].includes(value))sizes[key].push(value);
  sizes[key].sort((a,b)=>a-b);
 }
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
   <p className={styles.count}>{facets.length?facets.length+" current supplier size combinations":"Current size inventory unavailable; use an exact size link or try again."}</p>
   <form method="get" action="/tyres/shop" className={styles.filters}>
    {(["width","profile","rim"] as const).map(name=>
     <label key={name}>{name==="width"?"Width (mm)":name==="profile"?"Profile (%)":"Rim (inches)"}
      <select name={name} defaultValue={raw[name]??""}>
       <option value="">Choose {name}</option>
       {(sizes[name].length?sizes[name]:bounds[name]).map(n=><option value={n} key={n}>{name==="rim"?"R":""}{n}</option>)}
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
      <p style={{fontSize:12,lineHeight:1.6}}>Supplier-listed {t.brand??"tyre"} item. Confirm exact tyre size, load/speed rating and fitting charges with the retailer. The source price is per tyre, not a fitted total.</p>
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
