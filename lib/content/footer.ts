export type FooterContent = {
  motto: string;
  description: string;
  disclosure: string;
  groups: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
};

export const DEFAULT_FOOTER: FooterContent = {
  motto: "Find what's worth it.",
  description: "Clearer comparisons, better buying decisions and honest information about how we make money.",
  disclosure: "Affiliate links may earn AVUQO a commission. They do not determine AVUQO Score or organic rankings.",
  groups: [
    { heading: "Explore", links: [{ label: "Discover", href: "/discover" }, { label: "Live offers", href: "/live" }, { label: "AVUQO Score", href: "/score" }, { label: "Reality Check", href: "/reality-check" }] },
    { heading: "About AVUQO", links: [{ label: "Our story", href: "/about" }, { label: "How we build trust", href: "/trust" }, { label: "Contact", href: "/contact" }] },
    { heading: "Legal & transparency", links: [{ label: "Privacy notice", href: "/privacy" }, { label: "Terms of use", href: "/terms" }, { label: "Cookie information", href: "/cookies" }, { label: "Affiliate disclosure", href: "/affiliate-disclosure" }] },
  ],
};

export function parseFooter(raw: unknown): FooterContent {
  if (!raw || typeof raw !== "object") return DEFAULT_FOOTER;
  const item = raw as Partial<FooterContent>;
  if (typeof item.motto !== "string" || item.motto.length > 150 ||
      typeof item.description !== "string" || item.description.length > 600 ||
      typeof item.disclosure !== "string" || item.disclosure.length > 600 ||
      !Array.isArray(item.groups) || item.groups.length > 5 ||
      !item.groups.every(g => g && typeof g.heading === "string" && g.heading.length <= 80 &&
        Array.isArray(g.links) && g.links.length <= 12 && g.links.every(l =>
          l && typeof l.label === "string" && l.label.length <= 80 && typeof l.href === "string" &&
          /^\/[a-z0-9/\-]*$/.test(l.href)))) return DEFAULT_FOOTER;
  return item as FooterContent;
}

