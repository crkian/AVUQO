import { connection } from "next/server";

import { createClient } from "../../lib/supabase/server";
import LiveDealCard, { type LiveDealCardData } from "./LiveDealCard";
import styles from "./LiveDealRail.module.css";

export default async function LiveDealRail({ limit = 4 }: { limit?: number }) {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("published_deals")
    .select("offer_id,title,category,merchant,current_price,typical_price,saving_amount,avuqo_score,confidence,label,decision,image_url,reason")
    .eq("status", "published")
    .order("avuqo_score", { ascending: false })
    .limit(limit);

  if (!data?.length) {
    return (
      <div className={styles.empty}>
        Live pipeline deals will appear here after an approved source has been ingested and scored.
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {(data as LiveDealCardData[]).map((deal) => <LiveDealCard key={deal.offer_id} deal={deal} />)}
    </div>
  );
}
