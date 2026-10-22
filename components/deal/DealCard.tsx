import Link from "next/link";
import type { Deal } from "../../types/deal";
import AvuqoScore from "../score/AvuqoScore";

type Props = { deal: Deal };

function money(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DealCard({ deal }: Props) {
  return (
    <article className="deal-card">
      <div className="deal-image">
        <span className="deal-category">{deal.category}</span>
        <AvuqoScore score={deal.avuqoScore} rating={deal.rating} />
        <div className="product-placeholder">{deal.category === "Travel" ? "✈" : "Q"}</div>
      </div>

      <div className="deal-body">
        <h3>{deal.title}</h3>
        <div className="price-line">
          <strong>{money(deal.currentPrice)}</strong>
          <span>Typical {money(deal.typicalPrice)}</span>
        </div>
        <p className="saving">{money(deal.savingAmount)} below typical</p>
        <p className="reason">{deal.reason}</p>
        <div className="merchant">
          <span>{deal.merchant}</span>
          <span className="stock">{deal.stockStatus === "low_stock" ? "Limited" : "In stock"}</span>
        </div>
        <div className="deal-actions">
          <Link className="deal-button" href={`/deal/${deal.id}`}>View deal</Link>
          <Link className="watch-small" href={`/deal/${deal.id}`}>Watch</Link>
        </div>
      </div>
    </article>
  );
}
