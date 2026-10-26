import { Suspense } from "react";
import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/privacy";

export const metadata = {
  title: "Privacy",
  description: "AVUQO privacy information",
};

export default function Page() {
  return (
    <Suspense fallback={<main aria-busy="true" aria-label="Loading legal information"><p style={{ padding: "2rem" }}>Loading privacy…</p></main>}>
      <ManagedLegalPage slug="privacy" fallback={<LegacyPage />} />
    </Suspense>
  );
}
