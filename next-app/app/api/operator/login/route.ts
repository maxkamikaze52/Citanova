import { NextResponse } from "next/server";
import { isOperator, OPERATOR_COOKIE, operatorCookieValue } from "../../../../lib/operator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/operator/login — verifies the operator token, sets a session cookie. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!isOperator(new Headers({ "x-operator-token": token }))) {
    return NextResponse.json({ ok: false, error: "Invalid operator token." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OPERATOR_COOKIE, operatorCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
