import ManagedLegalPage from "../../components/legal/ManagedLegalPage";
import LegacyPage from "../../components/legal/legacy/cookies";
export const metadata = { title: "Cookies", description: "AVUQO cookie information" };
export default function Page() { return <ManagedLegalPage slug="cookies" fallback={<LegacyPage />} />; }
