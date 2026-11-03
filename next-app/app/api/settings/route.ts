import { NextResponse } from "next/server";
import { callBackend, ownerContext } from "../../../lib/admin-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH — practice details (name, contact, assistant settings).
 *
 * Passed straight through to the backend's validated settings schema, so the
 * console cannot write a field the backend does not recognise.
 */
export async function PATCH(request: Request) {
  const context = await ownerContext();
  if ("error" in context) return context.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await callBackend("/api/admin/settings", { method: "PATCH", body }, context);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ ok: false, error: "backend_unreachable" }, { status: 502 });
  }
}
