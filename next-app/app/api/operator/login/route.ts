import { NextResponse } from "next/server";
import {
  clientKey,
  clearLoginFailures,
  isOperator,
  isSameOrigin,
  loginRetryAfter,
  OPERATOR_COOKIE,
  operatorCookieValue,
  recordLoginFailure,
} from "../../../../lib/operator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/operator/login — verifies the operator token, sets a session cookie. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "forbidden_origin" }, { status: 403 });
  }

  const key = clientKey(request);
  const retryAfter = loginRetryAfter(key);
  if (retryAfter > 0) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!isOperator(new Headers({ "x-operator-token": token }))) {
    recordLoginFailure(key);
    return NextResponse.json({ ok: false, error: "Invalid operator token." }, { status: 401 });
  }

  clearLoginFailures(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OPERATOR_COOKIE, operatorCookieValue(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
