import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/app/globals.css";
import "@/styles/globals.css";
import "@/styles/typography.css";
import "@/styles/animations.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { weddingConfig } from "@/lib/config";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

// Dynamic metadata — base title template so each page gets "Page — Surihana Vows"
// The root title is used as the fallback when a page doesn't export its own.
export const metadata: Metadata = {
  title: {
    default: "Surihana Vows",
    template: "%s"
  },
  description: `A cinematic wedding experience for ${weddingConfig.brideName} and ${weddingConfig.groomName}.`
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#FFFFFF", color: "#1A1012" }}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
