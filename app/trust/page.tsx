import LegalPage, { styles } from "../../components/legal/LegalPage";

export const metadata = {
  title: "Trust",
  description:
    "How AVUQO separates value scoring, affiliate economics and promotional activity.",
};

export default function TrustPage() {
  return (
    <LegalPage
      kicker="AVUQO Trust"
      title="Value first. Commercial relationships second."
      intro="Trust is part of the product architecture, not a paragraph added after launch."
    >
      <section>
        <h2>The trust firewall</h2>
        <div className={styles.callout}>
          AVUQO Score assesses customer value. Promotion Score assesses
          promotional suitability. Affiliate commission is campaign economics.
          These are deliberately separate systems.
        </div>
      </section>

      <section>
        <h2>Evidence over claims</h2>
        <p>
          AVUQO is designed to retain evidence behind prices, availability,
          product matching, source freshness and scoring components. We do not
          intend to invent reviews, discounts, scarcity or specifications.
        </p>
      </section>

      <section>
        <h2>Human override</h2>
        <p>
          Automation can surface opportunities and perform routine processing,
          while the private AVUQO Control Centre provides owner visibility,
          exception handling, publishing limits and emergency controls.
        </p>
      </section>
    </LegalPage>
  );
}
