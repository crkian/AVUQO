import { Suspense } from "react";
import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/terms";

export const metadata = {
  title: "Terms",
  description: "AVUQO terms information",
};

export default function Page() {
  return (
    <Suspense fallback={<main aria-busy="true" aria-label="Loading legal information"><p style={{ padding: "2rem" }}>Loading terms…</p></main>}>
      <ManagedLegalPage slug="terms" fallback={<LegacyPage />} />
    </Suspense>
  );
}
