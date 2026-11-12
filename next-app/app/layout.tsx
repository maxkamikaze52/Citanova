import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import MobileCta from "./components/MobileCta";
import CookieConsent from "./components/CookieConsent";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: `${SITE.name} – ${SITE.tagline}`, description: SITE.description },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0f0e",
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#main">Saltar al contenido</a>
        {children}
        <SiteFooter />
        <MobileCta />
        <CookieConsent />
      </body>
    </html>
  );
}
