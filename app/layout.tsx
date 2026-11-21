import type { Metadata, Viewport } from "next";

import "./globals.css";
import "./phase2.css";
import CookieConsent from "../components/privacy/CookieConsent";

import { getPublicCanonicalUrl } from "../lib/site/url";
import {jsonLd} from "../lib/site/seo";

const siteUrl = getPublicCanonicalUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AVUQO | Find what's worth it.",
    template: "%s | AVUQO",
  },
  description:
    "Independent value intelligence for shopping, travel, motoring and experiences. AVUQO helps people decide what is genuinely worth it.",
  applicationName: "AVUQO",
  category:"shopping",
  referrer:"strict-origin-when-cross-origin",
  openGraph: {
    type: "website",
    siteName: "AVUQO",
    title: "AVUQO | Find what's worth it.",
    description:
      "Independent value intelligence for shopping, travel, motoring and experiences.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVUQO | Find what's worth it.",
    description:
      "Independent value intelligence for shopping, travel, motoring and experiences.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1},
  },
};

export const viewport: Viewport = {
  themeColor: "#17142b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({
          "@context":"https://schema.org","@type":"WebSite",name:"AVUQO",url:siteUrl,
          inLanguage:"en-GB",description:"Independent shopping and value research in the UK"
        })}}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({
          "@context":"https://schema.org","@type":"Organization",name:"AVUQO",url:siteUrl
        })}}/>
        {children}<CookieConsent/>
      </body>
    </html>
  );
}
