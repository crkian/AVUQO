import type { Metadata } from "next";
import "./globals.css";
import "./phase2.css";

export const metadata: Metadata = {
  title: "AVUQO | Find what's worth it.",
  description: "AVUQO finds genuine value across shopping, travel, motoring, experiences and more.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
