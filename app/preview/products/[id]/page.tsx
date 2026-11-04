import {connection} from "next/server";
import {notFound} from "next/navigation";
import Link from "next/link";
import type {Metadata} from "next";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import {categoryDetail} from "../../../../lib/feed-imports/category-detail";
import {stagedPrice} from "../../../../lib/feed-imports/preview-selection";
import PrivateProductPhoto from "./PrivateProductPhoto";
import styles from "./detail.module.css";
export const instant=false;
export const metadata:Metadata={title:"Private category product detail | AVUQO",robots:{index:false,follow:false}};
type Props={params:Promise<{id:string}>};
type Staged={id:string;import_id:string;title:string;brand:string|null;category:string|null;price:number|string|null;currency:string;image_url:string|null;status:string;merchant_product_id:string;metadata:Record<string,unknown>|null};
export default async function Page({params}:Props){
 await connection();
 await requireControlCentreAccess();
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(id))notFound();
 const db=await createClient();
 const {data,error}=await db.from("feed_import_records").select("id,import_id,title,brand,category,price,currency,image_url,status,merchant_product_id,metadata").eq("id",id).maybeSingle();
 if(error||!data)notFound();
 const row=data as Staged;
 const {data:run, error:runError}=await db.from("feed_import_runs").select("merchant_name,merchant_id,permission_status").eq("id",row.import_id).maybeSingle();
 if(runError||!run)notFound();
 const detail=categoryDetail(run.merchant_name,row.title,row.category,row.brand,row.metadata??undefined);
 return <main className={styles.page}>
  <Header/>
  <div className={styles.private}>PRIVATE PRODUCT PREVIEW · NO PUBLIC OFFER · OWNER ACCESS</div>
  <div className={styles.shell}>
   <nav className={styles.breadcrumb} aria-label="Product preview breadcrumbs">
    <Link href="/preview/storefront">Private shop</Link><span>/</span><Link href={run.merchant_id==="496"?"/preview/products/tooled-up":`/preview/products?merchant=${encodeURIComponent(run.merchant_id)}`}>{run.merchant_name}</Link><span>/</span><span>{detail.department}</span><span>/</span><span>Product inspection</span>
   </nav>
   <div className={styles.layout}>
    <PrivateProductPhoto url={row.image_url} title={row.title}/>
    <section className={styles.copy}>
     <p className={styles.eyebrow}>{detail.department} · {run.merchant_name}</p>
     <h1>{row.title}</h1>
     {row.brand&&<p className={styles.brand}>{row.brand}</p>}
     <p className={styles.price}>{stagedPrice(row.price,row.currency)}</p>
     <p className={styles.historical}>Historical import value, not a verified live price. Any stock status or delivery charge shown in source details is a past feed observation, not current availability.</p>
     <div className={styles.disabled}>Retailer checkout unavailable until individual offer approval</div>
     <div className={styles.provenance}><span>Imported merchant: <strong>{run.merchant_name}</strong></span><span>Original feed category: <strong>{row.category||"Not provided"}</strong></span><span>Validation: <strong>{row.status}</strong></span><span>Usage permission: <strong>{run.permission_status}</strong></span></div>
    </section>
   </div>
   <div className={styles.sections}>
    <section className={styles.panel}><p className={styles.eyebrow}>CATEGORY-SPECIFIC VIEW</p><h2>{detail.heading}</h2><p>{detail.guidance}</p>
     {detail.facts.length>0?<dl className={styles.facts}>{detail.facts.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>:<p className={styles.note}>No reliable attribute value was extracted from the product title. We will not invent one.</p>}
     <h3>Still needed from fresh retailer data</h3><ul>{detail.missing.map(m=><li key={m}>{m}</li>)}</ul>
    </section>
    <section className={styles.panel}><p className={styles.eyebrow}>AVUQO EVIDENCE</p><h2>Before a product goes live</h2><ul><li>Verify current GBP price, availability and full delivery or fitting cost</li><li>Confirm exact model or variant and category mapping</li><li>Confirm image, product description and brand-use permissions</li><li>Validate a working merchant affiliate link and independent AVUQO Score</li><li>Record an owner-approved release and preserve emergency pause</li></ul><p className={styles.note}>Any dimensions, quantities or other attributes shown above are parsed from the original imported title only, not independently verified specifications.</p></section>
   </div>
   <Link className={styles.back} href={run.merchant_id==="496"?"/preview/products/tooled-up":`/preview/products?merchant=${encodeURIComponent(run.merchant_id)}`}>← Browse more from {run.merchant_name}</Link>
  </div>
  <Footer/>
 </main>;
}
