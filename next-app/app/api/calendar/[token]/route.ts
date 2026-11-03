import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/admin-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/calendar/<token>[.ics]
 *
 * Public, read-only passthrough to the assistant backend's ICS feed. Exists so
 * the URL a practice pastes into Google Calendar lives on the console's own
 * domain instead of the internal backend host.
 *
 * The backend token is the credential. We forward only a small allow-list of
 * headers, add a timeout, and never echo upstream error bodies.
 */
const TIMEOUT_MS = 8000;

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token: raw } = await context.params;
  const token = raw.replace(/\.ics$/i, "");

  // Same shape the backend enforces for businesses.calendar_token.
  if (!/^[A-Za-z0-9_-]{32,96}$/.test(token)) {
    return new NextResponse("Not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl(`/api/calendar/${token}.ics`), {
      headers: { Accept: "text/calendar" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return new NextResponse("Calendar feed unavailable", { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${token.slice(0, 8)}.ics"`,
      "Cache-Control": "private, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
