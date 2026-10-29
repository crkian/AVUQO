import type { Metadata, Viewport } from "next";

import "./globals.css";
import "./phase2.css";

import { getSiteUrl } from "../lib/site/url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AVUQO | Find what's worth it.",
    template: "%s | AVUQO",
  },
  description:
    "Independent value intelligence for shopping, travel, motoring and experiences. AVUQO helps people decide what is genuinely worth it.",
  applicationName: "AVUQO",
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
      <body>{children}</body>
    </html>
  );
}
