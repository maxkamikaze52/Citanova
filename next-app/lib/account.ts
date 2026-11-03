import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseServer } from "./supabase-server";

/**
 * Auth for the console.
 *
 * Real Supabase Auth, not a local user list:
 *  - signup creates an auth.users row (email confirmation disabled locally),
 *  - the wizard provisions the practice and makes the user its owner,
 *  - from then on RLS decides what they can read, so a dashboard bug cannot
 *    leak another practice's bookings.
 *
 * The only thing kept in a cookie is the short-lived invite token used to hand
 * a freshly created practice (and its site key) to the wizard exactly once.
 */

export type SignupInput = { email: string; password: string };
export type SignupResult =
  | { ok: true; userId: string; needsEmailConfirm: boolean; isNew: boolean }
  | { ok: false; error: string };

const MIN_PASSWORD = 8;

export function validateSignup(input: Partial<SignupInput>): string | null {
  const email = (input.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email address.";
  if ((input.password ?? "").length < MIN_PASSWORD) {
    return `Use at least ${MIN_PASSWORD} characters for the password.`;
  }
  return null;
}

/**
 * Creates the account. If they already exist and the password matches, we sign
 * them in instead — a second signup attempt on the same email should not be a
 * dead end during an interrupted setup.
 */
export async function signUpOrIn(input: SignupInput): Promise<SignupResult> {
  const problem = validateSignup(input);
  if (problem) return { ok: false, error: problem };

  const sb = await createSupabaseServer();
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      const { data: signed, error: signInError } = await sb.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (signInError || !signed.user) {
        return { ok: false, error: "That email already has an account. Try signing in instead." };
      }
      return { ok: true, userId: signed.user.id, needsEmailConfirm: false, isNew: false };
    }
    return { ok: false, error: error.message };
  }

  if (!data.user) return { ok: false, error: "Could not create the account." };

  // With "Confirm email" on, Supabase hides "already registered" behind a fake
  // user that has no identities. Treat that as an existing account.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    const { data: signed, error: signInError } = await sb.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (signInError || !signed.user) {
      return { ok: false, error: "That email already has an account. Try signing in instead." };
    }
    return { ok: true, userId: signed.user.id, needsEmailConfirm: false, isNew: false };
  }

  // With "Confirm email" on, Supabase returns a user but no session. The
  // wizard needs a session to read RLS-protected rows, so say so plainly.
  const needsEmailConfirm = !data.session;
  return { ok: true, userId: data.user.id, needsEmailConfirm, isNew: true };
}

const INVITE_COOKIE = "yourai_invite";
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "local-demo-secret-change-me";
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Stores "which practice did we just create for you" for one redirect. */
export async function setInviteCookie(payload: {
  businessId: string;
  siteKey: string;
  name: string;
}): Promise<void> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const jar = await cookies();
  jar.set(INVITE_COOKIE, `${body}.${hmac(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
  });
}

export async function readInviteCookie(): Promise<{
  businessId: string;
  siteKey: string;
  name: string;
} | null> {
  const jar = await cookies();
  const raw = jar.get(INVITE_COOKIE)?.value;
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;

  const expected = hmac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!data?.businessId || !data?.siteKey) return null;
    return data;
  } catch {
    return null;
  }
}

export async function clearInviteCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(INVITE_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Validates only the shape of a signup request body. */
export function parseSignupBody(body: unknown): Partial<SignupInput> {
  const record = (body ?? {}) as Record<string, unknown>;
  return {
    email: typeof record.email === "string" ? record.email : "",
    password: typeof record.password === "string" ? record.password : "",
  };
}

