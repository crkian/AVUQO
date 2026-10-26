import LegalPage, { styles } from "../../components/legal/LegalPage";

export const metadata = {
  title: "Affiliate Disclosure",
  description: "How affiliate links and commercial relationships work on AVUQO.",
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage
      kicker="Commercial transparency"
      title="Affiliate disclosure."
      intro="Some links on AVUQO may be affiliate links. If you follow one and complete a qualifying purchase or booking, AVUQO may receive a commission."
    >
      <section>
        <h2>What this means for you</h2>
        <p>
          You should not normally pay more because AVUQO receives a referral
          commission. The merchant or affiliate programme is responsible for
          the commercial tracking and commission terms.
        </p>
      </section>

      <section>
        <h2>What commission does not do</h2>
        <div className={styles.callout}>
          <strong>
            Affiliate commission does not determine AVUQO Score or organic
            best-value ranking.
          </strong>
        </div>
        <p>
          A merchant may be eligible for affiliate revenue and still rank below
          a better-value alternative. Sponsored placements, where supported,
          must be clearly labelled and separated from organic scoring.
        </p>
      </section>

      <section>
        <h2>Merchant relationship</h2>
        <p>
          When AVUQO refers you to a third-party merchant, the merchant remains
          responsible for the transaction, payment, fulfilment, cancellation,
          return and customer-service terms unless AVUQO explicitly states
          otherwise.
        </p>
      </section>
    </LegalPage>
  );
}
