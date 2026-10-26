import LegalPage, { styles } from "../../components/legal/LegalPage";

export const metadata = {
  title: "About",
  description:
    "AVUQO is independent value intelligence built to help buyers decide what is genuinely worth it.",
};

export default function AboutPage() {
  return (
    <LegalPage
      kicker="About AVUQO"
      title="Independent intelligence for better buying decisions."
      intro="AVUQO is being built to answer a deceptively simple question: is this actually worth it?"
    >
      <section>
        <h2>What AVUQO does</h2>
        <p>
          AVUQO compares price, history, competing offers, merchant quality,
          inclusions and evidence confidence to help people understand genuine
          value across shopping, travel, motoring and experiences.
        </p>
      </section>

      <section>
        <h2>Our operating principle</h2>
        <div className={styles.callout}>
          <strong>We rank value, not commission.</strong>
        </div>
        <p>
          Affiliate relationships can help fund AVUQO, but commission is kept
          downstream of the underlying value assessment. It does not determine
          organic AVUQO Score or the best-value recommendation.
        </p>
      </section>

      <section>
        <h2>What AVUQO is not</h2>
        <p>
          AVUQO is not designed to manufacture urgency, invent discounts or
          reward merchants for appearing to offer better value than the
          evidence supports.
        </p>
      </section>
    </LegalPage>
  );
}
