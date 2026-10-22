import Link from "next/link";

import { money } from "../../lib/avuqo/deal";
import styles from "./LiveDealCard.module.css";

export type LiveDealCardData = {
  offer_id: string;
  title: string;
  category: string;
  merchant: string;
  current_price: number;
  typical_price: number | null;
  saving_amount: number | null;
  avuqo_score: number;
  confidence: number;
  label: string;
  decision: string | null;
  image_url: string | null;
  reason: string | null;
};

export default function LiveDealCard({ deal }: { deal: LiveDealCardData }) {
  return (
    <article className={styles.card}>
      <div className={styles.art}>
        {deal.image_url ? <img src={deal.image_url} alt="" /> : <span className={styles.q}>Q</span>}
        <span className={styles.score}>{deal.avuqo_score}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.kicker}>{deal.category} · {deal.merchant}</span>
        <h3>{deal.title}</h3>
        <div className={styles.priceRow}>
          <div className={styles.price}>
            <strong>{money(Number(deal.current_price))}</strong>
            {deal.typical_price ? <span>Typical {money(Number(deal.typical_price))}</span> : null}
          </div>
          {Number(deal.saving_amount ?? 0) > 0 ? (
            <span className={styles.saving}>Save {money(Number(deal.saving_amount))}</span>
          ) : null}
        </div>
        <p className={styles.reason}>{deal.reason ?? `${deal.label} value with ${deal.confidence}% confidence.`}</p>
        <Link className={styles.link} href={`/live/${deal.offer_id}`}>Open live deal</Link>
      </div>
    </article>
  );
}
