import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

/**
 * Server-side Supabase client bound to the signed-in user's cookies.
 *
 * Uses the ANON key on purpose: every query runs through RLS, so a bug in a
 * page can only ever return the caller's own practice. Never swap this for the
 * service-role client in a read path.
 */
export async function createSupabaseServer() {
  const jar = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (list: { name: string; value: string; options?: unknown }[]) => {
          try {
            for (const { name, value, options } of list) {
              jar.set(name, value, options as never);
            }
          } catch {
            // Server Components cannot write cookies. Session refresh happens
            // in middleware, so ignoring this here is correct, not a bug.
          }
        },
      },
    },
  );
}

export type MyBusiness = {
  id: string;
  name: string;
  site_key: string;
  timezone: string;
  contact: Record<string, string> | null;
  calendar_provider: string;
  calendar_token: string | null;
  /** Origins the chat is allowed to answer on. The backend is authoritative. */
  allowed_origins: string[] | null;
  subscription_status: string;
  monthly_message_cap: number | null;
  created_at: string;
};

/**
 * The practice this user belongs to. A person may own several; the dashboard
 * shows the first, which is what a signup creates. Returns null when the user
 * exists but has no practice yet (interrupted signup).
 */
export async function getMyBusiness(): Promise<{ business: MyBusiness | null; userId: string | null }> {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { business: null, userId: null };

  // Explicit membership first; RLS stays as the second wall. RLS alone answers
  // "which rows", not "which one", so without this a user in two practices got
  // both mixed under the first practice's name and timezone.
  const { data: member } = await sb
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!member) return { business: null, userId: user.id };

  const { data } = await sb
    .from("businesses")
    .select(
      "id,name,site_key,timezone,contact,calendar_provider,calendar_token,allowed_origins,created_at,subscription_status,monthly_message_cap",
    )
    .eq("id", (member as { business_id: string }).business_id)
    .maybeSingle();

  return { business: (data as MyBusiness | null) ?? null, userId: user.id };
}

// SERVER ONLY. Bypasses RLS: always filter by tenant_id yourself.
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

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
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Escribe un correo electrónico válido.";
  if ((input.password ?? "").length < MIN_PASSWORD) {
    return `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`;
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
        return { ok: false, error: "Ese correo ya tiene cuenta. Entra en lugar de crear otra." };
      }
      return { ok: true, userId: signed.user.id, needsEmailConfirm: false, isNew: false };
    }
    return { ok: false, error: error.message };
  }

  if (!data.user) return { ok: false, error: "No hemos podido crear la cuenta. Inténtalo otra vez." };

  // With "Confirm email" on, Supabase hides "already registered" behind a fake
  // user that has no identities. Treat that as an existing account.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    const { data: signed, error: signInError } = await sb.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (signInError || !signed.user) {
      return { ok: false, error: "Ese correo ya tiene cuenta. Entra en lugar de crear otra." };
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
