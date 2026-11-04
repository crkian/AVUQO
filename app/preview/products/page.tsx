import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {safePreviewSelection,type StagedPreviewRow} from "../../../lib/feed-imports/preview-selection";
import PremiumDiscovery from "./PremiumDiscovery";
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
  const rows=error?[]:safePreviewSelection((data??[]) as StagedPreviewRow[],24).filter(x=>x.status==="review");
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
   <PremiumDiscovery items={cards.map(({product,run})=>({
    id:product.id,title:product.title,merchant:run.merchant_name,
    brand:product.brand,rawCategory:product.category,price:product.price,currency:product.currency
   }))}/>
   {(runsError||groups.some(group=>group.error))&&<p role="alert" className={styles.warning}>Some private feed records could not be loaded.</p>}
   <p className={styles.warning}><strong>Category quality:</strong> departments here are provisional browsing suggestions only. Canonical category mapping and retailer permission checks are still required before public release.</p>
  </section>
  <Footer/>
 </main>;
}
