import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminApiUrl, isValidOperatorCookie, OPERATOR_COOKIE } from "../../../../lib/operator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side proxy for the operator console.
 *
 * The browser holds only an operator session cookie; the operator token stays
 * in the server's environment and is attached here. That way the token can
 * never be read from the page.
 */
async function forward(method: string, path: string, body?: unknown) {
  const jar = await cookies();
  if (!isValidOperatorCookie(jar.get(OPERATOR_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.OPERATOR_TOKEN ?? "";
  try {
    const response = await fetch(adminApiUrl(path), {
      method,
      headers: {
        "x-operator-token": token,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};
    return NextResponse.json(parsed, { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "backend_unreachable" }, { status: 502 });
  }
}

export async function GET() {
  return forward("GET", "/api/operator/licenses");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  return forward("POST", "/api/operator/licenses", body ?? {});
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  return forward("PATCH", "/api/operator/licenses", body ?? {});
}
