import { Suspense } from "react";
import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/affiliate-disclosure";

export const metadata = {
  title: "Affiliate Disclosure",
  description: "AVUQO affiliate disclosure information",
};

export default function Page() {
  return (
    <Suspense fallback={<main aria-busy="true" aria-label="Loading legal information"><p style={{ padding: "2rem" }}>Loading affiliate disclosure…</p></main>}>
      <ManagedLegalPage slug="affiliate-disclosure" fallback={<LegacyPage />} />
    </Suspense>
  );
}
