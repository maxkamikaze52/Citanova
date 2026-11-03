"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    practiceName: "",
    timezone: "Europe/London",
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
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    if (data.needsEmailConfirm) {
      setBusy(false);
      setNotice(data.message ?? "Check your inbox to confirm the account.");
      return;
    }

    router.replace("/welcome");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "56px 24px 88px" }}>
      <p style={{ fontSize: 13, color: "#0f766e", fontWeight: 600, margin: 0 }}>STEP 1 OF 1</p>
      <h1 style={{ fontSize: 32, margin: "6px 0 8px" }}>Set up your assistant</h1>
      <p style={{ color: "#4b5f5c", marginTop: 0, marginBottom: 28 }}>
        Three fields and a password. We create the assistant, a diary, a price list and your
        dashboard — then give you one line to paste into your website.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Field label="Practice name" hint="Shown to patients in the chat.">
          <input
            required
            value={form.practiceName}
            onChange={set("practiceName")}
            placeholder="Bright Smile Dental"
            style={input}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Timezone">
            <select value={form.timezone} onChange={set("timezone")} style={input}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone" hint="Optional">
            <input value={form.phone} onChange={set("phone")} placeholder="+44 20 …" style={input} />
          </Field>
        </div>

        <Field label="Address" hint="Optional">
          <input value={form.address} onChange={set("address")} style={input} />
        </Field>

        <Field
          label="Your website"
          hint="Where the assistant will live. The chat only accepts visitors from this address."
        >
          <input
            required
            value={form.website}
            onChange={set("website")}
            placeholder="https://brightsmile.co.uk"
            style={input}
          />
        </Field>

        <hr style={{ border: 0, borderTop: "1px solid #dbe8e5", margin: "6px 0" }} />

        <Field label="Your email" hint="This is how you sign in to the dashboard.">
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@practice.com"
            style={input}
            autoComplete="email"
          />
        </Field>

        <Field label="Password" hint="At least 8 characters.">
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
          <p role="alert" style={{ ...box, background: "#fdeceb", borderColor: "#fda29b", color: "#b42318" }}>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" style={{ ...box, background: "#e6f6f2", borderColor: "#a6e3d6", color: "#0b5a54" }}>
            {notice}
          </p>
        ) : null}

        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Creating your assistant…" : "Create my assistant"}
        </button>

        <p style={{ fontSize: 13, color: "#5b7573", margin: 0, textAlign: "center" }}>
          Already set up? <a href="/login" style={{ color: "#0f766e" }}>Sign in</a>
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
    <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#0f2b2a" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 12.5, color: "#5b7573", fontWeight: 400 }}>{hint}</span> : null}
    </label>
  );
}

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 15,
  fontFamily: "inherit",
  background: "#fff",
  color: "#0f2b2a",
};

const button: React.CSSProperties = {
  marginTop: 4,
  padding: "13px 18px",
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
};

const box: React.CSSProperties = {
  margin: 0,
  padding: "11px 14px",
  border: "1px solid",
  borderRadius: 9,
  fontSize: 14,
};
