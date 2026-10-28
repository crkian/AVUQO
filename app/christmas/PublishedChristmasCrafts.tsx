import { connection } from "next/server";
import { createClient } from "../../lib/supabase/server";
import LiveDealCard, { type LiveDealCardData } from "../../components/live/LiveDealCard";
import styles from "./published-crafts.module.css";

/**
 * Read only from AVUQO&apos;s existing public publication gate.
 * Raw feed_import_records must never be rendered to public visitors.
 */
export default async function PublishedChristmasCrafts() {
  await connection();
  const db = await createClient();
  const { data, error } = await db.from("published_deals")
    .select("offer_id,title,category,merchant,current_price,typical_price,saving_amount,avuqo_score,confidence,label,decision,image_url,reason")
    .eq("status","published")
    .eq("merchant","Craft Buddy Shop")
    .gt("current_price",0)
    .order("avuqo_score",{ascending:false})
    .limit(8);

  const products = error ? [] : (data ?? []) as LiveDealCardData[];
  return <section className="shell section" aria-labelledby="christmas-crafts-heading">
    <div className="section-title">
      <div>
        <p className="kicker">Published retailer offers</p>
        <h2 id="christmas-crafts-heading">Creative gifts from Craft Buddy</h2>
        <p>Only offers that have passed AVUQO&apos;s publication process appear below.</p>
      </div>
    </div>
    {products.length ? <div className={styles.grid}>{products.map(product =>
      <LiveDealCard key={product.offer_id} deal={product}/>
    )}</div> : <div className={styles.empty}>
      <strong>Product listings are being verified.</strong>
      <p>Craft Buddy&apos;s catalogue is available to AVUQO, but individual offers are not yet approved for public display. Gift ideas above remain available while we complete that work.</p>
    </div>}
    <p className={styles.disclosure}>Prices and availability can change. Check final amounts and delivery with the retailer. AVUQO may receive commission from eligible purchases.</p>
  </section>;
}
