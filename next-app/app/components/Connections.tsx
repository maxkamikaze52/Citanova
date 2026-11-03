"use client";

import { useState } from "react";

type FieldSpec = {
  key: string;
  label: string;
  secret: boolean;
  placeholder?: string;
  required: boolean;
};

export type Connection = {
  provider: "whatsapp" | "google_calendar" | "email";
  label: string;
  capability: "active" | "saved_only";
  help: string;
  fields: FieldSpec[];
  connected: boolean;
  status: string;
  accountLabel: string | null;
  lastError: string | null;
  updatedAt: string | null;
};

/**
 * One card per connector. The fields come from the backend, so the form can
 * never drift from what the server validates.
 *
 * Honesty note: `capability` decides the wording. "saved_only" tells the
 * practice their details are stored and encrypted but that the connector is
 * not sending anything yet — we never imply it works when it does not.
 */
export default function Connections({ initial }: { initial: Connection[] }) {
  const [connections, setConnections] = useState(initial);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.provider}
          connection={connection}
          onUpdated={(next) =>
            setConnections((current) =>
              current.map((item) => (item.provider === next.provider ? { ...item, ...next } : item)),
            )
          }
        />
      ))}
    </div>
  );
}

function ConnectionCard({
  connection,
  onUpdated,
}: {
  connection: Connection;
  onUpdated: (patch: Partial<Connection>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: connection.provider,
        accountLabel: values[connection.fields[0]?.key ?? ""] ?? null,
        credentials: values,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok || !data.ok) {
      const field = data.field ? ` (${data.field})` : "";
      setError(`${data.error ?? "Could not save."}${field}`);
      return;
    }

    setSaved(true);
    setValues({});
    setOpen(false);
    onUpdated({ connected: true, status: "connected", lastError: null });
    window.setTimeout(() => setSaved(false), 2500);
  }

  async function disconnect() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: connection.provider }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("Could not disconnect.");
      return;
    }
    onUpdated({ connected: false, status: "revoked", accountLabel: null });
  }

  return (
    <section
      style={{
        background: "#fff",
        border: `1px solid ${connection.connected ? "#a6e3d6" : "#dbe8e5"}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <header style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ fontSize: 15.5, margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            {connection.label}
            <Badge connected={connection.connected} capability={connection.capability} />
          </h3>
          <p style={{ fontSize: 13, color: "#5b7573", margin: 0, maxWidth: "62ch" }}>{connection.help}</p>
          {connection.connected && connection.accountLabel ? (
            <p style={{ fontSize: 12.5, color: "#0f2b2a", margin: "8px 0 0" }}>
              Connected as <strong>{connection.accountLabel}</strong>
            </p>
          ) : null}
          {connection.lastError ? (
            <p style={{ fontSize: 12.5, color: "#b42318", margin: "8px 0 0" }}>
              Last error: {connection.lastError}
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {connection.connected ? (
            <button type="button" onClick={disconnect} disabled={busy} style={ghostButton}>
              Disconnect
            </button>
          ) : null}
          <button type="button" onClick={() => setOpen((v) => !v)} style={button}>
            {open ? "Cancel" : connection.connected ? "Replace details" : "Connect"}
          </button>
        </div>
      </header>

      {saved ? (
        <p style={{ ...note, background: "#e6f6f2", borderColor: "#a6e3d6", color: "#0b5a54" }}>
          Saved and encrypted. {connection.capability === "saved_only" ? "It will be used as soon as the connector is enabled." : ""}
        </p>
      ) : null}

      {open ? (
        <form onSubmit={save} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {connection.fields.map((field) => (
            <label key={field.key} style={{ display: "grid", gap: 6, fontSize: 13.5, color: "#0f2b2a" }}>
              <span style={{ fontWeight: 600 }}>{field.label}</span>
              <input
                type={field.secret ? "password" : "text"}
                required={field.required}
                autoComplete="off"
                spellCheck={false}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
                style={input}
              />
            </label>
          ))}

          {error ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p> : null}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Saving…" : "Save securely"}
            </button>
            <span style={{ fontSize: 12.5, color: "#5b7573" }}>Encrypted before it is stored.</span>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function Badge({
  connected,
  capability,
}: {
  connected: boolean;
  capability: "active" | "saved_only";
}) {
  const tone = connected
    ? { bg: "#e6f6f2", ink: "#0b5a54", text: "Connected" }
    : { bg: "#eef2f5", ink: "#475467", text: "Not connected" };

  return (
    <span style={{ display: "inline-flex", gap: 6 }}>
      <span
        style={{
          background: tone.bg,
          color: tone.ink,
          padding: "2px 9px",
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 700,
        }}
      >
        {tone.text}
      </span>
      {capability === "saved_only" ? (
        <span
          style={{
            background: "#fff5e6",
            color: "#b54708",
            padding: "2px 9px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          Saved only — not sending yet
        </span>
      ) : null}
    </span>
  );
}

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 14.5,
  fontFamily: "inherit",
};

const button: React.CSSProperties = {
  padding: "9px 15px",
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const ghostButton: React.CSSProperties = {
  padding: "9px 15px",
  background: "#fff",
  color: "#b42318",
  border: "1px solid #fda29b",
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const note: React.CSSProperties = {
  margin: "12px 0 0",
  padding: "10px 13px",
  border: "1px solid",
  borderRadius: 9,
  fontSize: 13,
};
