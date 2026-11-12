import { NextResponse } from "next/server";
import { parseSignupBody, signUpOrIn, setInviteCookie, validateSignup } from "../../../lib/db";
import { provisionBusiness, normalizePracticeName, isValidTimeZone } from "../../../lib/operator";
import { admin } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/signup — the whole "install" in one request.
 *
 * Creates the auth account, then the practice (site key, services, hours,
 * membership). If the practice cannot be created, the account is deleted again
 * so the email can be retried rather than being stuck in a half-signup.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const account = parseSignupBody(body);
  const record = (body ?? {}) as Record<string, unknown>;

  const problem = validateSignup(account);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  const name = normalizePracticeName(record.practiceName);
  if (!name) {
    return NextResponse.json({ ok: false, error: "Escribe el nombre de la clínica." }, { status: 400 });
  }

  const timezone = typeof record.timezone === "string" ? record.timezone : "Europe/London";
  if (!isValidTimeZone(timezone)) {
    return NextResponse.json({ ok: false, error: "Elige una zona horaria válida." }, { status: 400 });
  }

  const created = await signUpOrIn({ email: account.email!, password: account.password! });
  if (!created.ok) return NextResponse.json(created, { status: 400 });

  if (created.needsEmailConfirm) {
    // No session yet, so the wizard could not read the practice back. Ask them
    // to confirm, then sign in and finish setup.
    return NextResponse.json({
      ok: true,
      needsEmailConfirm: true,
      message: "Mira tu correo para confirmar la cuenta y luego entra para terminar el alta.",
    });
  }

  if (!created.isNew) {
    const { data: owned, error: ownedError } = await admin
      .from("business_members")
      .select("business_id")
      .eq("user_id", created.userId)
      .limit(1);
    if (ownedError) {
      return NextResponse.json(
        { ok: false, error: "No hemos podido comprobar tu cuenta. Inténtalo otra vez." },
        { status: 500 },
      );
    }
    if (owned && owned.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Esta cuenta ya tiene una clínica. Entra en lugar de crear otra." },
        { status: 409 },
      );
    }
  }

  try {
    const practice = await provisionBusiness(admin, {
      name,
      timezone,
      ownerUserId: created.userId,
      origin: typeof record.website === "string" ? record.website : null,
      contact: {
        phone: typeof record.phone === "string" ? record.phone : null,
        email: typeof record.email === "string" ? record.email : null,
        address: typeof record.address === "string" ? record.address : null,
      },
    });

    await setInviteCookie({
      businessId: practice.businessId,
      siteKey: practice.siteKey,
      name: practice.name,
    });

    return NextResponse.json({
      ok: true,
      needsEmailConfirm: false,
      siteKey: practice.siteKey,
      name: practice.name,
      servicesCreated: practice.servicesCreated,
      hoursCreated: practice.hoursCreated,
    });
  } catch (error) {
    // Roll the account back so the same email can be used again.
    if (created.isNew) await admin.auth.admin.deleteUser(created.userId).catch(() => {});
    // Nunca el texto crudo del SDK: puede ser en inglés y técnico.
    const raw = error instanceof Error ? error.message : "";
    const message = /fetch failed|network|ENOTFOUND|ECONNREFUSED|timeout/i.test(raw)
      ? "No hemos podido conectar con el servidor. Inténtalo en un minuto."
      : raw || "No hemos podido crear la clínica. Inténtalo otra vez.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
