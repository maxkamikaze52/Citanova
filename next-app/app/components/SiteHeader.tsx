import Link from "next/link";
import { SITE } from "../../lib/site";

/** Cabecera de las páginas públicas (precios, aviso legal, contacto). El panel tiene la suya. */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" aria-label={`${SITE.name}, inicio`}>
          {SITE.name}
        </Link>
        <nav className="site-nav" aria-label="Principal">
          <Link href="/pricing">Precios</Link>
          <Link href="/contact" className="hide-sm">Contacto</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/signup" className="btn btn-primary hide-sm">Configurar asistente</Link>
        </nav>
      </div>
    </header>
  );
}
