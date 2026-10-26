"use client";
import Link from "next/link";
import { getContactEmail } from "../../lib/site/url";
import { useEffect, useState } from "react";
import { DEFAULT_FOOTER, parseFooter, type FooterContent } from "../../lib/content/footer";

export default function Footer() {
  const [content, setContent] = useState<FooterContent>(DEFAULT_FOOTER);
  const [copyrightYear, setCopyrightYear] = useState(2026);
  useEffect(() => {
    const controller = new AbortController();
    setCopyrightYear(new Date().getFullYear());
    async function load() {
      try {
        const response = await fetch("/api/site/footer", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        setContent(parseFooter(await response.json()));
      } catch {
        // Continue showing trusted defaults if public content is unavailable.
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  const contact = getContactEmail();
  const hasContact = contact !== "Contact email not configured";
  return (
    <footer className="avuqo-footer">
      <div className="shell">
        <div className="avuqo-footer__main">
          <div className="avuqo-footer__brand">
            <Link className="logo" href="/" aria-label="AVUQO homepage"><span className="q-mark">Q</span> AVUQO</Link>
            <p className="avuqo-footer__motto">{content.motto}</p>
            <p>{content.description}</p>
            {hasContact && <a className="avuqo-footer__email" href={`mailto:${contact}`}>{contact}</a>}
          </div>
          {content.groups.map(group => (
            <nav className="avuqo-footer__group" aria-label={group.heading} key={group.heading}>
              <h2>{group.heading}</h2>
              <ul>{group.links.map(link => <li key={`${link.href}:${link.label}`}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="avuqo-footer__disclosure"><strong>Our promise:</strong> {content.disclosure} <Link href="/affiliate-disclosure">How affiliate links work</Link>.</div>
        <div className="avuqo-footer__bottom"><span>© {copyrightYear} AVUQO. All rights reserved.</span><span>UK-focused value discovery · Prices and availability can change. Check merchant details before buying.</span></div>
      </div>
    </footer>
  );
}
