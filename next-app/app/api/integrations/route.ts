import { NextResponse } from "next/server";
import { callBackend, ownerContext } from "../../../lib/admin-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — connection statuses and the form definitions. */
export async function GET() {
  const context = await ownerContext();
  if ("error" in context) return context.error;

  try {
    const { status, body } = await callBackend("/api/admin/integrations", { method: "GET" }, context);
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ ok: false, error: "backend_unreachable" }, { status: 502 });
  }
}

/** PATCH — save one provider's credentials. */
export async function PATCH(request: Request) {
  const context = await ownerContext();
  if ("error" in context) return context.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await callBackend(
      "/api/admin/integrations",
      { method: "PATCH", body },
      context,
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ ok: false, error: "backend_unreachable" }, { status: 502 });
  }
}

/** DELETE — disconnect a provider. */
export async function DELETE(request: Request) {
  const context = await ownerContext();
  if ("error" in context) return context.error;

  const body = await request.json().catch(() => null);

  try {
    const result = await callBackend(
      "/api/admin/integrations",
      { method: "DELETE", body },
      context,
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ ok: false, error: "backend_unreachable" }, { status: 502 });
  }
}
