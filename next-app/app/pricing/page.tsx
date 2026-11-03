"use client";
const plans = [
  { id: "starter", name: "Starter", price: "€49/mo", note: "Monthly plan. Message usage is shown in your dashboard." },
  { id: "pro", name: "Pro", price: "€149/mo", note: "Monthly plan. Message usage is shown in your dashboard." },
];
export default function Pricing() {
  async function subscribe(plan: string) {
    const r = await fetch("/api/stripe/checkout", { method: "POST", body: JSON.stringify({ plan }) });
    if (r.status === 401) return (location.href = "/login");
    const data = await r.json().catch(() => null);
    if (!r.ok || !data?.url) {
      return alert(typeof data?.error === "string" ? data.error : "Could not start checkout. Please try again later.");
    }
    location.href = data.url;
  }
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", display: "flex", gap: 24 }}>
      {plans.map((p) => (
        <div key={p.id} style={{ flex: 1, border: "1px solid #cfdad8", borderRadius: 10, padding: 24 }}>
          <h2>{p.name}</h2><p style={{ fontSize: 28 }}>{p.price}</p><p>{p.note}</p>
          <button onClick={() => subscribe(p.id)}>Subscribe</button>
        </div>
      ))}
    </main>
  );
}
