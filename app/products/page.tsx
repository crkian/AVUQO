import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,Search,ShieldCheck,Boxes} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import VerifiedProductCards from "../../components/products/VerifiedProductCards";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import styles from "./page.module.css";

export const metadata:Metadata={
 title:"Product guides",
 description:"Explore verified AVUQO product pages, eligible retailer pricing and transparent source evidence.",
 alternates:{canonical:"/products"}
};

async function Catalogue(){
 await connection();
 const rows=await verifiedProductIndex(48);
 return <>
  <section className={styles.hero}><div className="shell">
   <p className={styles.kicker}>The AVUQO product collection</p>
   <h1>Good finds. <span>Better perspective.</span></h1>
   <p>Explore product details and compare eligible retailer offers when authorised, recent evidence is available. Useful ideas never need invented prices.</p>
   <form className={styles.search} action="/search" method="get" role="search">
    <Search size={19} aria-hidden="true"/><input name="q" placeholder="Search for something worth exploring" aria-label="Search products" maxLength={120} required/>
    <button type="submit">Search <ArrowRight size={17}/></button>
   </form>
  </div></section>
  <section className={`shell ${styles.section}`}>
   <div className={styles.heading}>
    <p className={styles.kicker}>Thoughtful shopping</p>
    <h2>{rows.length?"Verified product highlights.":"The right evidence comes first."}</h2>
    <p>{rows.length?"These are products with eligible offers. Figures are observed source records, not guaranteed checkout prices.":"There are no current products cleared for public comparison. Explore departments while we complete source, image rights, matching and offer approvals."}</p>
   </div>
   {rows.length?<VerifiedProductCards items={rows}/>:
     <div className={styles.empty}><ShieldCheck size={35}/><h3>Nothing unverified goes on the shelf.</h3>
       <p>Private imports, example products and demonstration records stay out of the public catalogue until every required publishing check passes.</p>
       <div className={styles.emptyLinks}><Link href="/categories"><Boxes size={18}/> Explore departments <ArrowRight size={16}/></Link>
         <Link href="/shopping">Find shopping ideas <ArrowRight size={16}/></Link></div>
     </div>}
   <p className={styles.disclosure}>Images are shown only when the approved public source confirms usage rights. Seller, stock, price and delivery information can change.</p>
  </section>
 </>;
}

export default function Page(){
 return <main><Header/><Suspense fallback={<div className="shell section">Checking published products…</div>}><Catalogue/></Suspense><Footer/></main>;
}
