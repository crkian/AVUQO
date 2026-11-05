import type { Metadata } from "next";
import SeasonalLanding from "../../components/editorial/SeasonalLanding";

export const metadata: Metadata = {
  title: "Easter & spring inspiration | AVUQO",
  description: "Explore considered Easter gifts, spring home ideas, crafts and planning on AVUQO. Seasonal guidance, not unverified sale claims.",
  alternates: { canonical: "/easter" },
};

export default function EasterPage() {
  return <SeasonalLanding kind="easter"/>;
}
