import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = { title: "Gracias", robots: { index: false, follow: false } };

/** Pon aquí el success_url del checkout de Stripe: <SITE_URL>/thank-you */
export default function ThankYou() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="narrow" style={{ padding: "80px 24px 0" }}>
        <p className="eyebrow">Suscripción confirmada</p>
        <h1 className="serif" style={{ fontSize: "clamp(30px,4.5vw,42px)", margin: "0 0 12px" }}>Gracias.</h1>
        <p style={{ color: "var(--muted)", margin: "0 0 28px", maxWidth: "56ch" }}>
          El pago se ha realizado correctamente. Recibirás el recibo por correo. El plan puede tardar
          unos minutos en aparecer en el panel.
        </p>
        <Link href="/dashboard" className="btn btn-primary">Ir a mi panel</Link>
      </main>
    </>
  );
}
