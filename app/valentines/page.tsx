import type { Metadata } from "next";
import SeasonalLanding from "../../components/editorial/SeasonalLanding";

export const metadata: Metadata = {
  title: "Valentine's gift ideas & experiences | AVUQO",
  description: "Discover thoughtful gifts and experiences for Valentine's Day with AVUQO. Inspiration and guidance without invented prices or urgency.",
  alternates: { canonical: "/valentines" },
};

export default function ValentinesPage() {
  return <SeasonalLanding kind="valentines"/>;
}
