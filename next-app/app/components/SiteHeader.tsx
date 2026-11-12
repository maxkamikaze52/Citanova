import Link from "next/link";
import { SITE } from "../../lib/site";

/**
 * Cabecera de las páginas públicas (precios, contacto, legales, entrar).
 *
 * Lleva un botón de Inicio explícito: mucha gente no sabe que el logotipo
 * vuelve al principio, así que hay una casa con la palabra al lado.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" aria-label={`${SITE.name}, inicio`}>
          {SITE.name}
        </Link>
        <nav className="site-nav" aria-label="Principal">
          <Link href="/" className="nav-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-8.5Z" />
            </svg>
            Inicio
          </Link>
          <Link href="/pricing">Precios</Link>
          <Link href="/contact" className="hide-sm">Contacto</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/signup" className="btn btn-primary hide-sm">Configurar asistente</Link>
        </nav>
      </div>
    </header>
  );
}
