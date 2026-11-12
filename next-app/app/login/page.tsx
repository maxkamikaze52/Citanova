"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "No hemos podido entrar. Revisa el correo y la contraseña.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main id="main" style={{ maxWidth: 420, margin: "0 auto", padding: "72px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Entrar en mi clínica</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 28 }}>
        Mira exactamente qué ha reservado tu asistente.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 14, color: "var(--ink)" }}>
          <span style={{ fontWeight: 600 }}>Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={input}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14, color: "var(--ink)" }}>
          <span style={{ fontWeight: 600 }}>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={input}
          />
        </label>

        {error ? (
          <p role="alert" style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Entrando…" : "Entrar"}
        </button>

        <p style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0 0", textAlign: "center" }}>
          ¿Primera vez? <a href="/signup" style={{ color: "var(--accent)" }}>Configura tu asistente</a>
        </p>
      </form>
    </main>
  );
}

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontSize: 15,
  fontFamily: "inherit",
};

const button: React.CSSProperties = {
  marginTop: 6,
  padding: "11px 16px",
  background: "var(--accent)",
  color: "#fff",
  border: 0,
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
