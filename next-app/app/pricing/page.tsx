import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import PricingPlans from "./PricingPlans";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes mensuales sencillos para la recepcionista con IA: Starter por 49 € al mes y Pro por 149 € al mes. El consumo de mensajes se ve en tu panel.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container" style={{ padding: "56px 24px 0" }}>
        <p className="eyebrow">Precios</p>
        <h1 className="serif" style={{ fontSize: "clamp(30px,4.5vw,42px)", margin: "0 0 28px" }}>
          Dos planes. Mensuales, sin coste de alta.
        </h1>
        <PricingPlans />
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 20 }}>
          Precios en euros al mes, IVA incluido. El cobro lo gestiona Stripe.
        </p>
      </main>
    </>
  );
}
