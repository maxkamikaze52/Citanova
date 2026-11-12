import { redirect } from "next/navigation";
import { AutoRefresh } from "../components/ui";
import { CopyField } from "../components/ui";
import { widgetTag } from "../../lib/operator";
import { createSupabaseServer, getMyBusiness } from "../../lib/db";

export const dynamic = "force-dynamic";

type Appt = {
  id: string;
  reference: string | null;
  starts_at: string;
  status: string;
  source: string;
  customers: { name: string | null; phone: string | null } | null;
  services: { name: string | null } | null;
};

type Msg = { id: string; role: string; content: string; created_at: string; conversation_id: string };

const TONE: Record<string, { bg: string; ink: string }> = {
  booked: { bg: "var(--success-bg)", ink: "var(--success-ink)" },
  confirmed: { bg: "var(--success-bg)", ink: "var(--success-ink)" },
  cancelled: { bg: "var(--danger-bg)", ink: "var(--danger)" },
  completed: { bg: "var(--neutral-bg)", ink: "var(--neutral-ink)" },
  no_show: { bg: "var(--warn-bg)", ink: "var(--warn)" },
};

/** Max is European: every date shown is DD/MM/YYYY, 24-hour. */
function when(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default async function Dashboard() {
  const { business, userId } = await getMyBusiness();
  if (!userId) redirect("/login");
  if (!business) {
    // Signed in but no practice: finish setup instead of showing an empty page.
    redirect("/signup");
  }

  // Reads go through RLS as the signed-in user, not the service role.
  const sb = await createSupabaseServer();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const nowIso = new Date().toISOString();
  const UPCOMING_LIMIT = 150;
  const d = new Date();
  const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
  const [
    { data: upcomingRows },
    { data: recentRows },
    { data: lines },
    { count: usedCount },
    { count: convCount },
    { count: upcomingCount },
  ] = await Promise.all([
      sb
        .from("appointments")
        .select("id,reference,starts_at,status,source,customers(name,phone),services(name)")
        .eq("business_id", business.id)
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(UPCOMING_LIMIT),
      sb
        .from("appointments")
        .select("id,reference,starts_at,status,source,customers(name,phone),services(name)")
        .eq("business_id", business.id)
        .gte("starts_at", since)
        .lt("starts_at", nowIso)
        .order("starts_at", { ascending: false })
        .limit(50),
      sb
        .from("messages")
        .select("id,role,content,created_at,conversation_id")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(12),
      sb
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("kind", "message")
        .gte("created_at", monthStart),
      sb
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id),
      sb
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .gte("starts_at", new Date().toISOString())
        .neq("status", "cancelled"),
    ]);

  const recent = ((recentRows as unknown as Appt[]) ?? []).slice().reverse();
  const ahead = (upcomingRows as unknown as Appt[]) ?? [];
  const appts = [...recent, ...ahead];
  const upcomingTruncated = ahead.length >= UPCOMING_LIMIT;
  const msgs = (lines as unknown as Msg[]) ?? [];
  const used = usedCount ?? 0;
  const cap = business.monthly_message_cap;
  const billingOk = ["active", "trialing"].includes(business.subscription_status);
  const billingWarn = business.subscription_status === "past_due";

  const tz = business.timezone;
  const now = Date.now();
  const upcoming = appts.filter((a) => new Date(a.starts_at).getTime() >= now && a.status !== "cancelled");
  const cancelled = appts.filter((a) => a.status === "cancelled");
  const conversations = convCount ?? 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const snippet = widgetTag(business.site_key, business.name);
  const feedUrl = business.calendar_token ? `${appUrl}/api/calendar/${business.calendar_token}.ics` : null;

  // What the chat is actually allowed on, preferring a real address over localhost.
  const allowedOrigin =
    business.allowed_origins?.find((o) => !/localhost|127\.0\.0\.1/.test(o)) ??
    business.allowed_origins?.[0] ??
    "";

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: 20,
  };

  return (
    <main id="main" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 72px" }}>
      <AutoRefresh seconds={10} />

      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 6,
        }}
      >
        <div>
          <h1 style={{ fontSize: 30, margin: 0 }}>{business.name}</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--live)",
                marginRight: 6,
              }}
            />
            Live · refreshes every 10s · {tz}
            {allowedOrigin ? ` · ${allowedOrigin}` : " · website not connected"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/dashboard/settings" style={{ fontSize: 14, color: "var(--accent)" }}>
            Settings
          </a>
          <a href="/api/auth/logout" style={{ fontSize: 14, color: "var(--accent)" }}>
            Sign out
          </a>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 14,
          margin: "26px 0 30px",
        }}
      >
        <Stat label="Upcoming bookings" value={upcomingCount ?? upcoming.length} />
        <Stat label="Cancellations" value={cancelled.length} />
        <Stat label="Conversations" value={conversations} />
        <Stat label="Appointments shown" value={appts.length} />
      </section>
      <div
        style={{
          ...card,
          margin: "-14px 0 30px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Messages this month:</strong> {used}
          {cap ? ` of ${cap}` : ""}
        </div>
        <div style={{ color: billingOk ? "var(--success-ink)" : billingWarn ? "var(--warn)" : "var(--danger)" }}>
          Billing: {business.subscription_status}
          {billingWarn ? " · last payment failed, the assistant is still running" : null}
          {!billingOk && !billingWarn ? (
            <>
              {" "}
              ·{" "}
              <a href="/pricing" style={{ color: "inherit" }}>
                Choose a plan
              </a>
            </>
          ) : null}
        </div>
      </div>

      <h2 style={{ fontSize: 19, margin: "0 0 12px" }}>Appointments the assistant booked</h2>
      {appts.length === 0 ? (
        <p style={{ ...card, color: "var(--muted)", marginBottom: 34 }}>
          Nothing yet. Open your website and book something in the chat — it appears here within
          ten seconds.
        </p>
      ) : (
        <div style={{ ...card, padding: 0, overflowX: "auto", marginBottom: 34 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12.5 }}>
                <th style={th}>When</th>
                <th style={th}>Patient</th>
                <th style={th}>Treatment</th>
                <th style={th}>Ref</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((appt) => {
                const tone = TONE[appt.status] ?? TONE.completed;
                const past = new Date(appt.starts_at).getTime() < now;
                return (
                  <tr key={appt.id} style={{ borderTop: "1px solid var(--line-soft)", opacity: past ? 0.55 : 1 }}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{when(appt.starts_at, tz)}</td>
                    <td style={td}>
                      {appt.customers?.name ?? "—"}
                      {appt.customers?.phone ? (
                        <span style={{ display: "block", color: "var(--muted)", fontSize: 12.5 }}>
                          {appt.customers.phone}
                        </span>
                      ) : null}
                    </td>
                    <td style={td}>{appt.services?.name ?? "—"}</td>
                    <td style={{ ...td, fontFamily: "ui-monospace,monospace", fontSize: 13 }}>
                      {appt.reference ?? "—"}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          background: tone.bg,
                          color: tone.ink,
                          padding: "3px 9px",
                          borderRadius: 4,
                          fontSize: 12.5,
                          fontWeight: 600,
                        }}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ fontSize: 19, margin: "0 0 12px" }}>Calendar &amp; website</h2>
      <div style={{ display: "grid", gap: 14, marginBottom: 34 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, margin: "0 0 4px" }}>Google / Apple Calendar</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
            Read-only feed. Google Calendar → Other calendars → + → From URL → paste this. Bookings
            appear automatically; nothing is ever edited from the calendar side.
          </p>
          {feedUrl ? <CopyField label="Calendar feed" value={feedUrl} /> : <p>No feed token yet.</p>}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, margin: "0 0 4px" }}>Website widget</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
            Paste this immediately before <code>&lt;/body&gt;</code>. The chat only answers
            visitors from an approved address — that is the cross-site protection.
          </p>
          <CopyField label="Widget tag" value={snippet} />
        </div>
      </div>

      <h2 style={{ fontSize: 19, margin: "0 0 12px" }}>Latest from the chat</h2>
      {msgs.length === 0 ? (
        <p style={{ ...card, color: "var(--muted)" }}>No messages yet.</p>
      ) : (
        <ul style={{ ...card, listStyle: "none", margin: 0, padding: 0 }}>
          {msgs.map((m) => (
            <li key={m.id} style={{ padding: "12px 16px", borderTop: "1px solid var(--line-soft)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 3 }}>
                <strong style={{ color: m.role === "user" ? "var(--ink)" : "var(--accent)" }}>
                  {m.role === "user" ? "Patient" : m.role === "assistant" ? "Assistant" : m.role}
                </strong>{" "}
                · {when(m.created_at, tz)}
              </div>
              <div style={{ fontSize: 14.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid var(--line-soft)",
};

const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "top" };
