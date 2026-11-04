import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import PrivateStorefrontImages from "./PrivateStorefrontImages";
import styles from "./private-storefront.module.css";
export const instant=false;
export const metadata:Metadata={title:"Private storefront rehearsal | AVUQO",robots:{index:false,follow:false}};
type Merchant={id:string;merchant_id:string;merchant_name:string;total_count:number;created_at:string};
type Sample={id:string;title:string;brand:string|null;image_url:string|null;merchant_id:string;merchant_name:string;price:number|string|null;currency:string;category:string|null};
const categories=[
 {label:"Tools & DIY",description:"Power tools, workwear, hand tools and home projects",merchant:"496",href:"/preview/products/tooled-up",tone:"tools"},
 {label:"Chocolate & gifting",description:"Gift boxes, chocolate, seasonal treats and hampers",merchant:"736",href:"/preview/products?merchant=736",tone:"gifts"},
 {label:"Pets & care",description:"Feeding, hydration and useful pet essentials",merchant:"77952",href:"/preview/products?merchant=77952",tone:"pets"},
 {label:"Arts & creative kits",description:"Craft kits, creative projects and accessories",merchant:"45747",href:"/preview/products?merchant=45747",tone:"craft"},
] as const;
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 const db=await createClient();
 const {data:runs,error:runsError}=await db.from("feed_import_runs")
  .select("id,merchant_id,merchant_name,total_count,created_at")
  .eq("status","private_review").order("created_at",{ascending:false}).limit(80);
 const byMerchant=new Map<string,Merchant>();
 for(const r of runs??[]){if(!byMerchant.has(r.merchant_id))byMerchant.set(r.merchant_id,r as Merchant);}
 const available=categories.filter(x=>byMerchant.has(x.merchant));
 const groups=await Promise.all(available.map(async group=>{
  const run=byMerchant.get(group.merchant)!;
  const {data,error}=await db.from("feed_import_records")
   .select("id,title,brand,image_url,price,currency,category").eq("import_id",run.id)
   .eq("status","review").order("created_at",{ascending:true}).limit(3);
  return {group,run,samples:(data??[]).map(x=>({...x,merchant_id:group.merchant,merchant_name:run.merchant_name})) as Sample[],failed:Boolean(error)};
 }));
 const samples=groups.flatMap(g=>g.samples);
 return <main className={styles.page}>
  <Header/>
  <div className={styles.privateBar}>OWNER-ONLY STOREFRONT REHEARSAL · NOT INDEXED · NO PUBLIC OFFERS</div>
  <section className={styles.hero}>
   <div className={styles.container}>
    <p className={styles.eyebrow}>AVUQO SHOPPING / OWNER PREVIEW</p>
    <h1>Explore the AVUQO shop. <em>With real products in review.</em></h1>
    <p className={styles.lead}>Browse the same departments you see throughout AVUQO, then inspect the privately imported products and category-specific detail pages. Prices, photographs and availability are historical retailer observations awaiting approval.</p>
    <nav className={styles.heroActions} aria-label="Private storefront actions">
     <Link className={styles.primaryLink} href="#departments">Explore departments</Link>
     <Link className={styles.secondaryLink} href="/preview/products">Open existing product gallery</Link>
    </nav>
    <div className={styles.metrics}>
     <span><strong>{[...byMerchant.values()].reduce((n,r)=>n+r.total_count,0).toLocaleString("en-GB")}</strong> products in latest private merchant imports</span>
     <span><strong>{available.length}</strong> connected departments</span>
     <span><strong>0</strong> public product releases made here</span>
    </div>
   </div>
  </section>
  <section className={styles.section} id="departments">
   <div className={styles.container}>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>SHOP BY DEPARTMENT · PRIVATE</p><h2>Explore by department.</h2></div><p>Each section connects directly to its imported catalogue. No empty public product shelves or invented offers.</p></div>
    <div className={styles.departmentGrid}>
     {available.map(({label,description,merchant,href,tone})=><Link key={merchant} href={href} className={styles.department} data-tone={tone}>
      <span className={styles.departmentSymbol} aria-hidden="true">{label.slice(0,1)}</span>
      <span className={styles.departmentText}><strong>{label}</strong><small>{description}</small><span>Explore {byMerchant.get(merchant)?.total_count.toLocaleString("en-GB")} staged products →</span></span>
     </Link>)}
    </div>
   </div>
  </section>
  <section className={styles.featureSection}>
   <div className={styles.container}>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>PRIVATE PRODUCT PREVIEW</p><h2>Explore the product details.</h2></div><p>Photographs are switched off until you choose to review them. Manufacturer labels and prices remain retailer-supplied and unverified.</p></div>
    {samples.length?<PrivateStorefrontImages items={samples}/>:<p>There are no completed private product samples yet.</p>}
    {(runsError||groups.some(g=>g.failed))&&<p className={styles.warning} role="alert">Some private inventory was unavailable. Check the Control Centre.</p>}
   </div>
  </section>
  <section className={styles.finalBand}><div className={styles.container}>
   <h2>Made for AVUQO, ready for review.</h2>
   <p>Category navigation and product pages can be rehearsed now. Publishing follows later, only with current prices, valid stock, verified image and text rights, and owner-approved offers.</p>
   <Link href="/control-centre/feed-imports">Review importer and permissions →</Link>
  </div></section>
  <Footer/>
 </main>;
}
