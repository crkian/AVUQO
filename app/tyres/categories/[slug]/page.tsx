import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {tyreCollections} from "../../../../lib/tyres/catalogue";
import styles from "../../tyres.module.css";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return tyreCollections.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;
 const cat=tyreCollections.find(c=>c.slug===slug);
 return {title:cat?`${cat.title} buying guide | AVUQO`:"Tyre type | AVUQO",
  robots:{index:false,follow:true}};
}
export default async function Category({params}:Props){
 const {slug}=await params;
 const category=tyreCollections.find(c=>c.slug===slug);
 if(!category)notFound();
 return <main className={styles.page}><Header/>
 <section className={styles.hero}><div className={styles.shell}>
  <span className={styles.eyebrow}>Tyre type · Buying guide</span>
  <h1>{category.title}.<br/><em>Evidence first.</em></h1>
  <p>{category.description}</p>
 </div></section>
 <div className={`${styles.shell} ${styles.main}`}>
  <nav className={styles.breadcrumb}><Link href="/tyres">Tyres</Link><span>/</span>{category.title}</nav>
  <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>What matters</p><h2>Get the specification right</h2></div></div>
  <div className={styles.infoGrid}>
   <div className={styles.info}><b>Size and suitability</b><p>Check the vehicle-approved size and specification before considering products in this category.</p></div>
   <div className={styles.info}><b>Evidence for this type</b><p>{category.readiness}. We do not guess a tyre&apos;s season, run-flat features or vehicle suitability from its product name.</p></div>
   <div className={styles.info}><b>Total payable cost</b><p>Compare only genuine, currently available products with fitting and delivery terms clearly explained.</p></div>
  </div></section>
  <aside className={styles.notice}>This is an editorial guide, not a populated live product category. Imported Awin products and historic prices remain private until validated and permissioned.</aside>
  <p><Link className={styles.textLink} href="/tyres">← Explore all tyre types</Link></p>
 </div><Footer/></main>;
}