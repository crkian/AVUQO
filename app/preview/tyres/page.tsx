import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {tyreCollections,tyreBrandSlug,TYRES_UK_IMPORT_ID} from "../../../lib/tyres/catalogue";
import TyreCards,{type PrivateTyreCardRow} from "./_components/TyreCards";
import styles from "../../tyres/tyres.module.css";

export const instant=false;
export const metadata:Metadata={title:"Private Tyre Showroom | AVUQO",robots:{index:false,follow:false}};
export default async function PrivateTyreShowroom(){
 await connection();await requireControlCentreAccess();
 const db=await createClient();
 const [{data:facets},{data:rows,count,error}]=await Promise.all([
  db.rpc("private_tyre_preview_facets",{p_import_id:TYRES_UK_IMPORT_ID}),
  db.from("feed_import_records").select("id,title,brand,price,currency,metadata",{count:"exact"})
   .eq("import_id",TYRES_UK_IMPORT_ID).eq("status","review").order("title").limit(12)
 ]);
 const raw=facets&&typeof facets==="object"&&!Array.isArray(facets)?facets as Record<string,unknown>:{};
 const brands=Array.isArray(raw.brands)?raw.brands.filter((s):s is string=>typeof s==="string"&&s.length<101).sort((a,b)=>a.localeCompare(b)):[];
 const brandSlugs=new Set<string>();
 const uniqueBrands=brands.filter(brand=>{const slug=tyreBrandSlug(brand);if(!slug||brandSlugs.has(slug))return false;brandSlugs.add(slug);return true;});
 return <main className={styles.page}><Header/>
  <div className={styles.privateBar}>OWNER-ONLY PRODUCT SHOWROOM · 2026 Awin supplier import · No public offers, vehicle-fitment approvals or checkout</div>
  <section className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}>
   <div><span className={styles.eyebrow}>AVUQO · Private production rehearsal</span>
    <h1>Tyres, <em>ready for scrutiny.</em></h1>
    <p>Preview how real supplier records will appear in premium brand, size and single-product pages. Every source attribute stays clearly labelled until independently verified.</p>
    <div className={styles.heroActions}><Link className={styles.cta} href="/preview/tyres/sizes">Find by tyre size</Link><Link className={styles.ghost} href="/preview/products?merchant=12715">Open full private catalogue</Link></div>
   </div><div className={styles.tyreArt} aria-hidden="true"/>
  </div></section>
  <div className={`${styles.shell} ${styles.main}`}>
   <nav className={styles.breadcrumb}><Link href="/control-centre">Control Centre</Link><span>/</span><span>Tyre showroom</span></nav>
   <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Source-backed review</p><h2>{error?"Catalogue status unavailable":(count??0).toLocaleString("en-GB")+" staged tyre records"}</h2>
    <p className={styles.sub}>Source: Tyres UK, Awin feed 93988. These records are held privately, not approved for publication. Manufacturer and size attributes originate from supplier data.</p></div></div>
    {error&&<div className={styles.notice} role="alert">Private catalogue could not be loaded. No products are shown.</div>}
    <TyreCards rows={(rows??[]) as PrivateTyreCardRow[]}/>
    <p style={{marginTop:18}}><Link className={styles.textLink} href="/preview/products?merchant=12715">Browse all private tyres with filters →</Link></p>
   </section>
   <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Manufacturers</p><h2>Browse supplier-reported brands</h2>
    <p className={styles.sub}>Private brand pages load products across the full staged dataset, not a 12-card sample. Manufacturer identity is not independently confirmed.</p></div></div>
    <div className={styles.brandGrid}>{uniqueBrands.map(brand=><Link key={brand} className={styles.brandLink} href={`/preview/tyres/brands/${tyreBrandSlug(brand)}`}>
     {brand}<span aria-hidden="true">→</span></Link>)}</div>
   </section>
   <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Category architecture</p><h2>Planned tyre collections</h2><p className={styles.sub}>These editorial types are not assigned automatically from the staged tyre names. Classification and rights must be approved before any related products go public.</p></div></div>
    <div className={styles.cardGrid}>{tyreCollections.map(cat=><div key={cat.slug} className={styles.card}><h3>{cat.title}</h3><p>{cat.description}</p><small>{cat.readiness}</small><Link href={`/tyres/categories/${cat.slug}`}>View safe category layout →</Link></div>)}</div>
   </section>
   <aside className={styles.notice}><strong>Release gate:</strong> The live Car tyres taxonomy record is inactive. No manufacturer offer, tyre category or product page may become a public commercial listing until source and image rights, canonical taxonomy, technical evidence, current total prices and suitability checks have been accepted.</aside>
  </div><Footer/></main>;
}
