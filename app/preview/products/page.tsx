import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {safePreviewSelection,stagedPrice,type StagedPreviewRow} from "../../../lib/feed-imports/preview-selection";
import catalogue from "../../products/page.module.css";
import styles from "./page.module.css";

export const instant = false;
export const metadata:Metadata={title:"Private product storefront preview | AVUQO",robots:{index:false,follow:false}};
type Run={id:string;merchant_id:string;merchant_name:string;permission_status:string;created_at:string};
type Props={searchParams:Promise<{merchant?:string}>};
export default async function OwnerStorefrontPreview({searchParams}:Props){
 await connection();
 await requireControlCentreAccess();
 const {merchant}=await searchParams;
 const db=await createClient();
 const {data:runs,error:runsError}=await db.from("feed_import_runs")
  .select("id,merchant_id,merchant_name,permission_status,created_at")
  .order("created_at",{ascending:false}).limit(20);
 const uniqueRuns:Run[]=[];const seen=new Set<string>();
 for(const run of (runs??[]) as Run[]){
  const key=run.merchant_id||run.merchant_name;
  if(!seen.has(key)){seen.add(key);uniqueRuns.push(run);}
  if(uniqueRuns.length===6)break;
 }
 const selected=merchant?uniqueRuns.filter(run=>run.merchant_id===merchant):uniqueRuns;
 const groups=await Promise.all(selected.map(async run=>{
  const {data,error}=await db.from("feed_import_records")
   .select("id,merchant_product_id,title,price,currency,brand,category,status,review_decision,image_url")
   .eq("import_id",run.id).order("created_at",{ascending:true}).limit(120);
  // Only staged review candidates are presented as shopfront cards.
  // Excluded rows remain visible in the original owner review tool.
  const rows=error?[]:safePreviewSelection((data??[]) as StagedPreviewRow[],12).filter(x=>x.status==="review");
  return {run,rows,error:Boolean(error)};
 }));
 const cards=groups.flatMap(group=>group.rows.map(product=>({product,run:group.run})));
 return <main className={styles.frame}>
  <Header/>
  <div className={styles.privateBar}><ShieldCheck size={18}/><strong>OWNER-ONLY STOREFRONT PREVIEW</strong><span>Not indexed · Not published · No checkout links</span></div>
  <section className={catalogue.hero}><div className="shell">
   <p className={catalogue.kicker}>AVUQO · Product display rehearsal</p>
   <h1>Explore products. <span>See how the shop will feel.</span></h1>
   <p>These cards use products from the private imported feed records, displayed in the same visual language as AVUQO&apos;s customer catalogue. Values are historical staged data, not current live deals.</p>
   <Link href="/control-centre/product-previews" className={styles.return}><ArrowLeft size={16}/> Back to private review</Link>
  </div></section>
  <section className={`shell ${catalogue.section}`}>
   <div className={catalogue.heading}><p className={catalogue.kicker}>Private product samples</p><h2>Preview the real layout.</h2><p>Merchant images are not shown until their licences are verified. Product prices below are archived import values, not customer-facing offers.</p></div>
   <nav className={styles.filters} aria-label="Preview merchant filters">
    <Link href="/preview/products" aria-current={!merchant?"page":undefined}>All merchants</Link>
    {uniqueRuns.map(run=><Link href={`/preview/products?merchant=${encodeURIComponent(run.merchant_id)}`} key={run.id} aria-current={merchant===run.merchant_id?"page":undefined}>{run.merchant_name}</Link>)}
   </nav>
   {(runsError||groups.some(group=>group.error))&&<p role="alert" className={styles.warning}>Some private feed records could not be loaded.</p>}
   <p className={styles.warning}><strong>DESIGN PREVIEW ONLY.</strong> Prices are unverified historical feed values. Images are withheld, offers cannot be compared or purchased, and these rows are not public catalogue entries.</p>
   {cards.length?<div className={catalogue.grid}>
    {cards.map(({product,run})=><article className={catalogue.card} key={product.id}>
     <div className={catalogue.photo} aria-label="Product image withheld pending rights"><span>Q</span></div>
     <div className={styles.cardCopy}>
      <p className={catalogue.kicker}>{product.brand||run.merchant_name}</p>
      <h3>{product.title}</h3>
      <p className={styles.category}>{product.category||"Category to be confirmed"}</p>
      <strong className={styles.price}>{stagedPrice(product.price,product.currency)}</strong>
      <span className={styles.staged}>Archived feed value · not a live price</span>
      <span className={styles.store}>{run.merchant_name}</span>
      <span className={styles.disabled} aria-disabled="true">Retailer offer pending verification</span>
     </div>
    </article>)}
   </div>:<div className={catalogue.empty}><ShieldCheck size={34}/><h3>No review candidates available.</h3><p>Nothing has been added to the public catalogue.</p></div>}
  </section>
  <Footer/>
 </main>;
}
