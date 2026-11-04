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
type Props={searchParams:Promise<{merchant?:string;page?:string}>};
export default async function OwnerStorefrontPreview({searchParams}:Props){
 await connection();
 await requireControlCentreAccess();
 const {merchant,page:pageParam}=await searchParams;
 const currentPage=Math.max(1,Math.min(10000,Number.parseInt(pageParam||"1",10)||1));
 const pageSize=48;
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
  // Single-merchant mode browses the entire private review queue in pages.
  // The all-merchants landing remains a small, representative sample.
  const detailed=Boolean(merchant);
  let query=db.from("feed_import_records")
   .select("id,merchant_product_id,title,price,currency,brand,category,status,review_decision,image_url",{count:detailed?"exact":undefined})
   .eq("import_id",run.id).order("created_at",{ascending:true});
  if(detailed)query=query.eq("status","review").range((currentPage-1)*pageSize,currentPage*pageSize-1);
  else query=query.limit(120);
  const {data,error,count}=await query;
  const rows=error?[]:detailed
   ?(data??[]) as StagedPreviewRow[]
   :safePreviewSelection((data??[]) as StagedPreviewRow[],24).filter(x=>x.status==="review");
  return {run,rows,error:Boolean(error),count:count??0};
 }));
 const cards=groups.flatMap(group=>group.rows.map(product=>({product,run:group.run})));
 return <main className={styles.frame}>
  <Header/>
  <div className={styles.privateBar}><ShieldCheck size={18}/><strong>OWNER-ONLY STOREFRONT PREVIEW</strong><span>Not indexed · Not published · No checkout links</span></div>
  <section className={catalogue.hero}><div className="shell">
   <p className={catalogue.kicker}>AVUQO · Product display rehearsal</p>
   <h1>Explore products. <span>See how the shop will feel.</span></h1>
   <p>These cards use products from the private imported feed records, displayed in the same visual language as AVUQO&apos;s customer catalogue. Values are historical staged data, not current live deals.</p>
   <Link href="/preview/storefront" className={styles.return}><ArrowLeft size={16}/> Private shop homepage</Link>
  </div></section>
  <section className={`shell ${catalogue.section}`}>
   <nav className={styles.merchantBrowse} aria-label="Browse all staged products by retailer">
    <strong>Browse private retailer catalogues</strong>
    <div><Link aria-current={!merchant?"page":undefined} href="/preview/products">Highlights from all</Link>
    {uniqueRuns.map(run=><Link key={run.id} aria-current={merchant===run.merchant_id?"page":undefined} href={`/preview/products?merchant=${encodeURIComponent(run.merchant_id)}`}>{run.merchant_name}</Link>)}</div>
   </nav>
   {merchant&&selected.length>0&&<p className={styles.pageStatus}>Showing private review candidates from {selected[0].merchant_name}. Page {currentPage} of {Math.max(1,Math.ceil(groups[0].count/pageSize))}. Filters and comparison apply to the products displayed on this page.</p>}
   <PremiumDiscovery items={cards.map(({product,run})=>({
    id:product.id,title:product.title,merchant:run.merchant_name,
    brand:product.brand,rawCategory:product.category,price:product.price,currency:product.currency,
    imageUrl:product.image_url
   }))}/>
   {merchant&&selected.length>0&&groups[0].count>pageSize&&<nav className={styles.pagination} aria-label="Private product catalogue pages">
    {currentPage>1?<Link href={`/preview/products?merchant=${encodeURIComponent(merchant)}&page=${currentPage-1}`}>← Previous page</Link>:<span>First page</span>}
    <strong>Page {currentPage} / {Math.ceil(groups[0].count/pageSize)}</strong>
    {currentPage*pageSize<groups[0].count?<Link href={`/preview/products?merchant=${encodeURIComponent(merchant)}&page=${currentPage+1}`}>Next 48 products →</Link>:<span>Last page</span>}
   </nav>}
   <section className={styles.tyreReady} aria-label="Tyre advertiser onboarding">
     <span>COMING TO MOTORING · FEED REVIEW</span>
     <h2>Tyres deserve a proper comparison.</h2>
     <p>Tyres UK (Awin 12715) and Tyres Pneus Online UK (Awin 15236) are joined programmes. No tyre products have been imported or approved yet. We will need verified size, load rating, speed rating and fitted or delivered price before displaying offers.</p>
     <Link href="/motoring">Explore AVUQO Motoring</Link>
   </section>
   {(runsError||groups.some(group=>group.error))&&<p role="alert" className={styles.warning}>Some private feed records could not be loaded.</p>}
   <p className={styles.warning}><strong>Category quality:</strong> departments here are provisional browsing suggestions only. Canonical category mapping and retailer permission checks are still required before public release.</p>
  </section>
  <Footer/>
 </main>;
}
