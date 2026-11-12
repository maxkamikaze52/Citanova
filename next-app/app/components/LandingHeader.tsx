"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "../../lib/site";

/**
 * Cabecera fina, al estilo de la barra de Apple: casi invisible sobre el hero
 * y con desenfoque en cuanto hay scroll.
 */
export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`ap-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="container ap-nav-inner">
        <Link href="/" className="ap-brand" aria-label={`${SITE.name}, inicio`}>
          <span className="ap-mark" aria-hidden="true" />
          Citadent
        </Link>

        <nav className="ap-links" aria-label="Principal">
          <Link href="/pricing" className="ap-link">Precios</Link>
          <Link href="/contact" className="ap-link hide-sm">Contacto</Link>
          <Link href="/login" className="ap-link">Entrar</Link>
          <Link href="/signup" className="ap-nav-cta">Configurar</Link>
        </nav>
      </div>
    </header>
  );
}
