import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {tyreBrandNames,tyreBrandSlug,resolveTyreBrand} from "../../../../lib/tyres/catalogue";
import styles from "../../tyres.module.css";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return tyreBrandNames.map(name=>({slug:tyreBrandSlug(name)}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const name=resolveTyreBrand((await params).slug,tyreBrandNames);
 return {title:name?`${name} tyre guide | AVUQO`:"Tyre manufacturer | AVUQO",robots:{index:false,follow:true}};
}
export default async function BrandGuide({params}:Props){
 const name=resolveTyreBrand((await params).slug,tyreBrandNames);
 if(!name)notFound();
 return <main className={styles.page}><Header/><section className={styles.hero}><div className={styles.shell}>
  <span className={styles.eyebrow}>AVUQO · Manufacturer guide</span><h1>{name}<br/><em>tyres, understood.</em></h1>
  <p>Prepare to compare precise {name} tyre models by their verified size, ratings and overall fitted cost, rather than a brand name alone.</p>
 </div></section>
 <div className={`${styles.shell} ${styles.main}`}>
  <nav className={styles.breadcrumb}><Link href="/tyres">Tyres</Link><span>/</span><Link href="/tyres/brands">Manufacturers</Link><span>/</span>{name}</nav>
  <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Before comparing</p><h2>Find the right {name} model</h2><p className={styles.sub}>Similar model names can cover several sizes, load ratings, speed ratings or construction variants. Check the full marking and the vehicle manufacturer's guidance.</p></div></div>
   <div className={styles.infoGrid}>
    <div className={styles.info}><b>Match the exact size</b><p>Start with the manufacturer-approved width, aspect ratio and wheel diameter for your vehicle.</p></div>
    <div className={styles.info}><b>Check every variant</b><p>Confirm the load and speed rating and any XL, run-flat or seasonal specification for the specific tyre.</p></div>
    <div className={styles.info}><b>Compare the full cost</b><p>Look for accurate, current pricing and confirm fitting, delivery and disposal charges before deciding.</p></div>
   </div></section>
  <aside className={styles.notice}>There are no verified live {name} offers on this AVUQO page yet. The private supplier catalogue cannot be published without source-rights and product-level checks. AVUQO does not claim manufacturer affiliation or endorsement.</aside>
  <p><Link className={styles.textLink} href="/tyres/brands">← All manufacturers</Link></p>
 </div><Footer/></main>;
}