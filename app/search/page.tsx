import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {Search,ArrowRight,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";import Footer from "../../components/layout/Footer";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Search AVUQO",description:"Search verified products and explore AVUQO's thoughtful shopping and service departments.",robots:{index:false,follow:true}};
type Props={searchParams:Promise<{q?:string}>};
const rooms=[["Shopping","/shopping"],["Groceries","/groceries"],["Home","/home"],["Tech","/tech"],["Travel","/travel"],["Motoring","/motoring"],["Insurance","/insurance"],["Broadband","/broadband"],["Christmas","/christmas"],["Black Friday","/black-friday"]];
async function Results({searchParams}:Props){
 await connection();
 const {q:input}=await searchParams;
 const query=String(input??"").trim().slice(0,120);
 const words=query.toLowerCase().split(/\s+/).filter(Boolean);
 const all=await verifiedProductIndex(60);
 const filtered=words.length?all.filter(({product,offers})=>{
  const hay=[product.canonical_title,product.brand,product.model,product.description,...offers.map(o=>o.published.category)].filter(Boolean).join(" ").toLowerCase();
  return words.every(w=>hay.includes(w));
 }):all;
 return <><section className={styles.hero}><div className="shell"><p className={styles.kicker}>AVUQO Search</p><h1>{query?<>Looking for <em>{query}</em>?</>:"Find what’s worth it."}</h1><p>Take a thoughtful look around. Live product listings only appear once their sources and prices pass our checks.</p><form className={styles.search} action="/search" method="get" role="search"><Search size={22}/><input name="q" defaultValue={query} placeholder="What would you like to find?" aria-label="Search AVUQO" required/><button type="submit">Search <ArrowRight size={16}/></button></form></div></section>
 <section className={`shell ${styles.results}`}><p className={styles.kicker}>Source-verified products</p><h2>{filtered.length?`${filtered.length} matching product ${filtered.length===1?"guide":"guides"}`:"No verified product matches just yet."}</h2><p className={styles.note}>{filtered.length?"These are matched to eligible offers. Double-check final merchant terms before buying.":"The existing sample catalogue is used for internal testing and is not shown as real merchant prices. Browse the departments below while more data sources are approved."}</p>
 {filtered.length>0&&<div className={styles.productGrid}>{filtered.map(({product,offers})=><Link key={product.id} href={`/products/${product.slug}`} className={styles.product}><span className={styles.productArt}>Q</span><div><small>{product.brand??"Product"}</small><h3>{product.canonical_title}</h3><p>{offers.length} eligible {offers.length===1?"offer":"offers"}</p><strong>Open product <ArrowRight size={16}/></strong></div></Link>)}</div>}
 </section><section className={`shell ${styles.departments}`}><div className={styles.roomHeading}><div><p className={styles.kicker}>Try another room</p><h2>Explore by department.</h2></div><Link href="/categories">All categories <ArrowRight size={16}/></Link></div><div className={styles.chips}>{rooms.map(([title,url])=><Link key={url} href={url}>{title}<ArrowRight size={15}/></Link>)}</div><div className={styles.trust}><ShieldCheck size={20}/> No fictional discounts, no commission-led organic results. <Link href="/editorial-policy">Our editorial standards</Link>.</div></section></>;
}
export default function Page(props:Props){return <main><Header/><Suspense fallback={<div className="shell section">Searching verified sources…</div>}><Results {...props}/></Suspense><Footer/></main>}
