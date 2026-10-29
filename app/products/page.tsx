import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";import type {Metadata} from "next";
import {ArrowRight,Search,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";import Footer from "../../components/layout/Footer";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Product guides",description:"Explore verified AVUQO product pages, with eligible retailer pricing and transparent source evidence.",alternates:{canonical:"/products"}};
async function Catalogue(){await connection();const rows=await verifiedProductIndex(48);
return <><section className={styles.hero}><div className="shell"><p className={styles.kicker}>A thoughtful collection</p><h1>Individual products. <span>The bigger picture.</span></h1><p>Explore exact product variants, transparent retailer offers and price evidence only when sources have been approved and recently checked.</p><form className={styles.search} action="/search" method="get"><Search size={19}/><input name="q" placeholder="Find a product or category" aria-label="Search products" required/><button type="submit">Search <ArrowRight size={17}/></button></form></div></section>
<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>Available product guides</p><h2>{rows.length? "Products worth exploring.":"Good evidence takes time."}</h2><p>{rows.length?"These individual pages use authorised, fresh source information.":"There are no verified external-source product offers ready for public display yet. AVUQO will show them when the source and product checks pass, not from fictional examples."}</p></div>
{rows.length?<div className={styles.grid}>{rows.map(({product,offers})=><Link href={`/products/${product.slug}`} className={styles.card} key={product.id}><div className={styles.photo}><span>Q</span></div><div><p>{product.brand??"Product guide"}</p><h3>{product.canonical_title}</h3><small>{offers.length} eligible {offers.length===1?"offer":"offers"}</small><strong>See product <ArrowRight size={16}/></strong></div></Link>)}</div>:<div className={styles.empty}><ShieldCheck size={34}/><h3>Nothing unverified goes on the shelf.</h3><p>Private imports and demonstration records stay out of the public catalogue until the relevant evidence, matching and rights gates are satisfied.</p><Link href="/shopping">Explore shopping ideas <ArrowRight size={17}/></Link></div>}
</section></>}
export default function Page(){return <main><Header/><Suspense fallback={<div className="shell section">Checking published products…</div>}><Catalogue/></Suspense><Footer/></main>;}
