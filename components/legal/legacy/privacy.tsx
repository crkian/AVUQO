import LegalPage, { styles } from "../LegalPage";
import { getContactEmail } from "../../../lib/site/url";

export const metadata = {
  title: "Privacy",
  description: "AVUQO privacy information.",
};

export default function PrivacyPage() {
  const contact = getContactEmail();

  return (
    <LegalPage
      kicker="Privacy"
      title="Privacy at AVUQO."
      intro="This page describes the data categories AVUQO is designed to process. It should be reviewed against the final production services and legal requirements before full commercial launch."
    >
      <section>
        <h2>Information you provide</h2>
        <p>
          This can include account details, Watches, Saved items, Shared Lists,
          preferences, feedback and URLs submitted to Reality Check.
        </p>
      </section>

      <section>
        <h2>Operational information</h2>
        <p>
          AVUQO may process security logs, device/browser information,
          interaction events and affiliate attribution information needed to
          operate, protect and improve the service.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          AVUQO uses infrastructure and data providers such as hosting,
          authentication/database services, merchant and affiliate networks.
          Their processing is subject to their respective agreements and
          privacy terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <div className={styles.contactCard}>
          Privacy enquiries: <strong>{contact}</strong>
        </div>
      </section>
    </LegalPage>
  );
}
