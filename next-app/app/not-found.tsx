import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "./components/SiteHeader";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="narrow" style={{ padding: "80px 24px 0" }}>
        <p className="eyebrow">Error 404</p>
        <h1 className="serif" style={{ fontSize: "clamp(30px,4.5vw,42px)", margin: "0 0 12px" }}>
          Esta página no existe.
        </h1>
        <p style={{ color: "var(--muted)", margin: "0 0 28px" }}>
          Puede que el enlace esté mal o que la página se haya movido.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Volver al inicio</Link>
          <Link href="/contact" className="btn btn-secondary">Escríbenos</Link>
        </div>
      </main>
    </>
  );
}
