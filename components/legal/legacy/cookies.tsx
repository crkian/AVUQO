import LegalPage from "../LegalPage";
import Link from "next/link";
import {CookieSettingsButton} from "../../privacy/CookieConsent";
export const metadata = { title: "Cookie Information", description: "How AVUQO uses cookies and similar technologies." };
export default function CookiesPage() {
  return <LegalPage kicker="Cookies & tracking" title="Cookie information." intro="We want you to understand how cookies and similar technologies may be used on AVUQO. This information must be checked against the actual deployed services before launch.">
    <section><h2>Essential technologies</h2><p>Authentication and security features may use cookies or equivalent storage to maintain sessions and protect accounts.</p></section>
    <section><h2>Analytics and affiliate tracking</h2><p>AVUQO does not currently enable optional analytics or marketing scripts in its site code. Any future optional trackers must be documented and reviewed before they are switched on. Other storage, including browser list data and third-party embedded assets, still needs a full live inventory.</p></section>
    <section><h2>Your choices</h2><p>You can review and change optional cookie preferences below. This control does not disable strictly necessary account and security cookies. An up-to-date inventory of all browser storage technologies is still required.</p><CookieSettingsButton /></section>
    <section><h2>More information</h2><p>See our <Link href="/privacy">Privacy notice</Link> and <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.</p></section>
  </LegalPage>;
}
