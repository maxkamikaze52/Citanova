import crypto from "node:crypto";

/**
 * The supplier's side of the console: minting and revoking licence keys.
 *
 * Kept separate from practice logins on purpose. An operator action must never
 * be reachable with a customer's session, even by mistake, so this uses a
 * shared operator secret rather than Supabase auth.
 */
export function isOperator(headers: Headers): boolean {
  const expected = (process.env.OPERATOR_TOKEN ?? "").trim();
  if (expected.length < 16) return false; // refuse to run unconfigured

  const given = (headers.get("x-operator-token") ?? "").trim();
  if (given.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Session cookie set after the operator enters their token once. */
export const OPERATOR_COOKIE = "yourai_operator";

export function operatorCookieValue(): string {
  // Not the token itself: a hash, so a stolen cookie cannot mint keys forever
  // without the server secret changing.
  return crypto
    .createHmac("sha256", process.env.OPERATOR_TOKEN ?? "unset")
    .update("operator-session")
    .digest("base64url");
}

export function isValidOperatorCookie(value: string | undefined): boolean {
  if (!value) return false;
  const expected = operatorCookieValue();
  if (value.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * The operator cookie is a bearer credential sent by the browser on every
 * same-origin request, so a page on another site could trigger a key mint with
 * a plain HTML form. Nothing in this console needs cross-site access, so any
 * request whose Origin/Referer is not this host is refused.
 *
 * Requests with no Origin and no Referer are allowed: curl and the installer
 * use the token header, never the cookie.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin ?? referer;
  if (!source) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  if (!host) return false;

  try {
    return new URL(source).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function forbiddenOrigin(): Response {
  return Response.json({ ok: false, error: "forbidden_origin" }, { status: 403 });
}

/**
 * Login backoff, per client address. A fixed 12-hour operator session makes the
 * token worth guessing; this caps the guesses at 8 per address per window.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return (forwarded.split(",")[0] ?? "").trim() || request.headers.get("x-real-ip") || "local";
}

/** Seconds to wait, or 0 when the caller may try now. */
export function loginRetryAfter(key: string): number {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now() || entry.count < MAX_ATTEMPTS) return 0;
  return Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}

/** Test hook: the map is module state, so tests need to empty it. */
export function __clearLoginFailures(): void {
  attempts.clear();
}

export function adminApiUrl(path: string): string {
  const base = (process.env.ASSISTANT_API_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path}`;
}
