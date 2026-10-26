import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/terms";
export const metadata = { title: "Terms", description: "AVUQO legal information" };
export default function Page() { return <ManagedLegalPage slug="terms" fallback={<LegacyPage />} />; }
