import Link from "next/link";
import { getContactEmail } from "../../lib/site/url";

const linkGroups = [
  { heading: "Explore", links: [["Discover", "/discover"], ["Live offers", "/live"], ["AVUQO Score", "/score"], ["Reality Check", "/reality-check"]] },
  { heading: "About AVUQO", links: [["Our story", "/about"], ["How we build trust", "/trust"], ["Contact", "/contact"]] },
  { heading: "Legal & transparency", links: [["Privacy notice", "/privacy"], ["Terms of use", "/terms"], ["Cookie information", "/cookies"], ["Affiliate disclosure", "/affiliate-disclosure"]] },
] as const;

export default function Footer() {
  const contact = getContactEmail();
  const hasContact = contact !== "Contact email not configured";
  return (
    <footer className="avuqo-footer">
      <div className="shell">
        <div className="avuqo-footer__main">
          <div className="avuqo-footer__brand">
            <Link className="logo" href="/" aria-label="AVUQO homepage"><span className="q-mark">Q</span> AVUQO</Link>
            <p className="avuqo-footer__motto">Find what’s worth it.</p>
            <p>Clearer comparisons, better buying decisions and honest information about how we make money.</p>
            {hasContact && <a className="avuqo-footer__email" href={`mailto:${contact}`}>{contact}</a>}
          </div>
          {linkGroups.map(group => (
            <nav className="avuqo-footer__group" aria-label={group.heading} key={group.heading}>
              <h2>{group.heading}</h2>
              <ul>{group.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="avuqo-footer__disclosure"><strong>Our promise:</strong> Affiliate links may earn AVUQO a commission. They do not determine AVUQO Score or organic rankings. <Link href="/affiliate-disclosure">How affiliate links work</Link>.</div>
        <div className="avuqo-footer__bottom"><span>© {new Date().getFullYear()} AVUQO. All rights reserved.</span><span>UK-focused value discovery · Prices and availability can change. Check merchant details before buying.</span></div>
      </div>
    </footer>
  );
}
