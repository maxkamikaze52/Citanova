import { redirect } from "next/navigation";
import Connections, { type Connection } from "../../components/Connections";
import CopyField from "../../components/CopyField";
import PracticeDetails from "../../components/PracticeDetails";
import WebsiteOrigin from "../../components/WebsiteOrigin";
import { callBackend, ownerContext } from "../../../lib/admin-proxy";
import { widgetTag } from "../../../lib/widget-tag";
import { createSupabaseServer, getMyBusiness } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

/** Loopback is ours, not theirs: kept for testing, never shown as their site. */
function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
}

/**
 * Everything a practice has to give us, in one place: their details, their
 * connections, and the two things they paste elsewhere.
 */
export default async function SettingsPage() {
  const { business } = await getMyBusiness();
  if (!business) redirect("/signup");

  const context = await ownerContext();
  if ("error" in context) redirect("/login");

  // Practice details come from the backend's settings view (already validated
  // and normalised); fall back to the business row if it is unreachable.
  let details = {
    name: business.name,
    phone: business.contact?.phone ?? "",
    email: business.contact?.email ?? "",
    address: business.contact?.address ?? "",
    tagline: business.contact?.tagline ?? "",
    greeting: business.contact?.greeting ?? "",
    assistantName: "",
    transferPhone: "",
  };

  let connections: Connection[] = [];
  let backendError: string | null = null;
  // The backend owns the truth here; the business row is the fallback.
  let allowedOrigins: string[] = business.allowed_origins ?? [];

  try {
    const [settings, integrations] = await Promise.all([
      callBackend("/api/admin/settings", { method: "GET" }, context),
      callBackend("/api/admin/integrations", { method: "GET" }, context),
    ]);

    const payload = settings.body as any;
    const view = payload?.settings;
    if (settings.status === 200 && payload?.ok && view) {
      details = {
        name: view.name ?? details.name,
        phone: view.contact?.phone ?? "",
        email: view.contact?.email ?? "",
        address: view.contact?.address ?? "",
        tagline: view.contact?.tagline ?? "",
        greeting: view.contact?.greeting ?? "",
        assistantName: view.settings?.assistant?.name ?? "",
        transferPhone: view.transferPhone ?? "",
      };
      if (Array.isArray(view.allowedOrigins)) allowedOrigins = view.allowedOrigins;
    }

    const list = (integrations.body as any)?.connections;
    if (Array.isArray(list)) connections = list as Connection[];
    else backendError = "The assistant service did not return connector settings.";
  } catch {
    backendError = "Could not reach the assistant service. Start it, then reload.";
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const snippet = widgetTag(business.site_key, business.name);
  const feedUrl = business.calendar_token
    ? `${appUrl}/api/calendar/${business.calendar_token}.ics`
    : null;

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p style={{ margin: "0 0 4px" }}>
        <a href="/dashboard" style={{ color: "#0f766e", fontSize: 14, textDecoration: "none" }}>
          ← Dashboard
        </a>
      </p>
      <h1 style={{ fontSize: 30, margin: "0 0 6px" }}>Settings</h1>
      <p style={{ color: "#5b7573", marginTop: 0, marginBottom: 30 }}>
        Everything the assistant needs to work for {business.name}. Secrets are encrypted before
        they are stored and are never shown again.
      </p>

      {backendError ? (
        <p
          style={{
            background: "#fdeceb",
            border: "1px solid #fda29b",
            color: "#b42318",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13.5,
            marginBottom: 24,
          }}
        >
          {backendError}
        </p>
      ) : null}

      <Section title="Practice details" note="Shown to patients and used by the assistant.">
        <PracticeDetails initial={details} />
      </Section>

      <Section
        title="Your website"
        note="The address the chat is allowed to answer on. Visitors anywhere else are refused."
      >
        <WebsiteOrigin
          initial={allowedOrigins.find((o) => !isLocalOrigin(o)) ?? ""}
          origins={allowedOrigins}
        />
      </Section>

      <Section
        title="Connections"
        note="Connect each service with your own account. Nothing is shared between practices."
      >
        {connections.length ? (
          <Connections initial={connections} />
        ) : (
          <p style={{ color: "#5b7573", fontSize: 14 }}>Connector settings are unavailable.</p>
        )}
      </Section>

      <Section title="Put it on your website" note="Paste immediately before </body>.">
        <CopyField label="Widget tag" value={snippet} />
      </Section>

      <Section
        title="See bookings in your calendar"
        note="Google Calendar → Other calendars → + → From URL → paste this link."
      >
        {feedUrl ? (
          <CopyField label="Read-only calendar feed" value={feedUrl} />
        ) : (
          <p style={{ color: "#b54708", fontSize: 14, margin: 0 }}>No calendar token yet.</p>
        )}
      </Section>
    </main>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontSize: 18, margin: "0 0 3px" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#5b7573", margin: "0 0 14px" }}>{note}</p>
      {children}
    </section>
  );
}
