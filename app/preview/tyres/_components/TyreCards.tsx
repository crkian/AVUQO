import Link from "next/link";
import {stagedPrice} from "../../../../lib/feed-imports/preview-selection";
import {tyreBrandSlug,tyreEvidence} from "../../../../lib/tyres/catalogue";
import styles from "../../../tyres/tyres.module.css";
export type PrivateTyreCardRow={
 id:string;title:string;brand:string|null;price:number|string|null;
 currency:string;metadata:Record<string,unknown>|null;
};
export default function TyreCards({rows}:{rows:PrivateTyreCardRow[]}){
 if(rows.length===0)return <div className={styles.empty}>No privately staged review records match these filters. Nothing has been published.</div>;
 return <div className={styles.products}>{rows.map(row=>{
  const spec=tyreEvidence(row.metadata);
  return <Link href={`/preview/products/${row.id}`} key={row.id} className={styles.product}>
   <span className={styles.productBrand}>{row.brand||"Unclassified manufacturer"}</span>
   <h3>{row.title}</h3>
   <div className={styles.tags}>{spec.size&&<span className={styles.tag}>{spec.size} candidate</span>}
    {spec.load&&<span className={styles.tag}>Load {spec.load}*</span>}
    {spec.speed&&<span className={styles.tag}>Speed {spec.speed}*</span>}</div>
   <p>Original supplier specifications have not been independently validated for vehicle fitment.</p>
   <strong className={styles.price}>{stagedPrice(row.price,row.currency)}</strong>
   <small>Historical private import value, not a current fitted price</small>
   <span style={{fontSize:12,fontWeight:850,color:"#633b84"}}>Inspect private product →</span>
  </Link>;
 })}</div>;
}
