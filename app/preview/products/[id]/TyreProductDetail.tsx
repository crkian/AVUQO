import Link from "next/link";
import {tyreBrandSlug,tyreEvidence,tyreSizeHref} from "../../../../lib/tyres/catalogue";
import styles from "./detail.module.css";
export default function TyreProductDetail({brand,metadata,merchantProductId}:{
 brand:string|null;metadata:Record<string,unknown>|null;merchantProductId:string;
}){
 const ev=tyreEvidence(metadata);
 const facts=[
  {label:"Tyre size candidate",value:ev.size},
  {label:"Nominal width",value:ev.width?`${ev.width} mm`:null},
  {label:"Aspect ratio",value:ev.profile?`${ev.profile}%`:null},
  {label:"Rim diameter",value:ev.rim?`${ev.rim} inches`:null},
  {label:"Load index candidate",value:ev.load},
  {label:"Speed rating candidate",value:ev.speed},
  {label:"Supplier product identifier",value:merchantProductId}
 ];
 return <div className={styles.sections}>
  <section className={styles.panel}>
   <p className={styles.eyebrow}>Tyre-specific product detail</p><h2>Technical specifications</h2>
   <p>These are supplier-derived candidates from a historical Awin import. They are not independently verified and do not confirm vehicle fitment.</p>
   {ev.hasConflict&&<p role="alert" className={styles.note}>Conflicting tyre size evidence. No fitment or tyre size is recommended.</p>}
   <dl className={styles.facts}>{facts.filter(f=>Boolean(f.value)).map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
   {!ev.size&&<p className={styles.note}>No unambiguous source-supported tyre size is available for this record.</p>}
   <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:16}}>
    {ev.size&&<Link className={styles.back} style={{marginTop:0}} href={tyreSizeHref(ev)}>More private tyres in this size →</Link>}
    {brand&&tyreBrandSlug(brand)&&<Link className={styles.back} style={{marginTop:0}} href={`/preview/tyres/brands/${tyreBrandSlug(brand)}`}>Explore {brand} range →</Link>}
   </div>
   <h3>Important specification checks</h3>
   <ul><li>Exact size, load index and speed rating versus vehicle handbook</li>
    <li>Season, XL/reinforced, run-flat and construction for this precise variant</li>
    <li>EU tyre label, wet-grip/noise and applicable manufacturer evidence</li>
    <li>Tyre age and condition, fitting, balancing and disposal requirements</li></ul>
  </section>
  <section className={styles.panel}>
   <p className={styles.eyebrow}>AVUQO release checklist</p><h2>What must be verified?</h2>
   <p>The imported product title is not enough to establish suitability. Before this becomes a public offer, each release gate needs traceable evidence.</p>
   <dl className={styles.facts}>
    <div><dt>Vehicle compatibility</dt><dd>Not verified</dd></div>
    <div><dt>Load/speed ratings</dt><dd>{ev.load||ev.speed?"Candidates only":"Missing"}</dd></div>
    <div><dt>Season / run-flat / XL</dt><dd>Not verified</dd></div>
    <div><dt>Current fitted price</dt><dd>Not confirmed</dd></div>
    <div><dt>Retailer publication and imagery rights</dt><dd>Not approved</dd></div>
    <div><dt>Active merchant checkout</dt><dd>Disabled</dd></div>
   </dl>
   <h3>Actual comparisons come later</h3><p>No best-price badge, ranking, guaranteed savings or vehicle recommendation is displayed until fresh comparable offers and permitted source evidence exist.</p>
   <Link href="/preview/tyres" className={styles.back}>← Return to private tyre showroom</Link>
  </section>
 </div>;
}
