import type {Metadata} from "next";
import {Suspense} from "react";
import Link from "next/link";
import {connection} from "next/server";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {tyreSizeQuery} from "../../../lib/tyres/catalogue";
import styles from "../tyres.module.css";

type Props={searchParams:Promise<{width?:string;profile?:string;rim?:string}>};
export const metadata:Metadata={
 title:"Understand your tyre size | AVUQO",
 description:"Understand tyre width, profile, rim diameter, load and speed ratings before choosing new tyres.",
 alternates:{canonical:"/tyres/sizes"}
};
async function SizeGuideContent({searchParams}:Props){
 await connection();
 const q=await searchParams;
 const width=tyreSizeQuery(q.width,125,385),profile=tyreSizeQuery(q.profile,20,95);
 const rim=tyreSizeQuery(q.rim,10,26);
 const specified=Boolean(width&&profile&&rim);
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className={styles.shell}>
   <span className={styles.eyebrow}>AVUQO · Know your tyre</span>
   <h1>Three numbers.<br/><em>One clearer start.</em></h1>
   <p>Understanding the markings on your tyre is the first step towards a confident choice.</p>
  </div></section>
  <div className={styles.shell+" "+styles.main}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/tyres">Tyres</Link><span>/</span><span>Tyre size explained</span></nav>
   <section className={styles.section}>
    <div className={styles.sizeResult}>
     <div><p className={styles.kicker}>Your selected dimensions</p>
      <strong className={styles.sizeDisplay}>{specified?width+"/"+profile+" R"+rim:"205/55 R16"}</strong>
      <p className={styles.sub}>{specified?"This is the size you entered, not a verified vehicle match.":"An illustrative example of a standard radial tyre marking."}</p>
     </div>
     <Link href="/tyres" className={styles.cta}>Choose another size</Link>
     {specified&&<Link href={"/tyres/find?width="+width+"&profile="+profile+"&rim="+rim} className={styles.cta}>Find verified exact variants →</Link>}
    </div>
   </section>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>Reading the markings</p><h2>What each part tells you.</h2>
      <p className={styles.sub}>A tyre size alone is not enough to confirm suitability for a specific car.</p></div></div>
    <div className={styles.infoGrid}>
     <article className={styles.info}><span className={styles.number}>205</span><b>Width in millimetres</b><p>Nominal tread-section width. Your vehicle may require a different approved width.</p></article>
     <article className={styles.info}><span className={styles.number}>55</span><b>Profile / aspect ratio</b><p>Sidewall height expressed as a percentage of nominal section width.</p></article>
     <article className={styles.info}><span className={styles.number}>R16</span><b>Radial, 16-inch rim</b><p>R indicates radial construction; the number is the wheel rim diameter in inches.</p></article>
    </div>
   </section>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>Beyond the size</p><h2>Check the full specification.</h2></div></div>
    <div className={styles.infoGrid}>
     <article className={styles.info}><b>Load index</b><p>The numerical load rating must meet the vehicle manufacturer&apos;s requirements for the specified axle and fitment.</p></article>
     <article className={styles.info}><b>Speed rating</b><p>The speed symbol is a rated capability, not a recommendation to drive at that speed. Confirm vehicle requirements.</p></article>
     <article className={styles.info}><b>Special variants</b><p>Winter and all-season markings, reinforced/XL, run-flat and other variants can matter even when the nominal size matches.</p></article>
    </div>
   </section>
   <aside className={styles.notice}><strong>Important:</strong> Consult the vehicle handbook, tyre placard or a qualified tyre fitting professional before purchasing. The approved-product finder is available, but private imported products never become public without separate rights and technical checks. AVUQO does not certify vehicle-fitment or installed prices.</aside>
   <p style={{marginTop:25}}><Link className={styles.textLink} href="/tyres/brands">Explore tyre manufacturers →</Link></p>
  </div><Footer/></main>;
}
export default function Page({searchParams}:Props){
 return <Suspense fallback={<main className={styles.page}><Header/><div className={styles.shell+" "+styles.main}>Preparing tyre size guide…</div><Footer/></main>}>
  <SizeGuideContent searchParams={searchParams}/>
 </Suspense>;
}
