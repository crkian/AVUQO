import LegalPage from "../../components/legal/LegalPage";
import Link from "next/link";
export const metadata = { title: "Cookie Information", description: "How AVUQO uses cookies and similar technologies." };
export default function CookiesPage() {
  return <LegalPage kicker="Cookies & tracking" title="Cookie information." intro="We want you to understand how cookies and similar technologies may be used on AVUQO. This information must be checked against the actual deployed services before launch.">
    <section><h2>Essential technologies</h2><p>Authentication and security features may use cookies or equivalent storage to maintain sessions and protect accounts.</p></section>
    <section><h2>Analytics and affiliate tracking</h2><p>AVUQO may use analytics or affiliate tracking when those integrations are enabled. Their specific purpose, retention, providers and consent requirements must be documented before use.</p></section>
    <section><h2>Your choices</h2><p>You can manage stored cookies using your browser settings. This page does not itself provide a consent control. Where non-essential cookies or similar tracking require consent, AVUQO must provide an appropriate consent choice before activating them.</p></section>
    <section><h2>More information</h2><p>See our <Link href="/privacy">Privacy notice</Link> and <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.</p></section>
  </LegalPage>;
}
