import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/app/globals.css";
import "@/styles/globals.css";
import "@/styles/typography.css";
import "@/styles/animations.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { weddingConfig } from "@/lib/config";

// Cormorant Garamond — luxury editorial serif for headings
const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Manrope — refined geometric sans for body (replaces Manrope default weight range)
const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Surihana Vows",
    template: "%s",
  },
  description: `A cinematic wedding experience for ${weddingConfig.brideName} and ${weddingConfig.groomName}.`,
  themeColor: "#FDFAF7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: "#FDFAF7",
          color: "#120B0E",
          // Smooth font rendering
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
