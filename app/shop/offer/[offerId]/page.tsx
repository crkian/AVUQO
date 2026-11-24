import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {readShoppingReleases} from "../../../../lib/products/shopping-release-reader";
import styles from "../../page.module.css";
// Decide eligibility before streaming HTML; no prerendered price or soft 404.
export const instant = false;
export const metadata={title:"Verified retail offer | AVUQO",robots:{index:false,follow:true}};
export default async function OfferDetail({params}:{params:Promise<{offerId:string}>}){
 await connection();
 const {offerId}=await params;
 const [offer]=await readShoppingReleases([offerId]);
 if(!offer)notFound();
 return <><Header/><main className={styles.page}><section className={styles.hero}><div className="shell"><nav className={styles.breadcrumb}><Link href="/shop/retail">Retail offers</Link></nav><h1>{offer.title}</h1><p>{offer.merchantName}</p></div></section>
 <div className={"shell "+styles.content}><article className={styles.card}><div className={styles.cardBody}>
 <strong className={styles.price}>{new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(offer.price)}</strong>
 <p>Verified item price. Delivery and fitting costs, where applicable, may be extra.</p>
 <p>Last checked {new Date(offer.lastSeenAt).toLocaleString("en-GB",{timeZone:"Europe/London"})} UK time. Confirm availability and terms with the retailer.</p>
 <p>Ordinary retailer offer, not a verified discount or cross-retailer match.</p>
 <Link className={styles.view} href={"/go/"+offer.offerId}>Visit retailer</Link>
 <p><Link href="/affiliate-disclosure">Affiliate disclosure</Link></p>
 </div></article></div></main><Footer/></>;
}
