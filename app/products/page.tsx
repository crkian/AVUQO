import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";import type {Metadata} from "next";
import {ArrowRight,BookOpen,Search,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";import Footer from "../../components/layout/Footer";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import {RESEARCH_PRODUCT_GUIDES} from "../../lib/products/research-guides";
import {BROWSE_DEPARTMENTS} from "../../lib/categories/browse-tree";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Products and buying guides",description:"Explore researched product models and see verified retailer comparisons only when authorised current offers are available.",alternates:{canonical:"/products"}};
async function Catalogue(){await connection();const rows=await verifiedProductIndex(48);
return <><section className={styles.hero}><div className="shell"><p className={styles.kicker}>A thoughtful collection</p><h1>Individual products. <span>The bigger picture.</span></h1><p>Start with individual product research guides. Current retailer prices and offers appear separately when the supplier evidence and approvals are in place.</p><form className={styles.search} action="/search" method="get"><Search size={19}/><input name="q" placeholder="Find a product or category" aria-label="Search products" required/><button type="submit">Search <ArrowRight size={17}/></button></form></div></section>
<section className={`shell ${styles.section}`} aria-labelledby="research-models-heading">
 <div className={styles.heading}><p className={styles.kicker}>Start exploring products</p>
  <h2 id="research-models-heading">Real models to research.</h2>
  <p>These are editorial buying guides for identifiable products, not retailer listings. We are not showing current prices, stock, ratings or discounts without verified source evidence.</p></div>
 <div className={styles.grid}>{RESEARCH_PRODUCT_GUIDES.map(guide=><Link href={`/products/${guide.slug}`} className={styles.card} key={guide.slug}>
  <div className={styles.photo} aria-hidden="true"><span className={styles.researchPhoto} data-department={guide.department}><BookOpen size={45}/><small>Research guide</small></span></div>
  <div><p>{guide.brand} · Independent guide</p><h3>{guide.title}</h3><small>{guide.teaser}</small>
   <span className={styles.researchLabel}>Retailer offers not verified yet</span>
   <strong>Explore this model <ArrowRight size={16}/></strong></div>
 </Link>)}</div>
</section>
<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>Approved retailer comparisons</p><h2>{rows.length? "Products worth exploring.":"Good evidence takes time."}</h2><p>{rows.length?"These individual pages use authorised, fresh source information.":"There are no verified external-source product offers ready for public display yet. AVUQO will show them when the source and product checks pass, not from fictional examples."}</p></div>
{rows.length?<div className={styles.grid}>{rows.map(({product,offers})=><Link href={`/products/${product.slug}`} className={styles.card} key={product.id}><div className={styles.photo}>{offers.find(item=>item.published.image_url)?.published.image_url?<span className={styles.approvedPhoto} role="img" aria-label={`Approved retailer product photograph for ${product.canonical_title}`} style={{backgroundImage:`url("${offers.find(item=>item.published.image_url)?.published.image_url}")`}}/>:<span className={styles.placeholder} aria-label="No approved photograph available">AVUQO</span>}</div><div><p>{product.brand??"Product guide"}</p><h3>{product.canonical_title}</h3><small>{offers.length} eligible {offers.length===1?"offer":"offers"}</small><strong>See product <ArrowRight size={16}/></strong></div></Link>)}</div>:<div className={styles.empty}><ShieldCheck size={34}/><h3>Nothing unverified goes on the shelf.</h3><p>Private imports and demonstration records stay out of the public catalogue until the relevant evidence, matching and rights gates are satisfied.</p><Link href="/shopping">Explore shopping ideas <ArrowRight size={17}/></Link></div>}
</section>
<section className={"shell "+styles.section} aria-labelledby="department-shop-heading">
  <div className={styles.heading}><p className={styles.kicker}>Every department, one standard</p>
   <h2 id="department-shop-heading">Explore all 25 product departments.</h2>
   <p>Each showroom is ready for eligible listings when its sources are cleared. An open showroom is not a claim that stock is currently available.</p></div>
  <div className={styles.departmentGrid}>{BROWSE_DEPARTMENTS.map(d=><Link key={d.slug} href={"/categories/"+d.slug+"/products"} className={styles.departmentLink}>{d.name}<ArrowRight size={16}/></Link>)}</div>
</section></>}
export default function Page(){return <main><Header/><Suspense fallback={<div className="shell section">Checking published products…</div>}><Catalogue/></Suspense><Footer/></main>;}
