import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import Footer from "../../../components/layout/Footer";
import Header from "../../../components/layout/Header";
import AddToListButton from "../../../components/lists/AddToListButton";
import SaveButton from "../../../components/saved/SaveButton";
import WatchButton from "../../../components/watch/WatchButton";
import { money } from "../../../lib/avuqo/deal";
import { createClient } from "../../../lib/supabase/server";
import { verifiedOffers } from "../../../lib/products/public-catalog";
import type { Deal, DealDecision, DealRating } from "../../../types/deal";
import styles from "./page.module.css";

export const instant = false;

type Props = { params: Promise<{ offerId: string }> };
type ScoreComponent = { component_name: string; component_score: number | null; evidence: unknown };

function rating(label: string): DealRating {
  const value = label.toLowerCase();
  if (value === "exceptional") return "exceptional";
  if (value === "excellent") return "excellent";
  if (value === "good") return "good";
  if (value === "fair") return "fair";
  return "weak";
}


function componentExplanation(name: string) {
  const copy: Record<string, string> = {
    historical_normal_price: "How today’s price compares with the product’s observed normal range.",
    competitor_comparison: "How this offer compares with other active merchants for the same matched product.",
    historical_low: "How close the current price sits to the lowest price AVUQO has observed.",
    genuine_saving: "Whether the saving is supported by previous, RRP or historical reference prices.",
    merchant_quality: "The merchant reliability signal used by the value engine.",
    delivery_inclusions: "Whether delivery costs improve or weaken the real all-in value.",
    evidence_confidence: "How strongly source quality, matching and market coverage support the conclusion.",
  };
  return copy[name] ?? "A structured component of the AVUQO value calculation.";
}

function decision(value: string | null): DealDecision {
  if (value === "Buy now" || value === "Worth considering" || value === "Watch" || value === "Wait") return value;
  return "Watch";
}

export default async function LiveDealPage({ params }: Props) {
  await connection();
  const { offerId } = await params;
  const supabase = await createClient();

  const [eligible] = await verifiedOffers({offerId, limit:1});
  if (!eligible) notFound();
  const row=eligible.published;
  const [{ data: history }, { data: scoreRow }] = await Promise.all([
    supabase.from("price_history").select("price,observed_at").eq("offer_id", offerId).eq("is_valid", true).order("observed_at", { ascending: true }).limit(40),
    supabase.from("deal_scores").select("id,explanation").eq("offer_id", offerId).maybeSingle(),
  ]);

  const { data: components } = scoreRow?.id
    ? await supabase.from("score_components").select("component_name,component_score,evidence").eq("deal_score_id", scoreRow.id).order("weight", { ascending: false })
    : { data: [] as ScoreComponent[] };

  const historyValues = (history ?? []).map((item) => Number(item.price)).filter(Number.isFinite);
  const max = Math.max(Number(row.current_price), ...historyValues, 1);
  const typical = Number(row.typical_price ?? row.current_price);
  const liveDeal: Deal = {
    id: row.offer_id,
    title: row.title,
    category: row.category,
    currentPrice: Number(row.current_price),
    typicalPrice: typical,
    avuqoScore: Number(row.avuqo_score),
    confidence: Number(row.confidence),
    rating: rating(row.label),
    decision: decision(row.decision),
    savingAmount: Number(row.saving_amount ?? 0),
    reason: row.reason ?? `${row.label} value`,
    merchant: row.merchant,
    stockStatus: row.stock_status === "low_stock" ? "low_stock" : row.stock_status === "out_of_stock" ? "out_of_stock" : "in_stock",
    priceHistory: historyValues.length ? historyValues : [Number(row.current_price)],
    tags: ["live", "pipeline-scored"],
  };

  return (
    <main>
      <Header />
      <section className={styles.hero}>
        <div className="shell">
          <Link href="/live" className="back-link"><ArrowLeft size={17}/> Back to live deals</Link>
          <div className={styles.grid}>
            <div className={styles.art}>
              {row.image_url ? <img src={row.image_url} alt="" /> : <span className={styles.q}>Q</span>}
            </div>
            <div className={styles.summary}>
              <p className="kicker">Approved-source AVUQO intelligence</p>
              <h1>{row.title}</h1>
              <div className={styles.scoreRow}>
                <div className={styles.score}>{row.avuqo_score}</div>
                <div>
                  <div className={styles.price}>{money(Number(row.current_price))}</div>
                  <div className={styles.typical}>Reference price {money(typical)}</div>
                  <div className={styles.confidence}>{row.confidence}% evidence confidence</div>
                </div>
              </div>
              <div className={styles.saving}>
                <b>{money(Number(row.saving_amount ?? 0))} below reference</b><br/>{row.reason}
              </div>
              <div className={styles.meta}>
                <span className={styles.pill}>{row.label}</span>
                <span className={styles.pill}>{row.decision}</span>
                <span className={styles.pill}>{row.category}</span>
                <span className={styles.pill}>{row.merchant}</span>
              </div>
              <div className={styles.actions}>
                <Link className={styles.retailer} href={`/go/${row.offer_id}`}>Go to retailer</Link>
                <WatchButton deal={{id:liveDeal.id,title:liveDeal.title,category:liveDeal.category,currentPrice:liveDeal.currentPrice,typicalPrice:liveDeal.typicalPrice,avuqoScore:liveDeal.avuqoScore,merchant:liveDeal.merchant}} />
              </div>
              <div className={styles.secondary}><SaveButton deal={liveDeal}/><AddToListButton deal={liveDeal}/></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`shell ${styles.section}`}>
        <div className={styles.evidence}>
          {(components ?? []).slice(0, 6).map((component: ScoreComponent) => (
            <article className={styles.card} key={component.component_name}>
              <span>{String(component.component_name).replaceAll("_", " ")}</span>
              <strong>{Math.round(Number(component.component_score))}/100</strong>
              <p>{componentExplanation(String(component.component_name))}</p>
            </article>
          ))}
        </div>
        <div className={styles.historyPanel}>
          <p className="kicker">Observed price history</p>
          <h2>AVUQO remembers what the price actually did.</h2>
          <div className={styles.history}>
            {liveDeal.priceHistory.map((price, index) => (
              <span key={`${price}-${index}`} style={{height:`${Math.max(8, Math.round((price/max)*100))}%`}} title={money(price)} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
