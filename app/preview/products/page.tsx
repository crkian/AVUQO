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
import TyreAdvancedFilters,{type TyreFacetValues,type TyreFilterSelection} from "./TyreAdvancedFilters";
import catalogue from "../../products/page.module.css";
import styles from "./page.module.css";

export const instant = false;
export const metadata:Metadata={title:"Private product storefront preview | AVUQO",robots:{index:false,follow:false}};
type Run={id:string;merchant_id:string;merchant_name:string;permission_status:string;created_at:string};
type Props={searchParams:Promise<{merchant?:string;page?:string;brand?:string;width?:string;profile?:string;rim?:string;q?:string;min?:string;max?:string;sort?:string}>};
export default async function OwnerStorefrontPreview({searchParams}:Props){
 await connection();
 await requireControlCentreAccess();
 const params=await searchParams;
 const {merchant,page:pageParam}=params;
 const tyreMode=merchant==="12715";
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
  if(uniqueRuns.length===12)break;
 }
 // A selected merchant must not disappear from preview merely because newer
 // imports from other retailers displaced it from the recent-run sample.
 let selected=merchant?uniqueRuns.filter(run=>run.merchant_id===merchant):uniqueRuns;
 if(merchant&&!selected.length&&/^\d{1,9}$/.test(merchant)){
  const {data:matching}=await db.from("feed_import_runs")
   .select("id,merchant_id,merchant_name,permission_status,created_at")
   .eq("merchant_id",merchant).eq("status","private_review")
   .order("created_at",{ascending:false}).limit(1);
  selected=(matching??[]) as Run[];
 }
 // Populate full-import filter menus through a private, owner-only RLS-protected
 // aggregate function. All values remain unapproved for public tyre fitment.
 let facets:TyreFacetValues={brands:[],widths:[],profiles:[],rims:[]};
 if(tyreMode&&selected.length){
  const {data}=await db.rpc("private_tyre_preview_facets",{p_import_id:selected[0].id});
  if(data&&typeof data==="object"&&!Array.isArray(data)){
   const obj=data as Record<string,unknown>;
   const cleanInts=(key:string)=>Array.isArray(obj[key])?
    (obj[key] as unknown[]).filter((x):x is number=>Number.isInteger(x)&&Number(x)>=10&&Number(x)<=400):[];
   facets={
    brands:Array.isArray(obj.brands)?obj.brands.filter((x):x is string=>typeof x==="string"&&x.length<=100):[],
    widths:cleanInts("widths"),profiles:cleanInts("profiles"),rims:cleanInts("rims")
   };
  }
 }
 const selectedTyreFilters:TyreFilterSelection={
  brand:facets.brands.includes(params.brand??"")?params.brand!:"",
  width:facets.widths.some(x=>String(x)===params.width)?params.width!:"",
  profile:facets.profiles.some(x=>String(x)===params.profile)?params.profile!:"",
  rim:facets.rims.some(x=>String(x)===params.rim)?params.rim!:"",
  q:(params.q??"").replace(/[^\p{L}\p{N} ._+\-/]/gu,"").slice(0,80).trim(),
  min:/^\d{1,6}(?:\.\d{1,2})?$/.test(params.min??"")?params.min!:"",
  max:/^\d{1,6}(?:\.\d{1,2})?$/.test(params.max??"")?params.max!:"",
  sort:["name","price_low","price_high","newest"].includes(params.sort??"")?params.sort!:"name"
 };
 const tyrePageHref=(page:number)=>{
  const url=new URLSearchParams({merchant:"12715",page:String(page)});
  for(const [key,val] of Object.entries(selectedTyreFilters))
   if(val&&!(key==="sort"&&val==="name"))url.set(key,val);
  return "/preview/products?"+url.toString();
 };
 const groups=await Promise.all(selected.map(async run=>{
  // Single-merchant mode browses the entire private review queue in pages.
  // The all-merchants landing remains a small, representative sample.
  const detailed=Boolean(merchant);
  let query=db.from("feed_import_records")
   .select("id,merchant_product_id,title,price,currency,brand,category,status,review_decision,image_url,metadata",{count:detailed?"exact":undefined})
   .eq("import_id",run.id);
  if(detailed){
   query=query.eq("status","review");
   if(tyreMode){
    const f=selectedTyreFilters;
    if(f.brand)query=query.eq("brand",f.brand);
    if(f.width)query=query.eq("metadata->tyre_size_candidate->>width_mm",f.width);
    if(f.profile)query=query.eq("metadata->tyre_size_candidate->>aspect_ratio",f.profile);
    if(f.rim)query=query.eq("metadata->tyre_size_candidate->>rim_inches",f.rim);
    if(f.q)query=query.ilike("title","%"+f.q.replace(/[%_]/g,"")+"%");
    if(f.min)query=query.gte("price",Number(f.min));
    if(f.max)query=query.lte("price",Number(f.max));
    if(f.sort==="price_low")query=query.order("price",{ascending:true});
    else if(f.sort==="price_high")query=query.order("price",{ascending:false});
    else if(f.sort==="newest")query=query.order("created_at",{ascending:false});
    else query=query.order("title",{ascending:true});
   }
   query=query.order("id",{ascending:true}).range((currentPage-1)*pageSize,currentPage*pageSize-1);
  }
  else query=query.order("created_at",{ascending:true}).limit(120);
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
   {merchant&&selected.length>0&&<p className={styles.pageStatus}>Showing private review candidates from {selected[0].merchant_name}. Page {currentPage} of {Math.max(1,Math.ceil(groups[0].count/pageSize))}. {tyreMode?"Advanced filters search the full imported tyre catalogue.":"Local filters and comparison apply to products displayed on this page."}</p>}
   {tyreMode&&selected.length>0&&<TyreAdvancedFilters facets={facets} selected={selectedTyreFilters} resultCount={groups[0]?.count??0}/>}
   <PremiumDiscovery externalFilters={tyreMode} items={cards.map(({product,run})=>({
    id:product.id,title:product.title,merchant:run.merchant_name,
    brand:product.brand,rawCategory:product.category,price:product.price,currency:product.currency,
    imageUrl:product.image_url,
    tyreSize:run.merchant_id==="12715"?(product as StagedPreviewRow & {metadata?:{tyre_size_candidate?:{width_mm:number;aspect_ratio:number;rim_inches:number}}}).metadata?.tyre_size_candidate??null:null
   }))}/>
   {merchant&&selected.length>0&&groups[0].count>pageSize&&<nav className={styles.pagination} aria-label="Private product catalogue pages">
    {currentPage>1?<Link href={tyreMode?tyrePageHref(currentPage-1):`/preview/products?merchant=${encodeURIComponent(merchant)}&page=${currentPage-1}`}>← Previous page</Link>:<span>First page</span>}
    <strong>Page {currentPage} / {Math.ceil(groups[0].count/pageSize)}</strong>
    {currentPage*pageSize<groups[0].count?<Link href={tyreMode?tyrePageHref(currentPage+1):`/preview/products?merchant=${encodeURIComponent(merchant)}&page=${currentPage+1}`}>Next 48 products →</Link>:<span>Last page</span>}
   </nav>}
   <section className={styles.tyreReady} aria-label="Tyre advertiser onboarding">
     <span>COMING TO MOTORING · FEED REVIEW</span>
     <h2>Tyres deserve a proper comparison.</h2>
     <p>Tyres UK now has 31,372 imported records in private staging, including 28,990 private review candidates. No tyre products are publicly approved. Tyres Pneus Online UK remains in private feed validation. Size, load rating, speed rating and fitted or delivered prices still require verification before public offers.</p>
     <Link href="/motoring">Explore AVUQO Motoring</Link>
   </section>
   {(runsError||groups.some(group=>group.error))&&<p role="alert" className={styles.warning}>Some private feed records could not be loaded.</p>}
   <p className={styles.warning}><strong>Category quality:</strong> departments here are provisional browsing suggestions only. Canonical category mapping and retailer permission checks are still required before public release.</p>
  </section>
  <Footer/>
 </main>;
}
