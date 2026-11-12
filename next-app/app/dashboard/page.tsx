import { redirect } from "next/navigation";
import Link from "next/link";
import { AutoRefresh, CopyField } from "../components/ui";
import { widgetTag } from "../../lib/operator";
import { createSupabaseServer, getMyBusiness } from "../../lib/db";
import Usage from "./Usage";

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

type Msg = { id: string; role: string; content: string | null; created_at: string; conversation_id: string };

/** Max es europeo: toda fecha se muestra DD/MM/AAAA y en 24 h. */
function when(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

const TONE: Record<string, string> = {
  booked: "is-ok",
  confirmed: "is-ok",
  cancelled: "is-bad",
  no_show: "is-warn",
  completed: "is-idle",
};

export default async function Dashboard() {
  const { business, userId } = await getMyBusiness();
  if (!userId) redirect("/login");
  if (!business) redirect("/signup");

  const sb = await createSupabaseServer();
  const nowIso = new Date().toISOString();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const monthStart = new Date(Date.now() - 30 * 864e5).toISOString();
  const d = new Date();
  const billingMonthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();

  const [
    { data: upcomingRows },
    { data: recentRows },
    { data: lines },
    { data: usageRows },
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
      .limit(60),
    sb
      .from("appointments")
      .select("id,reference,starts_at,status,source,customers(name,phone),services(name)")
      .eq("business_id", business.id)
      .gte("starts_at", since)
      .lt("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(40),
    sb
      .from("messages")
      .select("id,role,content,created_at,conversation_id")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(40),
    // Últimos 30 días de actividad: de aquí salen las horas punta y el ahorro.
    sb
      .from("messages")
      .select("created_at,role")
      .eq("business_id", business.id)
      .gte("created_at", monthStart)
      .order("created_at", { ascending: true })
      .limit(5000),
    sb.from("usage_events").select("id", { count: "exact", head: true })
      .eq("business_id", business.id).eq("kind", "message").gte("created_at", billingMonthStart),
    sb.from("conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    sb.from("appointments").select("id", { count: "exact", head: true })
      .eq("business_id", business.id).gte("starts_at", nowIso).neq("status", "cancelled"),
  ]);

  const recent = ((recentRows as unknown as Appt[]) ?? []).slice().reverse();
  const ahead = (upcomingRows as unknown as Appt[]) ?? [];
  const appts = [...recent, ...ahead];
  const msgs = (lines as unknown as Msg[]) ?? [];
  const upcoming = appts.filter((a) => new Date(a.starts_at).getTime() >= Date.now() && a.status !== "cancelled");
  const cancelled = appts.filter((a) => a.status === "cancelled");

  const activity = (usageRows as { created_at: string; role: string }[] | null) ?? [];

  const used = usedCount ?? 0;
  const cap = business.monthly_message_cap;
  const billingOk = ["active", "trialing"].includes(business.subscription_status);
  const billingWarn = business.subscription_status === "past_due";
  const tz = business.timezone;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const snippet = widgetTag(business.site_key, business.name);
  const feedUrl = business.calendar_token ? `${appUrl}/api/calendar/${business.calendar_token}.ics` : null;
  const allowedOrigin =
    business.allowed_origins?.find((o) => !/localhost|127\.0\.0\.1/.test(o)) ?? business.allowed_origins?.[0] ?? "";

  return (
    <main id="main" className="dash">
      <AutoRefresh seconds={15} />

      <header className="dash-head">
        <div>
          <p className="dash-eyebrow">Panel del negocio</p>
          <h1>{business.name}</h1>
          <p className="dash-sub">
            <span className="dash-live" aria-hidden="true" />
            En directo · se actualiza cada 15 s · {tz}
            {allowedOrigin ? ` · ${allowedOrigin}` : " · web sin conectar"}
          </p>
        </div>
        <nav className="dash-nav" aria-label="Cuenta">
          <Link href="/dashboard/settings">Ajustes</Link>
          <a href="/api/auth/logout">Salir</a>
        </nav>
      </header>

      {!billingOk ? (
        <p className={`dash-alert${billingWarn ? " is-warn" : ""}`}>
          {billingWarn
            ? "El pago está pendiente. El asistente sigue respondiendo, pero la suscripción necesita atención."
            : "No hay suscripción activa. El asistente responde, pero no se están cerrando citas nuevas."}
        </p>
      ) : null}

      {/* Analítica de uso: lo que de verdad quiere ver el profesional. */}
      <Usage activity={activity} appointments={appts} conversations={convCount ?? 0} usedThisMonth={used} cap={cap} tz={tz} />

      <section className="dash-grid2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Próximas citas</h2>
            <span className="dash-count">{upcomingCount ?? upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="dash-empty">Todavía no hay citas por delante. Cuando el chat reserve, aparecerán aquí.</p>
          ) : (
            <ul className="dash-list">
              {upcoming.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <span className="dash-when">{when(a.starts_at, tz)}</span>
                  <span className="dash-what">
                    <strong>{a.customers?.name ?? "Cliente"}</strong>
                    <em>{a.services?.name ?? "Cita"}{a.reference ? ` · ${a.reference}` : ""}</em>
                  </span>
                  <span className={`dash-tag ${TONE[a.status] ?? "is-idle"}`}>{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Últimas conversaciones</h2>
            <span className="dash-count">{convCount ?? 0}</span>
          </div>
          {msgs.length === 0 ? (
            <p className="dash-empty">Sin mensajes todavía. En cuanto alguien escriba en tu web, lo verás aquí.</p>
          ) : (
            <ul className="dash-list">
              {msgs.slice(0, 10).map((m) => (
                <li key={m.id}>
                  <span className="dash-when">{when(m.created_at, tz)}</span>
                  <span className="dash-what">
                    <strong>{m.role === "assistant" ? "Asistente" : "Cliente"}</strong>
                    <em>{(m.content ?? "").slice(0, 90)}</em>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="dash-grid2">
        <div className="dash-card">
          <div className="dash-card-head"><h2>Pega esto en tu web</h2></div>
          <p className="dash-hint">
            Justo antes de <code>&lt;/body&gt;</code>. Solo responde en {allowedOrigin || "la dirección que autorices"}.
          </p>
          <CopyField label="Etiqueta del widget" value={snippet} />
        </div>

        <div className="dash-card">
          <div className="dash-card-head"><h2>Tu calendario</h2></div>
          {feedUrl ? (
            <>
              <p className="dash-hint">
                Google Calendar → Otros calendarios → + → Desde URL. Se actualiza solo y es de solo lectura.
              </p>
              <CopyField label="Fuente del calendario" value={feedUrl} />
            </>
          ) : (
            <p className="dash-empty">Todavía no hay token de calendario. Actívalo en Ajustes.</p>
          )}
        </div>
      </section>

      {cancelled.length > 0 ? (
        <section className="dash-card">
          <div className="dash-card-head"><h2>Canceladas</h2><span className="dash-count">{cancelled.length}</span></div>
          <ul className="dash-list">
            {cancelled.slice(0, 6).map((a) => (
              <li key={a.id}>
                <span className="dash-when">{when(a.starts_at, tz)}</span>
                <span className="dash-what">
                  <strong>{a.customers?.name ?? "Cliente"}</strong>
                  <em>{a.services?.name ?? "Cita"}</em>
                </span>
                <span className="dash-tag is-bad">cancelada</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
