import LegalPage, { styles } from "../../components/legal/LegalPage";
import { getContactEmail } from "../../lib/site/url";

export const metadata = {
  title: "Contact",
  description: "Contact AVUQO.",
};

export default function ContactPage() {
  const contact = getContactEmail();
  const configured = contact !== "Contact email not configured";

  return (
    <LegalPage
      kicker="Contact"
      title="Talk to AVUQO."
      intro="Questions about the service, partnerships, data, privacy or affiliate relationships can be directed here."
    >
      <section>
        <div className={styles.contactCard}>
          {configured ? (
            <>
              Email:{" "}
              <a href={`mailto:${contact}`}>
                {contact}
              </a>
            </>
          ) : (
            <strong>
              Configure NEXT_PUBLIC_CONTACT_EMAIL before production launch.
            </strong>
          )}
        </div>
      </section>
    </LegalPage>
  );
}
