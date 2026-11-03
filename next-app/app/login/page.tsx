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
      setError(data.error ?? "Could not sign in.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "72px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Practice sign in</h1>
      <p style={{ color: "#5b7573", marginTop: 0, marginBottom: 28 }}>
        See exactly what your assistant booked.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#0f2b2a" }}>
          <span style={{ fontWeight: 600 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={input}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#0f2b2a" }}>
          <span style={{ fontWeight: 600 }}>Password</span>
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
          <p role="alert" style={{ color: "#b42318", fontSize: 14, margin: 0 }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ fontSize: 13, color: "#5b7573", margin: "8px 0 0", textAlign: "center" }}>
          New here? <a href="/signup" style={{ color: "#0f766e" }}>Set up your assistant</a>
        </p>
      </form>
    </main>
  );
}

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 15,
  fontFamily: "inherit",
};

const button: React.CSSProperties = {
  marginTop: 6,
  padding: "11px 16px",
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 9,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
