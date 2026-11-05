"use client";

import { useState } from "react";
import PhoneField from "./PhoneField";

type Details = {
  name: string;
  phone: string;
  email: string;
  address: string;
  tagline: string;
  greeting: string;
  assistantName: string;
  transferPhone: string;
};

/**
 * Practice details and assistant voice.
 *
 * Uses the backend's own settings schema (PATCH /api/settings), so validation
 * messages come from one place rather than a second copy here.
 */
export default function PracticeDetails({
  initial,
  timeZone,
}: {
  initial: Details;
  timeZone?: string | null;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function field(key: keyof Details) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        contact: {
          phone: form.phone,
          email: form.email,
          address: form.address,
          tagline: form.tagline,
          greeting: form.greeting,
        },
        assistant: { name: form.assistantName },
        transferPhone: form.transferPhone,
      }),
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setBusy(false);

    if (!response || !response.ok) {
      const detail =
        data?.error?.issues?.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join("; ") ??
        data?.error?.message ??
        data?.error ??
        "Could not save.";
      setMessage({ kind: "error", text: String(detail) });
      return;
    }

    setMessage({ kind: "ok", text: "Saved. The assistant uses this from the next message." });
  }

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Practice name">
          <input value={form.name} onChange={field("name")} style={input} required />
        </Field>
        <Field label="Phone patients should call">
          <PhoneField
            value={form.phone}
            onChange={(next) => setForm((current) => ({ ...current, phone: next }))}
            timeZone={timeZone}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Email">
          <input value={form.email} onChange={field("email")} style={input} />
        </Field>
        <Field label="Address">
          <input value={form.address} onChange={field("address")} style={input} />
        </Field>
      </div>

      <Field label="Tagline" hint="One line shown in the chat header.">
        <input value={form.tagline} onChange={field("tagline")} style={input} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Assistant name" hint="Leave empty for “the virtual receptionist”.">
          <input value={form.assistantName} onChange={field("assistantName")} style={input} placeholder="Ava" />
        </Field>
        <Field label="Fallback number" hint="Used when the chat hands over to a human.">
          <input value={form.transferPhone} onChange={field("transferPhone")} style={input} />
        </Field>
      </div>

      <Field label="Opening message" hint="The first thing a patient sees.">
        <textarea
          value={form.greeting}
          onChange={field("greeting")}
          rows={2}
          style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
        />
      </Field>

      {message ? (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          style={{
            margin: 0,
            padding: "10px 13px",
            borderRadius: 9,
            fontSize: 13.5,
            background: message.kind === "ok" ? "#e6f6f2" : "#fdeceb",
            border: `1px solid ${message.kind === "ok" ? "#a6e3d6" : "#fda29b"}`,
            color: message.kind === "ok" ? "#0b5a54" : "#b42318",
          }}
        >
          {message.text}
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Saving…" : "Save details"}
        </button>
      </div>
    </form>
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
    <label style={{ display: "grid", gap: 6, fontSize: 13.5, color: "#0f2b2a" }}>
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
  fontSize: 14.5,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const button: React.CSSProperties = {
  padding: "11px 18px",
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 9,
  fontSize: 14.5,
  fontWeight: 600,
  cursor: "pointer",
};
