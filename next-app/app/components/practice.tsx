"use client";

import {
  COUNTRIES,
  countryByIso,
  countryForTimezone,
  formatNumber,
  placeholderFor,
  splitNumber,
  toE164,
} from "../../lib/countries";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  /** Stored E.164 value ("+34612345678"), or "" when empty. */
  value: string;
  /** Called with E.164, or "" when the field is cleared. */
  onChange: (next: string) => void;
  /** Which country the picker starts on; defaults to the practice timezone. */
  timeZone?: string | null;
  style?: React.CSSProperties;
  id?: string;
};

const field: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 14.5,
  fontFamily: "inherit",
  background: "#fff",
  color: "#0f2b2a",
  boxSizing: "border-box",
};

/**
 * A phone field that accepts any country on earth.
 *
 * People type numbers in whatever shape they know ("612 345 678", "0034 612…",
 * "+44 7700 900123"), so the picker is a convenience, not a requirement: paste a
 * full international number and the country switches itself. What leaves the
 * field is always E.164, which is what WhatsApp/SMS and the CRM expect.
 */
export function PhoneField({ value, onChange, timeZone, style, id }: Props) {
  const fallbackIso = countryForTimezone(timeZone);
  const first = splitNumber(value, fallbackIso);
  const [iso, setIso] = useState(first.iso);
  const [national, setNational] = useState(first.national);

  // Remember what we last emitted, so a save round-trip does not fight typing.
  const emitted = useRef(value);
  useEffect(() => {
    if (value === emitted.current) return;
    const parsed = splitNumber(value, fallbackIso);
    setIso(parsed.iso);
    setNational(parsed.national);
    emitted.current = value;
  }, [value, fallbackIso]);

  const country = countryByIso(iso) ?? COUNTRIES[0];

  function emit(nextIso: string, nextNational: string) {
    const next = countryByIso(nextIso) ?? COUNTRIES[0];
    const e164 = toE164(next.dial, nextNational, next.iso);
    emitted.current = e164;
    onChange(e164);
  }

  function onNumberChange(raw: string) {
    // Pasting "+34 612 345 678" or "0044 7700 900123" should not need the picker.
    const looksInternational = /^\s*(\+|00)/.test(raw);
    if (looksInternational) {
      const parsed = splitNumber(raw, iso);
      setIso(parsed.iso);
      setNational(parsed.national);
      emit(parsed.iso, parsed.national);
      return;
    }
    const digits = raw.replace(/[^\d]/g, "").slice(0, 15);
    setNational(digits);
    emit(iso, digits);
  }

  const shown = value ? formatNumber(country.dial, national) : "";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)", gap: 8 }}>
        <select
          aria-label="Country calling code"
          value={iso}
          onChange={(event) => {
            setIso(event.target.value);
            emit(event.target.value, national);
          }}
          style={{ ...field, ...style, cursor: "pointer" }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          onChange={(event) => onNumberChange(event.target.value)}
          placeholder={placeholderFor(iso)}
          style={{ ...field, ...style, width: "100%" }}
        />
      </div>

      <span style={{ fontSize: 12.5, color: shown ? "#0b5a54" : "#5b7573", fontWeight: 400 }}>
        {shown ? (
          <>
            Saved as <strong style={{ fontWeight: 600 }}>{shown}</strong>
          </>
        ) : (
          "Any country works — pick yours, or paste a number with +country code."
        )}
      </span>
    </div>
  );
}

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
export function PracticeDetails({
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

/**
 * The address of the practice's website.
 *
 * This is the one thing only they can tell us, and it is what the assistant
 * checks before it answers anyone: a visitor's chat arrives with an Origin
 * header, and if it is not on the list the request is refused. Until now only
 * the installer could write it, so a practice that signed up on the website had
 * a dead chat widget and no way to fix it.
 *
 * They type one address (a bare domain is fine). The backend normalises it and
 * keeps our localhost entries for testing. `origins` is the resolved list.
 */
export function WebsiteOrigin({
  initial,
  origins,
}: {
  initial: string;
  origins: string[];
}) {
  const [site, setSite] = useState(initial);
  const [saved, setSaved] = useState(origins);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const connected = saved.filter((o) => !isLocal(o));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: site }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok) {
      const detail =
        data?.error?.message ?? data?.error ?? "Could not save that address.";
      setMessage({ kind: "error", text: String(detail) });
      return;
    }

    const next: string[] = data?.settings?.allowedOrigins ?? saved;
    const real = next.filter((o) => !isLocal(o));
    setSaved(next);
    setSite(real[0] ?? "");
    setMessage({
      kind: "ok",
      text: real.length
        ? "Saved. The chat now works on that address."
        : "Saved. Enter an address before putting the chat on your site.",
    });
  }

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6, fontSize: 13.5, color: "#0f2b2a" }}>
        <span style={{ fontWeight: 600 }}>Your website</span>
        <input
          value={site}
          onChange={(event) => setSite(event.target.value)}
          placeholder="brightsmile.co.uk"
          style={input}
        />
        <span style={{ fontSize: 12.5, color: "#5b7573" }}>
          Where the chat widget is installed. Visitors to any other address are turned away, so
          this is what stops someone else putting your assistant on their site.
        </span>
      </label>

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

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button type="submit" disabled={busy} style={{ ...buttonSite, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Saving…" : "Save website"}
        </button>
        {connected.length ? (
          <span style={{ fontSize: 13, color: "#0b5a54" }}>
            Live on {connected.join(", ")}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: "#b54708" }}>
            Not connected to a website yet — the chat will refuse visitors.
          </span>
        )}
      </div>
    </form>
  );
}

/** Loopback is ours, not theirs: it is kept for testing and never shown. */
function isLocal(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
}

const inputSite: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 14.5,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const buttonSite: React.CSSProperties = {
  padding: "11px 18px",
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 9,
  fontSize: 14.5,
  fontWeight: 600,
  cursor: "pointer",
};
