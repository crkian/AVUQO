import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Header from "../../../../../components/layout/Header";
import Footer from "../../../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../../lib/supabase/server";
import {resolveTyreBrand,TYRES_UK_IMPORT_ID} from "../../../../../lib/tyres/catalogue";
import TyreCards,{type PrivateTyreCardRow} from "../../_components/TyreCards";
import styles from "../../../../tyres/tyres.module.css";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>};
export const instant=false;
export const metadata:Metadata={title:"Private manufacturer tyre range | AVUQO",robots:{index:false,follow:false}};
export default async function BrandPreview({params,searchParams}:Props){
 await connection();await requireControlCentreAccess();
 const {slug}=await params;
 const {page:pageArg}=await searchParams;
 const db=await createClient();
 const {data:facetData,error:facetError}=await db.rpc("private_tyre_preview_facets",{p_import_id:TYRES_UK_IMPORT_ID});
 if(facetError||!facetData||typeof facetData!=="object"||Array.isArray(facetData))notFound();
 const raw=facetData as Record<string,unknown>;
 const brands=Array.isArray(raw.brands)?raw.brands.filter((b):b is string=>typeof b==="string"&&b.length<=100):[];
 const brand=resolveTyreBrand(slug,brands);
 if(!brand)notFound();
 const page=/^[1-9]\d{0,3}$/.test(pageArg??"")?Number(pageArg):1;
 const size=24;
 const {data,count,error}=await db.from("feed_import_records")
  .select("id,title,brand,price,currency,metadata",{count:"exact"})
  .eq("import_id",TYRES_UK_IMPORT_ID).eq("status","review").eq("brand",brand)
  .order("title",{ascending:true}).order("id",{ascending:true})
  .range((page-1)*size,page*size-1);
 const total=count??0,limit=Math.max(1,Math.ceil(total/size));
 return <main className={styles.page}><Header/>
  <div className={styles.privateBar}>PRIVATE MANUFACTURER SHOWROOM · Historical supplier products, not approved live offers</div>
  <section className={styles.hero}><div className={styles.shell}>
   <span className={styles.eyebrow}>AVUQO · Brand range rehearsal</span><h1>{brand}<br/><em>tyre collection.</em></h1>
   <p>Supplier-reported brand identity and product variants from the actual private import. Final public matching, imagery rights, stock and fitted costs are not verified.</p>
  </div></section>
  <div className={`${styles.shell} ${styles.main}`}>
   <nav className={styles.breadcrumb}><Link href="/preview/tyres">Tyres showroom</Link><span>/</span><span>{brand}</span></nav>
   <section className={styles.section}><div className={styles.headingRow}><div><p className={styles.kicker}>Entire private dataset</p>
    <h2>{error?"Unable to load":total.toLocaleString("en-GB")+" matching records"}</h2>
    <p className={styles.sub}>Showing {brand} product names exactly as supplied. Prices are historical import values and specifications are unverified candidates.</p></div></div>
    {error?<p role="alert" className={styles.notice}>Unable to load the brand&apos;s private catalogue.</p>:<TyreCards rows={(data??[]) as PrivateTyreCardRow[]}/>}
    {total>size&&<nav className={styles.headingRow} aria-label="Private manufacturer product pages" style={{marginTop:24}}>
     <span>Page {page} of {limit}</span><div style={{display:"flex",gap:15}}>
      {page>1&&<Link className={styles.textLink} href={`?page=${page-1}`}>← Previous</Link>}
      {page<limit&&<Link className={styles.textLink} href={`?page=${page+1}`}>Next →</Link>}
     </div></nav>}
   </section>
   <aside className={styles.notice}>No manufacturer endorsement is implied. The source has not been independently approved for public product-page syndication, and no tyre presented here is verified for a specific vehicle.</aside>
   <p><Link className={styles.textLink} href="/preview/tyres">← All private manufacturers</Link></p>
  </div><Footer/></main>;
}