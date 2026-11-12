"use client";

import { useCallback, useEffect, useState } from "react";

type Key = {
  id: string;
  hint: string;
  plan: string;
  status: string;
  maxDevices: number;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  activatedAt: string | null;
  businessName: string | null;
  devices: number;
  deviceList: { hostname: string | null; os: string | null; lastSeenAt: string }[];
};

/** dd/mm/yyyy — Max is European; every date in this console is day-first. */
function dmy(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export default function OperatorConsole() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minted, setMinted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [plan, setPlan] = useState<"starter" | "pro" | "practice">("starter");
  const [maxDevices, setMaxDevices] = useState(1);
  const [notes, setNotes] = useState("");
  const [expiry, setExpiry] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/operator/licenses", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (response.status === 401) {
      setError("unauthorized");
      return;
    }
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Could not load keys.");
      return;
    }
    setError("");
    setKeys(data.keys ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function mint(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMinted(null);

    const response = await fetch("/api/operator/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        maxDevices,
        notes: notes || null,
        expiresAt: expiry ? new Date(`${expiry}T23:59:59Z`).toISOString() : null,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok || !data.ok) {
      setError(data.error ?? "Could not create the key.");
      return;
    }
    setMinted(data.key);
    setNotes("");
    setExpiry("");
    load();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/operator/licenses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    setBusy(false);
    load();
  }

  if (error === "unauthorized") {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Operator console</h1>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          This page is for the supplier, not for practices. Sign in with your operator code.
        </p>
        <OperatorLogin
          onDone={() => {
            setError("");
            setLoading(true);
            load();
          }}
        />
      </div>
    );
  }

  return (
    <main id="main" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <h1 style={{ fontSize: 28, margin: "0 0 4px" }}>Operator console</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 26 }}>
        Mint a key for a practice, then run the installer on their machine with that key.
      </p>

      {minted ? (
        <div
          style={{
            border: "1px solid var(--success-line)",
            background: "var(--success-bg)",
            borderRadius: 8,
            padding: 20,
            marginBottom: 26,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--success-ink)", fontWeight: 700 }}>
            Key created — copy it now, it is never shown again
          </p>
          <code
            style={{
              display: "block",
              fontFamily: "ui-monospace,monospace",
              fontSize: 19,
              letterSpacing: "0.04em",
              background: "#fff",
              border: "1px solid var(--success-line)",
              borderRadius: 6,
              padding: "12px 14px",
              userSelect: "all",
            }}
          >
            {minted}
          </code>
          <p style={{ fontSize: 13, color: "var(--success-ink)", margin: "10px 0 0" }}>
            Next: on their computer, in the installer folder, run{" "}
            <code>node install.mjs</code> and paste this key. You keep this key on your side only —
            the practice should never need it.
          </p>
        </div>
      ) : null}

      <section
        style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 20, marginBottom: 30 }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 14px" }}>Create a key</h2>
        <form onSubmit={mint} style={{ display: "grid", gap: 12 }}>
          <div className="cols-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={label}>
              <span>Plan</span>
              <select value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} style={input}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="practice">Practice</option>
              </select>
            </label>
            <label style={label}>
              <span>Machines allowed</span>
              <input
                type="number"
                min={1}
                max={50}
                value={maxDevices}
                onChange={(e) => setMaxDevices(Number(e.target.value))}
                style={input}
              />
            </label>
            <label style={label}>
              <span>Expires (optional)</span>
              <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={input} />
            </label>
          </div>
          <label style={label}>
            <span>Note (who is this for?)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bright Smile Dental — paid £49/mo"
              style={input}
            />
          </label>
          <div>
            <button type="submit" disabled={busy} style={{ ...button, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Working…" : "Create key"}
            </button>
          </div>
        </form>
      </section>

      <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Keys issued</h2>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>{error}</p>
      ) : keys.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No keys yet. Create one above.</p>
      ) : (
        <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--surface)", textAlign: "left", fontSize: 12, color: "var(--muted)" }}>
                <th style={th}>Key</th>
                <th style={th}>Plan</th>
                <th style={th}>Status</th>
                <th style={th}>Machines</th>
                <th style={th}>Expires</th>
                <th style={th}>Note</th>
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} style={{ borderTop: "1px solid var(--line-soft)" }}>
                  <td style={{ ...td, fontFamily: "ui-monospace,monospace", fontSize: 13 }}>
                    {key.hint}
                  </td>
                  <td style={td}>{key.plan}</td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background:
                          key.status === "active"
                            ? "var(--success-bg)"
                            : key.status === "revoked"
                              ? "var(--danger-bg)"
                              : key.status === "suspended"
                                ? "var(--warn-bg)"
                                : "var(--neutral-bg)",
                        color:
                          key.status === "active"
                            ? "var(--success-ink)"
                            : key.status === "revoked"
                              ? "var(--danger)"
                              : key.status === "suspended"
                                ? "var(--warn)"
                                : "var(--neutral-ink)",
                      }}
                    >
                      {key.status}
                    </span>
                  </td>
                  <td style={td}>
                    {key.devices}/{key.maxDevices}
                  </td>
                  <td style={td}>{dmy(key.expiresAt)}</td>
                  <td style={{ ...td, color: "var(--muted)", maxWidth: 220 }}>{key.notes ?? "—"}</td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    {key.status !== "revoked" ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            patch(key.id, {
                              status: key.status === "suspended" ? "active" : "suspended",
                            })
                          }
                          style={smallButton}
                        >
                          {key.status === "suspended" ? "Resume" : "Pause"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (confirm(`Revoke ${key.hint}? Every machine using it stops working.`)) {
                              patch(key.id, { status: "revoked", revokeDevices: true });
                            }
                          }}
                          style={{ ...smallButton, color: "var(--danger)", borderColor: "var(--danger-line)" }}
                        >
                          Revoke
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--faint)" }}>cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 16 }}>
        Only the last characters of each key are stored, so a key can be identified but never read
        back. If a practice loses theirs, revoke it and mint a new one.
      </p>
    </main>
  );
}

function OperatorLogin({ onDone }: { onDone: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/operator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("That code is not right.");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Operator code"
        style={input}
        required
      />
      {error ? <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p> : null}
      <button type="submit" disabled={busy} style={button}>
        {busy ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ink)",
};

const input: React.CSSProperties = {
  padding: "9px 11px",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
  fontWeight: 400,
  width: "100%",
  boxSizing: "border-box",
};

const button: React.CSSProperties = {
  padding: "10px 17px",
  background: "var(--accent)",
  color: "#fff",
  border: 0,
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const smallButton: React.CSSProperties = {
  padding: "5px 10px",
  marginLeft: 6,
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--ink)",
};

const th: React.CSSProperties = {
  padding: "10px 14px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const td: React.CSSProperties = { padding: "11px 14px", verticalAlign: "middle" };
