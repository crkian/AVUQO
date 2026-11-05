/**
 * Conservative, annual UK homepage editorial calendar.
 *
 * A seasonal route existing is NOT approval to promote it.
 * Only Christmas is activated here. Other events remain ordinary
 * editorial destinations until an explicit, separately reviewed
 * calendar entry is enabled.
 *
 * This is display scheduling, not an offer feed, email scheduler,
 * publication approval or campaign automation service.
 */
export type HomeSeasonStage = "early" | "planning" | "near";
export type HomeSeasonalMoment = {
  id: "christmas";
  stage: HomeSeasonStage;
  eyebrow: string;
  headline: string;
  summary: string;
  cardTitle: string;
  cardSummary: string;
  actionLabel: string;
  href: "/christmas";
};

function ukMonthAndDay(now: Date): { month: number; day: number } | null {
  if (!Number.isFinite(now.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const month = Number(parts.find(part => part.type === "month")?.value);
  const day = Number(parts.find(part => part.type === "day")?.value);
  if (!month || !day) return null;
  return { month, day };
}

/** Return approved seasonal homepage content, or null for the evergreen home. */
export function activeHomeSeasonalMoment(now: Date = new Date()): HomeSeasonalMoment | null {
  const uk = ukMonthAndDay(now);
  if (!uk) return null;
  const dayCode = uk.month * 100 + uk.day;

  // Christmas build-up begins gently on 15 October and ends after Boxing Day.
  // No seasonal promotions are shown outside this window.
  if (dayCode < 1015 || dayCode > 1226) return null;

  if (dayCode < 1115) return {
    id: "christmas",
    stage: "early",
    eyebrow: "A little Christmas inspiration",
    headline: "Christmas at AVUQO.",
    summary: "Thoughtful gift ideas, cosy home inspiration and a gentler way to plan the season. Start early, explore at your own pace and find what’s worth it.",
    cardTitle: "The joy of getting organised early.",
    cardSummary: "Gather ideas, start a gift list and explore helpful Christmas guides without the rush.",
    actionLabel: "Explore Christmas",
    href: "/christmas",
  };
  if (dayCode < 1215) return {
    id: "christmas",
    stage: "planning",
    eyebrow: "Christmas is on its way",
    headline: "Christmas at AVUQO.",
    summary: "Thoughtful gifts, festive home ideas and practical shopping tools, all together for a calmer Christmas build-up.",
    cardTitle: "Make the season feel special.",
    cardSummary: "Browse gifts, organise lists and plan festive essentials, checking the real cost before you buy.",
    actionLabel: "Plan Christmas with AVUQO",
    href: "/christmas",
  };
  return {
    id: "christmas",
    stage: "near",
    eyebrow: "The festive season is here",
    headline: "Christmas at AVUQO.",
    summary: "Make room for the little moments that matter. Discover last-minute inspiration and planning ideas, and check availability and delivery directly with retailers.",
    cardTitle: "Make room for the moments that matter.",
    cardSummary: "Keep your lists close and check the details before making any last-minute purchase.",
    actionLabel: "Find Christmas inspiration",
    href: "/christmas",
  };
}
