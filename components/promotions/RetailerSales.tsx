import Link from "next/link";
import {connection} from "next/server";
import {ArrowRight,BadgePercent,CalendarDays,ShieldCheck} from "lucide-react";
import {activeRetailerSales,activeSaleProducts} from "../../lib/promotions/retailer-sales";
import styles from "./RetailerSales.module.css";

type Props={placement?:"home"|"sales"|"category";category?:string};
export default async function RetailerSales({placement="category",category}:Props){
 // Keeps time-limited campaigns off cached and prerendered pages after expiry.
 await connection();
 const at=new Date();
 const sales=activeRetailerSales(at,category);
 if(!sales.length)return null;
 return <section className={styles.section} aria-label="Current retailer-announced sales">
  <div className="shell">
   <div className={styles.heading}>
    <div><p className={styles.kicker}><BadgePercent size={16}/> Current retailer sales</p>
     <h2>{placement==="home"?"Sales happening now":placement==="sales"?"Retailer-announced promotions":"Offers related to this department"}</h2>
     <p>Published retailer campaign announcements are separate from AVUQO&apos;s independently checked price reductions.</p>
    </div>
    {placement!=="sales"&&<Link href="/sales">All sales <ArrowRight size={16}/></Link>}
   </div>
   <div className={styles.sales}>
    {sales.map(sale=>{
     const visible=activeSaleProducts(sale,at);
     const format=(value:string|number)=>new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/London"}).format(new Date(value));
     return <article className={styles.sale} key={sale.id}>
      <div className={styles.details}>
       <span className={styles.merchant}>{sale.merchant} · Advertiser-announced</span>
       <h3>{sale.heading}</h3><p>{sale.description}</p>
       <small className={styles.dates}><CalendarDays size={15}/> {format(sale.start)} to {format(Date.parse(sale.end)-86400000)} · Selected items only</small>
       <small>Advertiser broadcast: {format("2026-11-19T00:00:00Z")} · Advertised terms may change</small>
       <div className={styles.links}>
        <a href={sale.retailerUrl} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View ${sale.merchant} sale directly with the retailer`}>Visit retailer sale <ArrowRight size={16}/></a>
        <Link href={"/categories/"+sale.categorySlugs[0]+"/products"}>Compare eligible {sale.categorySlugs[0]} products <ArrowRight size={16}/></Link>
       </div>
      </div>
      <div className={styles.products}>
       <h4>Advertised product offers {visible.length?"available in this date window":""}</h4>
       {visible.length?
        <ul>{visible.slice(0,placement==="home"?3:6).map(product=>
         <li key={product.name}><a href={product.retailerUrl} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View ${product.name} on the retailer website`}><b>{product.name}</b><small>{product.description}</small></a>
          <span className={styles.discount}>{product.percent}% off</span>
         </li>)}</ul>:
        <p>Some advertised product discounts are scheduled for other dates within the campaign.</p>}
       <p className={styles.disclosure}><ShieldCheck size={15}/> Percentages are from the retailer&apos;s dated announcement, not an independent AVUQO price-history verification. Check final price, stock and terms at checkout.</p>
      </div>
     </article>;
    })}
   </div>
  </div>
 </section>;
}
