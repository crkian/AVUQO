import Link from "next/link";
import {ArrowRight,Package,ShieldCheck} from "lucide-react";

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
        {deal.image_url ? <img src={deal.image_url} alt="" loading="lazy" referrerPolicy="no-referrer"/> : <span className={styles.noPhoto}><Package size={42} aria-hidden="true"/><small>Image unavailable for publication</small></span>}
        <span className={styles.score} aria-label={`Published AVUQO Score ${deal.avuqo_score}`}><strong>{deal.avuqo_score}</strong><small>AVUQO<br/>Score</small></span>
      </div>
      <div className={styles.body}>
        <span className={styles.kicker}><ShieldCheck size={13} aria-hidden="true"/> {deal.category} · {deal.merchant}</span>
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
        <Link className={styles.link} href={`/live/${deal.offer_id}`}>See offer evidence <ArrowRight size={16} aria-hidden="true"/></Link>
      </div>
    </article>
  );
}
