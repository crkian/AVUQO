import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/privacy";
export const metadata = { title: "Privacy", description: "AVUQO legal information" };
export default function Page() { return <ManagedLegalPage slug="privacy" fallback={<LegacyPage />} />; }
