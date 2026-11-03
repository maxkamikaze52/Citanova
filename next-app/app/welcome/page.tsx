import { redirect } from "next/navigation";
import CopyField from "../components/CopyField";
import { readInviteCookie } from "../../lib/account";
import { widgetTag } from "../../lib/widget-tag";
import { getMyBusiness } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Shown once, straight after signup: everything they need to go live.
 * Reached while the invite cookie is still valid; afterwards the same
 * information lives in the dashboard, so this page just forwards there.
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
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 88px" }}>
      <p style={{ fontSize: 13, color: "#0f766e", fontWeight: 600, margin: 0 }}>
        ✓ {business.name} is set up
      </p>
      <h1 style={{ fontSize: 32, margin: "6px 0 10px" }}>Your assistant is ready</h1>
      <p style={{ color: "#4b5f5c", marginTop: 0, marginBottom: 30 }}>
        We created a diary, a price list, opening hours and this dashboard. Two things left: put
        the chat on your site, and subscribe to the calendar.
      </p>

      <Step number={1} title="Paste this into your website" note="Just before </body>, on every page visitors might use the chat.">
        <CopyField label="Widget tag" value={snippet} />
      </Step>

      <Step
        number={2}
        title="See bookings in Google Calendar"
        note="Google Calendar → Other calendars → + → From URL → paste the link. It refreshes by itself."
      >
        {feedUrl ? (
          <CopyField label="Calendar feed (read-only)" value={feedUrl} />
        ) : (
          <p style={{ margin: 0, color: "#b54708" }}>
            This practice has no calendar token yet — enable it from the dashboard.
          </p>
        )}
      </Step>

      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #dbe8e5",
          borderRadius: 14,
          background: "#f6fbfa",
        }}
      >
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "#0f2b2a" }}>
          Test it now: open your site and ask the chat for an appointment. The booking appears in
          your dashboard within ten seconds.
        </p>
        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            background: "#0f766e",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to my dashboard →
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
            background: "#0f766e",
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
      <p style={{ fontSize: 13, color: "#5b7573", margin: "0 0 10px 34px" }}>{note}</p>
      <div style={{ marginLeft: 34 }}>{children}</div>
    </section>
  );
}
