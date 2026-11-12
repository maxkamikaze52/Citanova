"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneField } from "../components/practice";

/** España primero (mercado de casa) y después el resto en un orden previsible. */
const TIMEZONES = [
  "Europe/Madrid",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Berlin",
  "Europe/Dublin",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Zurich",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Bogota",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Nairobi",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    practiceName: "",
    timezone: "Europe/Madrid",
    phone: "",
    address: "",
    website: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function set(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      setBusy(false);
      setError(data.error ?? "Ha fallado algo. Inténtalo otra vez.");
      return;
    }

    if (data.needsEmailConfirm) {
      setBusy(false);
      setNotice(data.message ?? "Mira tu correo para confirmar la cuenta.");
      return;
    }

    router.replace("/welcome");
    router.refresh();
  }

  return (
    <main id="main" style={{ maxWidth: 620, margin: "0 auto", padding: "56px 24px 88px" }}>
      <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, margin: 0 }}>PASO 1 DE 1</p>
      <h1 style={{ fontSize: 32, margin: "6px 0 8px" }}>Configura tu asistente</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 28 }}>
        Tres datos y una contraseña. Creamos el asistente, una agenda, una lista de precios y tu
        panel; después te damos una línea para pegar en tu web.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Field label="Nombre de la clínica" hint="Es lo que ven los pacientes en el chat.">
          <input
            required
            value={form.practiceName}
            onChange={set("practiceName")}
            placeholder="Clínica Dental Sol"
            style={input}
          />
        </Field>

        <div className="cols-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Zona horaria">
            <select value={form.timezone} onChange={set("timezone")} style={input}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Teléfono" hint="Opcional. De cualquier país.">
            <PhoneField
              value={form.phone}
              onChange={(next) => setForm((current) => ({ ...current, phone: next }))}
              timeZone={form.timezone}
            />
          </Field>
        </div>

        <Field label="Dirección" hint="Opcional">
          <input value={form.address} onChange={set("address")} style={input} />
        </Field>

        <Field
          label="Tu página web"
          hint="Donde vivirá el asistente. El chat solo acepta visitantes de esta dirección."
        >
          <input
            required
            value={form.website}
            onChange={set("website")}
            placeholder="https://clinicadentalsol.es"
            style={input}
          />
        </Field>

        <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "6px 0" }} />

        <Field label="Tu correo electrónico" hint="Con este entrarás en el panel.">
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="tu@clinica.es"
            style={input}
            autoComplete="email"
          />
        </Field>

        <Field label="Contraseña" hint="Al menos 8 caracteres.">
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={set("password")}
            style={input}
            autoComplete="new-password"
          />
        </Field>

        {error ? (
          <p role="alert" style={{ ...box, background: "var(--danger-bg)", borderColor: "var(--danger-line)", color: "var(--danger)" }}>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" style={{ ...box, background: "var(--success-bg)", borderColor: "var(--success-line)", color: "var(--success-ink)" }}>
            {notice}
          </p>
        ) : null}

        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Creando tu asistente…" : "Crear mi asistente"}
        </button>

        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, textAlign: "center" }}>
          ¿Ya lo tienes? <a href="/login" style={{ color: "var(--accent)" }}>Entra aquí</a>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 14, color: "var(--ink)" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 400 }}>{hint}</span> : null}
    </label>
  );
}

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontSize: 15,
  fontFamily: "inherit",
  background: "#fff",
  color: "var(--ink)",
};

const button: React.CSSProperties = {
  marginTop: 4,
  padding: "13px 18px",
  background: "var(--accent)",
  color: "#fff",
  border: 0,
  borderRadius: 6,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
};

const box: React.CSSProperties = {
  margin: 0,
  padding: "11px 14px",
  border: "1px solid",
  borderRadius: 6,
  fontSize: 14,
};
