"use client";

import React, { useState } from "react";

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
export default function WebsiteOrigin({
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
        <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
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
