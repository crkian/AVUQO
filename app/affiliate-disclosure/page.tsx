import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/affiliate-disclosure";
export const metadata = { title: "Affiliate-Disclosure", description: "AVUQO legal information" };
export default function Page() { return <ManagedLegalPage slug="affiliate-disclosure" fallback={<LegacyPage />} />; }
