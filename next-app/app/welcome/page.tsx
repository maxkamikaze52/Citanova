import { redirect } from "next/navigation";
import { CopyField } from "../components/ui";
import { readInviteCookie } from "../../lib/db";
import { widgetTag } from "../../lib/operator";
import { getMyBusiness } from "../../lib/db";

export const dynamic = "force-dynamic";

/**
 * Se muestra una sola vez, justo después del alta: todo lo necesario para salir en vivo.
 * Se llega mientras la cookie de invitación sigue viva; después esa misma información
 * vive en el panel, así que esta página solo redirige allí.
 */
export default async function WelcomePage() {
  const { business, userId } = await getMyBusiness();
  if (!userId) redirect("/login");
  if (!business) redirect("/signup");

  const invite = await readInviteCookie();
  const siteKey = invite && invite.businessId === business.id ? invite.siteKey : business.site_key;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";

  const snippet = widgetTag(siteKey, business.name);

  const feedUrl = business.calendar_token
    ? `${appUrl}/api/calendar/${business.calendar_token}.ics`
    : null;

  return (
    <main id="main" style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 88px" }}>
      <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, margin: 0 }}>
        ✓ {business.name} ya está dado de alta
      </p>
      <h1 style={{ fontSize: 32, margin: "6px 0 10px" }}>Tu asistente está listo</h1>
      <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: 30 }}>
        Hemos creado una agenda, una lista de precios, el horario de apertura y este panel. Quedan
        dos cosas: poner el chat en tu web y suscribirte al calendario.
      </p>

      <Step
        number={1}
        title="Pega esto en tu página web"
        note="Justo antes de </body>, en todas las páginas donde el visitante pueda usar el chat."
      >
        <CopyField label="Etiqueta del widget" value={snippet} />
      </Step>

      <Step
        number={2}
        title="Ver las citas en Google Calendar"
        note="Google Calendar → Otros calendarios → + → Desde URL → pega el enlace. Se actualiza solo."
      >
        {feedUrl ? (
          <CopyField label="Fuente del calendario (solo lectura)" value={feedUrl} />
        ) : (
          <p style={{ margin: 0, color: "var(--warn)" }}>
            Este negocio todavía no tiene token de calendario. Actívalo desde el panel.
          </p>
        )}
      </Step>

      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "var(--surface)",
        }}
      >
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--ink)" }}>
          Pruébalo ahora: abre tu web y pide una cita en el chat. La reserva aparece en tu panel en
          menos de diez segundos.
        </p>
        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Ir a mi panel →
        </a>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  note,
  children,
}: {
  number: number;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 17, margin: "0 0 4px", display: "flex", gap: 10, alignItems: "center" }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {number}
        </span>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px 34px" }}>{note}</p>
      <div style={{ marginLeft: 34 }}>{children}</div>
    </section>
  );
}
