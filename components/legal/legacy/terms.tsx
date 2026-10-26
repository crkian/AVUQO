import LegalPage from "../LegalPage";

export const metadata = {
  title: "Terms",
  description: "AVUQO website and service terms.",
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms"
      title="Using AVUQO."
      intro="These are launch-stage service terms and should be reviewed for your final company details, jurisdiction and commercial arrangements before a full public launch."
    >
      <section>
        <h2>Decision support, not a guarantee</h2>
        <p>
          AVUQO provides comparison, scoring and informational guidance.
          Prices, availability and third-party terms can change. Users should
          confirm the final price and merchant terms before purchasing or
          booking.
        </p>
      </section>

      <section>
        <h2>Third-party merchants</h2>
        <p>
          Transactions completed with external merchants are governed by the
          merchant's terms. AVUQO is not the seller, travel provider or
          fulfilment provider unless explicitly stated otherwise.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Users must not attempt to abuse AVUQO, bypass access controls,
          interfere with automated systems, scrape protected areas or use the
          service unlawfully.
        </p>
      </section>
    </LegalPage>
  );
}
