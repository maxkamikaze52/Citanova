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

export function adminApiUrl(path: string): string {
  const base = (process.env.ASSISTANT_API_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path}`;
}
