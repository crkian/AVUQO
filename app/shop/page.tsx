import Link from "next/link";
import {Suspense} from "react";
import {connection} from "next/server";
import type {Metadata} from "next";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,PackageSearch,Search,ShieldCheck,SlidersHorizontal,Store,Truck} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {verifiedShopPage} from "../../lib/products/shop-discovery";
import {SHOP_PAGE_SIZE,SHOP_SORTS,shopHref,type ShopQuery} from "../../lib/products/shop-filters";
import {cardDescription} from "../../lib/products/listing-description";
import styles from "./page.module.css";
export const metadata:Metadata={
 title:"Shop real retailer prices | AVUQO",
 description:"Browse more of AVUQO's source-verified UK retailer inventory, filter by shop or category and sort by item price. Delivery and exact product comparisons remain clearly explained.",
 alternates:{canonical:"/shop"},
 robots:{index:true,follow:true}
};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
async function ShopResults({searchParams}:{searchParams:Promise<ShopQuery>}){
 await connection();
 const data=await verifiedShopPage(await searchParams);
 const {filters,products,merchants,categories,shownOfferCount,candidateCount}=data;
 return <main className={styles.page}>
  <section className={styles.hero}><div className="shell">
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">AVUQO</Link><span>/</span><Link href="/catalogue">Catalogue</Link><span>/</span> Shop real offers</nav>
   <p className={styles.eyebrow}><ShieldCheck size={16}/> AVUQO source-verified retailer shopping</p>
   <h1>More real products.<br/><span>More ways to find your fit.</span></h1>
   <p>Browse the larger AVUQO retailer catalogue, not just the homepage's featured selection. Every displayed price still passes the existing live source, stock, identity, publisher-link and owner-release checks.</p>
   <div className={styles.heroActions}><Link href="/products">Product guides <ArrowRight size={16}/></Link><Link href="/partners">All retailers <Store size={16}/></Link><Link href="/categories">25 departments <ArrowRight size={16}/></Link></div>
  </div></section>
  <div className={"shell "+styles.content}>
   <form method="get" action="/shop" className={styles.controls} role="search" aria-label="Filter source-verified products">
    <div className={styles.searchField}><Search size={19}/><label htmlFor="shop-query">Search products, brands or models</label>
     <input id="shop-query" type="search" name="q" defaultValue={filters.q} placeholder="For example: Bosch, Makita, toy, phone…" maxLength={80} autoComplete="off"/></div>
    <label className={styles.selector}><span>Retailer</span>
     <select name="merchant" defaultValue={filters.merchant}><option value="">All participating shops</option>
      {merchants.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
     </select></label>
    <label className={styles.selector}><span>Feed category</span>
     <select name="category" defaultValue={filters.category}><option value="">All eligible categories</option>
      {categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
     </select></label>
    <label className={styles.selector}><span>Sort items by</span>
     <select name="sort" defaultValue={filters.sort}>{SHOP_SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
    </label>
    <div className={styles.filterActions}><button type="submit"><SlidersHorizontal size={17}/> Show products</button>
     <Link href="/shop">Clear filters</Link></div>
   </form>
   <div className={styles.resultsHeading}><div><p className={styles.eyebrow}>Currently eligible product offers</p>
    <h2>{filters.q?`Results for “${filters.q}”`:"Explore the full live retailer shelf"}</h2>
    <p>Page {filters.page} of {Math.max(1,data.pageCount)} in the published offer catalogue. {products.length} source-eligible {products.length===1?"product":"products"} shown from this page's records. Entries that fail today's checks are omitted.</p></div>
    <div className={styles.count}><CheckCircle2 size={16}/> {shownOfferCount} eligible {shownOfferCount===1?"offer":"offers"} in this page</div>
   </div>
   {products.length?<div className={styles.grid}>
    {products.map(({product,offers})=>{
     const best=offers[0];
     if(!best)return null;
     const image=offers.find(o=>o.published.image_url)?.published.image_url;
     const uniqueSellers=new Set(offers.map(o=>o.published.merchant)).size;
     return <article className={styles.card} key={product.id}>
      <Link className={styles.cardPrimary} href={"/products/"+product.slug}>
       <span className={styles.image}>{image?<img src={image} alt={product.canonical_title} loading="lazy" referrerPolicy="no-referrer"/>:<PackageSearch size={44} aria-hidden="true"/>}</span>
       <span className={styles.cardBody}><small className={styles.brand}>{product.brand??"Retailer product"} · {best.published.category||"Shopping"}</small>
        <strong>{product.canonical_title}</strong>
        <span className={styles.description}>{cardDescription(product.description,135)}</span>
        <span className={styles.merchant}><Store size={14}/>{uniqueSellers>1?`${uniqueSellers} source-approved sellers`:best.published.merchant}</span>
        <span className={styles.price}>{money(Number(best.offer.price))}<small>Item price; delivery may be extra</small></span>
        <span className={styles.view}>View details &amp; retailer offers <ArrowRight size={16}/></span>
       </span>
      </Link>
     </article>;
    })}
   </div>:<div className={styles.noItems} role="status"><PackageSearch size={36}/>
    <h3>{data.resultsState==="source_unavailable"?"Price evidence temporarily unavailable":"No eligible offers in this selection"}</h3>
    <p>{data.resultsState==="source_unavailable"?"The required source data could not be checked, so no product prices are displayed.":
     "A published feed record alone is not a live product. Try another search or move to the next catalogue page to find a source-eligible offer."}</p>
    <div><Link href="/shop">Browse all shops</Link><Link href="/partners">Retailer directory</Link></div>
   </div>}
   <nav aria-label="Shop result pages" className={styles.pagination}>
    {data.hasPrevious?<Link href={shopHref(filters,{page:filters.page-1})}><ArrowLeft size={16}/> Previous page</Link>:<span/>}
    <span>{filters.page} / {Math.max(1,data.pageCount)} · {candidateCount.toLocaleString("en-GB")} published candidate records</span>
    {data.hasNext?<Link href={shopHref(filters,{page:filters.page+1})}>Next page <ArrowRight size={16}/></Link>:<span/>}
   </nav>
   <section className={styles.evidence}>
    <div><ShieldCheck size={27}/><h3>Approval before display</h3><p>Imported rows do not automatically become stock. Each displayed offer passes the same merchant, freshness, currency and release checks as its product page.</p></div>
    <div><Clock3 size={27}/><h3>Prices can change</h3><p>A checkout price and availability can change after AVUQO's observation. Products that become stale disappear automatically from eligible results.</p></div>
    <div><Truck size={27}/><h3>Cheapest means total cost</h3><p>Sorting here uses verified <strong>item prices</strong>, not delivery-inclusive market rankings. The product page shows different eligible retailers only when the exact product identity matches.</p></div>
   </section>
   <p className={styles.disclosure}><strong>About this shelf:</strong> {SHOP_PAGE_SIZE} candidate offers are examined per page. The candidate total is not a count of currently verified live products; safety checks may hide some or all of a page. Awin affiliate commission does not influence price sorting. <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/trust">Our evidence principles</Link>.</p>
  </div>
 </main>;
}
export default function Shop({searchParams}:{searchParams:Promise<ShopQuery>}){
 return <><Header/><Suspense fallback={<main className={styles.loading}><p>Checking current retailer evidence…</p></main>}><ShopResults searchParams={searchParams}/></Suspense><Footer/></>;
}
