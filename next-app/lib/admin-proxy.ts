import { NextResponse } from "next/server";
import { createSupabaseServer, getMyBusiness } from "./supabase-server";

/**
 * Proxies the console to the assistant backend's owner-authenticated admin API.
 *
 * Why a proxy instead of calling the backend from the browser:
 *  - the Supabase access token never leaves the server,
 *  - the backend URL is not exposed,
 *  - the tenant header is set here from the signed-in user, not from input.
 *
 * The backend re-checks ownership from the token, so this is convenience
 * framing, not the security boundary.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The practice and access token of the caller, or null when not signed in. */
export async function ownerContext(): Promise<
  { token: string; businessId: string } | { error: NextResponse }
> {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.access_token) {
    return { error: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }

  // Same rule as the dashboard: the earliest membership.
  const { business } = await getMyBusiness();
  if (!business?.id) {
    return { error: NextResponse.json({ ok: false, error: "no_practice" }, { status: 409 }) };
  }

  return { token: session.access_token, businessId: business.id };
}

export function backendUrl(path: string): string {
  const configured = process.env.ASSISTANT_API_URL;
  if (!configured && process.env.NODE_ENV === "production") {
    console.error("[admin-proxy] ASSISTANT_API_URL is not set");
    throw new Error("ASSISTANT_API_URL is not set");
  }
  const base = (configured || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path}`;
}

/** Calls the backend admin API as the signed-in owner. */
export async function callBackend(
  path: string,
  init: { method: string; body?: unknown },
  context: { token: string; businessId: string },
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(backendUrl(path), {
    method: init.method,
    headers: {
      Authorization: `Bearer ${context.token}`,
      "x-business-id": context.businessId,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { ok: false, error: "bad_upstream_response" };
  }
  return { status: response.status, body: parsed };
}
