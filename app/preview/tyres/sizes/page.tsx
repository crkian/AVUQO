import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import {tyreSizeQuery,TYRES_UK_IMPORT_ID} from "../../../../lib/tyres/catalogue";
import TyreCards,{type PrivateTyreCardRow} from "../_components/TyreCards";
import styles from "../../../tyres/tyres.module.css";
type Props={searchParams:Promise<{width?:string;profile?:string;rim?:string;page?:string}>};
export const instant=false;
export const metadata:Metadata={title:"Private tyre size finder | AVUQO",robots:{index:false,follow:false}};
export default async function PrivateSizeFinder({searchParams}:Props){
 await connection();await requireControlCentreAccess();
 const params=await searchParams;
 const width=tyreSizeQuery(params.width,125,385),profile=tyreSizeQuery(params.profile,20,95),
  rim=tyreSizeQuery(params.rim,10,26);
 const ready=Boolean(width&&profile&&rim);
 const page=/^[1-9]\d{0,3}$/.test(params.page??"")?Number(params.page):1,size=24;
 const db=await createClient();
 const {data:facets}=await db.rpc("private_tyre_preview_facets",{p_import_id:TYRES_UK_IMPORT_ID});
 const raw=facets&&typeof facets==="object"&&!Array.isArray(facets)?facets as Record<string,unknown>:{};
 const numbers=(field:string,min:number,max:number)=>Array.isArray(raw[field])
  ?(raw[field] as unknown[]).filter((n):n is number=>Number.isInteger(n)&&Number(n)>=min&&Number(n)<=max)
  :[];
 const widths=numbers("widths",125,385),profiles=numbers("profiles",20,95),rims=numbers("rims",10,26);
 let rows:PrivateTyreCardRow[]=[],total=0,error=false;
 if(ready){
  const result=await db.from("feed_import_records").select("id,title,brand,price,currency,metadata",{count:"exact"})
   .eq("import_id",TYRES_UK_IMPORT_ID).eq("status","review")
   .eq("metadata->tyre_size_candidate->>width_mm",width)
   .eq("metadata->tyre_size_candidate->>aspect_ratio",profile)
   .eq("metadata->tyre_size_candidate->>rim_inches",rim)
   .order("title",{ascending:true}).order("id",{ascending:true})
   .range((page-1)*size,page*size-1);
  rows=(result.data??[]) as PrivateTyreCardRow[];
  total=result.count??0;error=Boolean(result.error);
 }
 const query=new URLSearchParams({width,profile,rim});
 return <main className={styles.page}><Header/>
  <div className={styles.privateBar}>OWNER-ONLY SIZE SEARCH · Size information is supplier-derived and is not a vehicle-fitment approval</div>
  <section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>Tyre size explorer</span>
   <h1>Find the size.<br/><em>Inspect the evidence.</em></h1>
   <p>Search the complete private Tyres UK catalogue using width, profile and rim diameter. Confirm your vehicle's approved tyre specification separately.</p>
  </div></section>
  <div className={`${styles.shell} ${styles.main}`}>
   <nav className={styles.breadcrumb}><Link href="/preview/tyres">Tyres showroom</Link><span>/</span><span>Search by size</span></nav>
   <section className={styles.section}><h2>Search a specific tyre size</h2>
    <form method="get" action="/preview/tyres/sizes" className={styles.filters}>
     <label>Width (mm)<select name="width" defaultValue={width} required><option value="">Choose width</option>{widths.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
     <label>Profile (%)<select name="profile" defaultValue={profile} required><option value="">Choose profile</option>{profiles.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
     <label>Rim (inches)<select name="rim" defaultValue={rim} required><option value="">Choose rim</option>{rims.map(n=><option key={n} value={n}>R{n}</option>)}</select></label>
     <button type="submit">Search private tyres</button>
    </form>
    {!ready?<p className={styles.notice}>Choose all three dimensions to search. Available menu values come from real staged records, but combinations may not exist. This is not a registration or fitment finder.</p>
     :<><div className={styles.headingRow}><div><p className={styles.kicker}>Private review matches</p>
      <h2>{width}/{profile} R{rim} · {total.toLocaleString("en-GB")} records</h2>
      <p className={styles.sub}>Product descriptions and tyre sizes are unverified candidates from the historical retailer import. No live quote or vehicle approval.</p></div></div>
      {error?<p role="alert" className={styles.notice}>Unable to load results.</p>:<TyreCards rows={rows}/>}
      {total>size&&<nav aria-label="Private tyre size search results" className={styles.headingRow} style={{marginTop:25}}>
       <span>Page {page} of {Math.ceil(total/size)}</span><div style={{display:"flex",gap:15}}>
        {page>1&&<Link className={styles.textLink} href={`?${query.toString()}&page=${page-1}`}>← Previous</Link>}
        {page*size<total&&<Link className={styles.textLink} href={`?${query.toString()}&page=${page+1}`}>Next →</Link>}
       </div></nav>}</>}
   </section>
   <p><Link className={styles.textLink} href="/preview/tyres">← Private tyre showroom</Link></p>
  </div><Footer/></main>;
}