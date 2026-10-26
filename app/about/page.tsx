import { Suspense } from "react";
import { publishedEditorial } from "../../lib/content/editorial";
import type { Metadata } from "next";
import LegalPage, { styles } from "../../components/legal/LegalPage";


async function AboutPageContent() {
  const editorial=await publishedEditorial("about");
  return (
    <LegalPage
      kicker={editorial.eyebrow}
      title={editorial.headline}
      intro={editorial.description}
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

export const metadata: Metadata = {
  title: "About AVUQO",
  description: "Learn about AVUQO independent value intelligence.",
};

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="shell" role="status">Loading About AVUQO…</div>}>
      <AboutPageContent />
    </Suspense>
  );
}
