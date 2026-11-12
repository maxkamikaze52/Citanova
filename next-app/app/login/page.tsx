"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <main id="main" className="auth">
      <div className="auth-card">
        <Link href="/" className="auth-back">← Volver a la web</Link>
        <p className="auth-brand">Citanova</p>
        <h1>Entra en tu negocio</h1>
        <p className="auth-sub">
          Mira cuánto ha trabajado el asistente por ti: mensajes, citas y horas que te has ahorrado.
        </p>

        <form onSubmit={submit}>
          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@clinica.es"
            />
          </label>

          <label className="auth-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="auth-error" role="alert">{error}</p> : null}

          <button type="submit" className="auth-btn" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="auth-alt">
          ¿Primera vez? <Link href="/signup">Configura tu asistente</Link>
        </p>
        <p className="auth-exit">
          <Link href="/pricing">Ver precios</Link>
          <span aria-hidden="true">·</span>
          <Link href="/contact">Hablar con nosotros</Link>
          <span aria-hidden="true">·</span>
          <Link href="/">Ir a la web</Link>
        </p>
      </div>

      <ul className="auth-points">
        <li>Mensajes y conversaciones de tu web, en un sitio</li>
        <li>Las horas punta: cuándo te escriben de verdad</li>
        <li>Horas de trabajo que te has ahorrado, calculadas</li>
      </ul>
    </main>
  );
}
