import Link from "next/link";
import {connection} from "next/server";
import {redirect} from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {ordinaryShoppingPage,type RetailQuery} from "../../../lib/products/shopping-catalogue";
import styles from "../page.module.css";
// Decide eligibility before streaming HTML; no prerendered price or soft 404.
export const instant = false;
export const metadata={title:"Verified retail offers | AVUQO",robots:{index:false,follow:true}};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export default async function RetailShelf({searchParams}:{searchParams:Promise<RetailQuery>}){
 await connection();
 const data=await ordinaryShoppingPage(await searchParams);
 if(!data.enabled)redirect("/shop");
 const href=(page:number)=>"/shop/retail?"+new URLSearchParams({q:data.q,sort:data.sort,page:String(page)}).toString();
 return <><Header/><main className={styles.page}><section className={styles.hero}><div className="shell">
 <nav className={styles.breadcrumb}><Link href="/shop">Shop</Link><span>/</span> Retail offers</nav>
 <h1>Everyday retail offers</h1><p>Verified current item prices, independently of deal scores. A listing is not a claim of savings or best market price.</p>
 </div></section><div className={"shell "+styles.content}>
 <form className={styles.controls} method="get" action="/shop/retail">
 <label className={styles.searchField}>Search retail products<input type="search" name="q" defaultValue={data.q} maxLength={80}/></label>
 <label className={styles.selector}>Sort<select name="sort" defaultValue={data.sort}><option value="recent">Recently checked</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
 <div className={styles.filterActions}><button type="submit">Search</button><Link href="/shop">Back to shopping</Link></div></form>
 <div className={styles.resultsHeading}><h2>{data.offers.length} verified offers on this page</h2><p>Item prices only; delivery may be extra.</p></div>
 <div className={styles.grid}>{data.offers.map(offer=><article key={offer.offerId} className={styles.card}>
 <Link className={styles.cardPrimary} href={"/shop/offer/"+offer.offerId}>{offer.gallery[0]&&<img src={offer.gallery[0]} alt="" loading="lazy" referrerPolicy="no-referrer" style={{width:"100%",height:180,objectFit:"contain",background:"#fff"}}/>}<span className={styles.cardBody}><small>{offer.merchantName}</small><strong>{offer.title}</strong><span className={styles.price}>{money(offer.price)}</span><small>SKU {offer.sku}</small><span className={styles.view}>View product details</span></span></Link></article>)}</div>
 {!data.offers.length&&<p role="status" className={styles.noItems}>No currently verified retail offers on this page.</p>}
 <nav className={styles.pagination} aria-label="Retail offer pages">{data.page>1?<Link href={href(data.page-1)}>Previous</Link>:<span/>}<span>Page {data.page}</span>{data.hasNext?<Link href={href(data.page+1)}>Next</Link>:<span/>}</nav>
 <p className={styles.disclosure}>Some retailer links may earn commission. Commission does not influence price ordering. <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.</p>
 </div></main><Footer/></>;
}
