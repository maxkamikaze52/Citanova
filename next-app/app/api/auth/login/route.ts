import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../../lib/db";
import { parseSignupBody } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/login — email + password against Supabase Auth. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { email, password } = parseSignupBody(body);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const sb = await createSupabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });

  if (error) {
    // Same message for unknown email and wrong password: no account oracle.
    const friendly = /invalid login credentials/i.test(error.message)
      ? "Wrong email or password."
      : error.message;
    return NextResponse.json({ ok: false, error: friendly }, { status: 401 });
  }

  return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
}
