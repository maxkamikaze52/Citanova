import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import MobileCta from "./components/MobileCta";
import CookieConsent from "./components/CookieConsent";
import { SITE } from "../lib/site";

/**
 * Las dos voces tipográficas del sitio, autoalojadas por next/font:
 * Fraunces para los titulares (serif de contraste alto, con eje óptico) e
 * Inter Tight para la interfaz. Se sirven desde el propio dominio, así que no
 * hay petición a Google en tiempo de ejecución ni coste de privacidad.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  variable: "--font-inter-tight",
});

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
  themeColor: "#050a17",
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${interTight.variable}`}>
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
