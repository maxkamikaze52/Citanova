"use client";

import { useState } from "react";

const plans = [
  { id: "starter", name: "Starter", price: "49 €/mes", note: "Plan mensual. El consumo de mensajes lo ves en tu panel." },
  { id: "pro", name: "Pro", price: "149 €/mes", note: "Plan mensual. El consumo de mensajes lo ves en tu panel." },
];

export default function PricingPlans() {
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function subscribe(plan: string) {
    setBusyPlan(plan);
    setError("");
    try {
      const r = await fetch("/api/stripe/checkout", { method: "POST", body: JSON.stringify({ plan }) });
      if (r.status === 401) return (location.href = "/login");
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.url) {
        setError(typeof data?.error === "string" ? data.error : "No hemos podido abrir el pago. Inténtalo de nuevo en un rato.");
        setBusyPlan(null);
        return;
      }
      location.href = data.url;
    } catch {
      setError("No hay conexión con el servidor. Comprueba tu red e inténtalo otra vez.");
      setBusyPlan(null);
    }
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          style={{
            margin: "0 0 16px", padding: "11px 14px", border: "1px solid var(--danger-line)",
            borderRadius: 6, background: "var(--danger-bg)", color: "var(--danger)", fontSize: 14,
          }}
        >
          {error}
        </p>
      ) : null}
      <div className="plans">
        {plans.map((p) => (
          <div key={p.id} className="plan">
            <h2>{p.name}</h2>
            <p className="price">{p.price}</p>
            <p className="note">{p.note}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => subscribe(p.id)}
              disabled={busyPlan !== null}
              aria-busy={busyPlan === p.id}
            >
              {busyPlan === p.id ? "Abriendo el pago…" : "Suscribirme"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
