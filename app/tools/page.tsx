import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {createAdminClient} from "../../lib/supabase/admin";
import {cardDescription} from "../../lib/products/listing-description";
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
type Product={sku:string;title:string;price:number|string;description?:string|null;category_name:string|null;
 image_url:string;affiliate_url:string;images:unknown;feed_observed_at:string};
const safeImage=(value:string)=>typeof value==="string"&&
 /^https:\/\/(www[.]tooled-up[.]com|images2[.]productserve[.]com)\//.test(value)&&value.length<=2048;
function productGallery(raw:unknown,primary:string):string[]{
 const items=Array.isArray(raw)?raw:[],images:string[]=[];
 const seen=new Set<string>([primary]);
 for(const value of items.slice(0,40)){
  const url=value&&typeof value==="object"&&!Array.isArray(value)?
   (value as {url?:unknown}).url:null;
  if(typeof url!=="string"||!safeImage(url)||seen.has(url))continue;
  seen.add(url);images.push(url);
  if(images.length>=24)break;
 }
 return images;
}
const safeLink=(value:string)=>typeof value==="string"&&value.length<=2400&&
 /^https:\/\/www[.]awin1[.]com\/pclick[.]php[?]/.test(value)&&
 /[?&]m=496(&|$)/.test(value)&&/[?&]a=3135746(&|$)/.test(value)&&
 /[?&]p=[^&]+/.test(value);
type BrowseParams={department?:string;page?:string};
const DEPARTMENTS=[
 {id:"all",label:"All products"},{id:"tools",label:"Tools & DIY"},
 {id:"garden",label:"Garden"},{id:"workwear",label:"Workwear"},
 {id:"home",label:"Home"},{id:"motoring",label:"Motoring"}
];
const PER_PAGE=48;
async function liveCatalogue(department:string,page:number):Promise<Product[]>{

 try{
  const {data,error}=await createAdminClient().rpc("get_verified_tooled_up_department",{
   p_department:department,p_limit:PER_PAGE+1,p_offset:(page-1)*PER_PAGE
  });
  if(error||!Array.isArray(data))return [];
  return data.filter((p:Product)=>p&&typeof p.title==="string"&&
   p.title.trim().length>0&&Number.isFinite(Number(p.price))&&Number(p.price)>0&&
   safeImage(p.image_url)&&safeLink(p.affiliate_url));
 }catch{return [];}
}
export default async function ToolsPage({searchParams}:{
 searchParams:Promise<BrowseParams>
}){
 await connection();
 const params=await searchParams;
 const department=DEPARTMENTS.some(d=>d.id===params?.department)?params.department!:"all";
 const requestedPage=Number(params?.page??"1");
 const page=Number.isSafeInteger(requestedPage)&&requestedPage>=1&&requestedPage<=2000
  ?requestedPage:1;
 const results=await liveCatalogue(department,page);
 const hasNext=results.length>PER_PAGE;
 const entries=results.slice(0,PER_PAGE);
 const href=(dept:string,number:number)=>`/tools?department=${encodeURIComponent(dept)}&page=${number}`;
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
     <span>{entries.length?entries.length+" products on this page":"Awaiting the next authenticated update"}</span>
     {seenAt&&<span>Feed last authenticated: {seenAt} UK</span>}
    </div>
   </section>
   <nav className={styles.departments} aria-label="Supplier product departments">
    {DEPARTMENTS.map(d=><Link key={d.id} href={href(d.id,1)}
     aria-current={department===d.id?"page":undefined}
     className={department===d.id?styles.departmentActive:styles.department}>{d.label}</Link>)}
   </nav>
   {entries.length===0?<section className={styles.empty} role="status">
    <h2>No currently verified tools to display</h2>
    <p>Products are hidden when the authenticated supplier-feed evidence is too old or the publication controls do not pass. The private catalogue is still being refreshed.</p>
    <Link href={href("all",1)}>Browse all currently verified supplier products</Link>
   </section>:<>
    <p className={styles.disclosure}>These are verified supplier product listings, <strong>not AVUQO-scored deals</strong>. Prices are in GBP for the product alone; delivery, any options and final availability must be checked with Tooled Up before purchase. Links are affiliate links and may earn AVUQO a commission.</p>
    <section className={styles.grid} aria-label="Current supplier product listings">
     {entries.map(product=><article className={styles.card} key={product.sku}>
      <Link href={`/tools/${encodeURIComponent(product.sku)}`} className={styles.photo} aria-label={`View ${product.title} product details on AVUQO`}>
       <img src={product.image_url} alt={product.title} loading="lazy" referrerPolicy="no-referrer"/>
      </Link>
      <div className={styles.body}>
       <span className={styles.category}>{product.category_name??"Tools & DIY"} · Tooled Up</span>
       <h2><Link href={`/tools/${encodeURIComponent(product.sku)}`} className={styles.productLink}>{product.title}</Link></h2>
       <p className={styles.sku}>Supplier SKU {product.sku}</p>
       <p style={{fontSize:12,lineHeight:1.6}}>{cardDescription(product.description,160)} Review the exact specifications and compatibility before buying.</p>
       {productGallery(product.images,product.image_url).length>0&&
        <details className={styles.gallery}>
         <summary>See all supplier photos</summary>
         <div className={styles.galleryPhotos}>
          {productGallery(product.images,product.image_url).map((url,i)=>
           <span key={url} aria-label={`Alternate supplier photo ${i+1} for ${product.title}`}>
            <img src={url} alt={`Alternate supplier view ${i+1} of ${product.title}`}
               loading="lazy" referrerPolicy="no-referrer"/>
           </span>)}
         </div>
        </details>}
       <strong className={styles.price}>{money(Number(product.price))}</strong>
       <p className={styles.delivery}>Product price · delivery calculated by retailer</p>
       <Link className={styles.details} href={`/tools/${encodeURIComponent(product.sku)}`}>See product details and photos</Link>
       <a className={styles.visit} href={product.affiliate_url} target="_blank"
         rel="sponsored nofollow noopener noreferrer">View at Tooled Up <span aria-hidden="true">↗</span></a>
      </div>
     </article>)}
    </section>
    <nav className={styles.pagination} aria-label="Product catalogue pagination">
     {page>1&&<Link href={href(department,page-1)}>Previous page</Link>}
     <span>Page {page}</span>
     {hasNext&&<Link href={href(department,page+1)}>Next page</Link>}
    </nav>
   </>}
  </div>
  <Footer/>
 </main>;
}
