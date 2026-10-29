import {connection} from "next/server";
import {verifiedOffers} from "../../lib/products/public-catalog";
import LiveDealCard from "./LiveDealCard";
import styles from "./LiveDealRail.module.css";
export default async function LiveDealRail({limit=4}:{limit?:number}){
 await connection();
 const rows=await verifiedOffers({limit});
 if(!rows.length)return <div className={styles.empty}>No authorised, fresh retailer offers are ready for public display. AVUQO does not show demonstration prices as live deals.</div>;
 return <div className={styles.grid}>{rows.map(({published})=><LiveDealCard key={published.offer_id} deal={published}/>)}</div>;
}
