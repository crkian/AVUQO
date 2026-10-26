import { Suspense } from "react";
import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/cookies";

export const metadata = {
  title: "Cookie Information",
  description: "AVUQO cookie information information",
};

export default function Page() {
  return (
    <Suspense fallback={<main aria-busy="true" aria-label="Loading legal information"><p style={{ padding: "2rem" }}>Loading cookie information…</p></main>}>
      <ManagedLegalPage slug="cookies" fallback={<LegacyPage />} />
    </Suspense>
  );
}
