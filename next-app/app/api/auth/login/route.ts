import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../../lib/db";
import { parseSignupBody } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mensajes de Supabase Auth traducidos. El SDK responde en inglés y algunos de
 * sus textos ("fetch failed", "Invalid login credentials") son ilegibles para
 * un dentista, así que nunca se muestran tal cual.
 */
function authMessage(raw: string): string {
  if (/invalid login credentials|invalid_grant/i.test(raw)) {
    return "El correo o la contraseña no son correctos.";
  }
  if (/email not confirmed/i.test(raw)) {
    return "Todavía no has confirmado el correo. Mira tu bandeja de entrada.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONNREFUSED|timeout/i.test(raw)) {
    return "No hemos podido conectar con el servidor de cuentas. Inténtalo en un minuto.";
  }
  if (/rate limit|too many/i.test(raw)) {
    return "Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.";
  }
  return "No hemos podido entrar. Inténtalo otra vez.";
}

/** POST /api/auth/login — correo y contraseña contra Supabase Auth. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { email, password } = parseSignupBody(body);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Escribe tu correo y tu contraseña." }, { status: 400 });
  }

  try {
    const sb = await createSupabaseServer();
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      // Mismo mensaje para correo desconocido y contraseña mala: no revelamos si existe la cuenta.
      return NextResponse.json({ ok: false, error: authMessage(error.message) }, { status: 401 });
    }

    return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No hemos podido conectar con el servidor de cuentas. Inténtalo en un minuto." },
      { status: 502 },
    );
  }
}
