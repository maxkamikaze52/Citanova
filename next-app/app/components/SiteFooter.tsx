import Link from "next/link";
import { CookieSettingsLink } from "./CookieConsent";
import { CONTACT, LEGAL, SITE } from "../../lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <strong style={{ color: "var(--ink)", fontSize: 16 }}>{SITE.name}</strong>
            <p style={{ margin: "6px 0 14px" }}>{SITE.tagline}</p>
            <p style={{ margin: 0 }}>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
          </div>
          <nav aria-label="Producto">
            <h2>Producto</h2>
            <ul>
              <li><Link href="/pricing">Precios</Link></li>
              <li><Link href="/signup">Configurar un asistente</Link></li>
              <li><Link href="/login">Entrar en mi clínica</Link></li>
              <li><Link href="/contact">Contacto</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h2>Legal</h2>
            <ul>
              <li><Link href="/privacy">Política de privacidad</Link></li>
              <li><Link href="/terms">Términos y condiciones</Link></li>
              <li><Link href="/cookies">Política de cookies</Link></li>
              <li><Link href="/legal-notice">Aviso legal</Link></li>
              <li><CookieSettingsLink /></li>
            </ul>
          </nav>
        </div>
        <p className="legal-line">
          © {new Date().getFullYear()} {LEGAL.companyName} · {LEGAL.taxId} · {LEGAL.address}
        </p>
      </div>
    </footer>
  );
}
