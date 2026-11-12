"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "../../lib/site";
import RollText from "./RollText";

/** Cabecera de la portada: transparente sobre el hero, con desenfoque al hacer scroll (Skiper #57). */
export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="container lp-nav-inner">
        <Link href="/" className="lp-brand" aria-label={`${SITE.name}, inicio`}>
          <span className="lp-mark" aria-hidden="true" />
          {SITE.name}
        </Link>

        <nav className="lp-links" aria-label="Principal">
          <Link href="/pricing" className="lp-link">
            <span className="sr-only">Precios</span>
            <RollText text="Precios" />
          </Link>
          <Link href="/contact" className="lp-link hide-sm">
            <span className="sr-only">Contacto</span>
            <RollText text="Contacto" />
          </Link>
          <Link href="/login" className="lp-link">
            <span className="sr-only">Entrar</span>
            <RollText text="Entrar" />
          </Link>
          <Link href="/signup" className="lp-nav-cta">Configurar asistente</Link>
        </nav>
      </div>
    </header>
  );
}
