import crypto from "node:crypto";
import { backendUrl } from "./admin-proxy";

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

/**
 * Provisioning: turning "a new dental practice signed up" into a working tenant.
 *
 * One call creates everything the assistant needs to answer on day one:
 *   businesses row  (site_key, calendar feed token, timezone, contact)
 *   services        (what can be booked, with prices)
 *   opening_hours   (the weekly template; closed days simply have no row)
 *   business_members(which Supabase user may see this practice)
 *
 * Design notes:
 *  - SERVER ONLY. Uses the service-role client, which bypasses RLS.
 *  - All-or-nothing: if a child insert fails, the business row is deleted and
 *    the cascade removes the rest, so we never leave a half-built practice.
 *  - The pure parts (defaults, validation, snippet) are exported separately so
 *    they can be unit-tested without a database.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  durationMin: number;
};

export type HoursInput = {
  /** 0 = Sunday … 6 = Saturday (matches JS getDay and the schema comment). */
  weekday: number;
  openTime: string;
  closeTime: string;
};

export type ProvisionInput = {
  name: string;
  timezone: string;
  /**
   * The practice's website Origin, e.g. https://brightsmile.co.uk. Required for
   * the widget to work at all: /api/chat rejects any Origin that is not listed
   * on the business. null means "they will connect it later" from the dashboard.
   */
  origin?: string | null;
  contact?: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    tagline?: string | null;
  };
  services?: ServiceInput[];
  hours?: HoursInput[];
  /** Supabase auth user who will own the practice. */
  ownerUserId: string;
};

export type Provisioned = {
  businessId: string;
  name: string;
  siteKey: string;
  calendarToken: string | null;
  timezone: string;
  /** The Origin stored on the business, or null if none was provided. */
  origin: string | null;
  servicesCreated: number;
  hoursCreated: number;
};

/** The subset of the Supabase admin client this module needs (keeps it testable). */
export type AdminLike = {
  from: (table: string) => any;
};

// ---------------------------------------------------------------------------
// Defaults — a sensible dental practice
// ---------------------------------------------------------------------------

export const DEFAULT_SERVICES: ServiceInput[] = [
  {
    name: "Routine check-up",
    description: "Full examination, X-rays if needed, and a written treatment plan.",
    priceCents: 4500,
    durationMin: 30,
  },
  {
    name: "Hygienist appointment",
    description: "Scale, polish and personalised cleaning advice.",
    priceCents: 6500,
    durationMin: 45,
  },
  {
    name: "Professional whitening",
    description: "In-chair whitening with custom take-home trays.",
    priceCents: 29500,
    durationMin: 60,
  },
  {
    name: "White filling",
    description: "Composite filling for a single tooth, local anaesthetic included.",
    priceCents: 9500,
    durationMin: 45,
  },
  {
    name: "Emergency appointment",
    description: "Same-day assessment for pain, swelling or a broken tooth.",
    priceCents: 8500,
    durationMin: 30,
  },
];

/**
 * The tools a new practice starts with.
 *
 * IMPORTANT: in this codebase `enabled_tools` is an allow-list, and an EMPTY
 * array is truthy — the agent then filters its tool definitions down to
 * nothing, so the model has no tools and starts writing tool calls as prose.
 * A new tenant must therefore be created with the full list, never with [].
 * Keep this in step with backend/src/tools/index.ts TOOL_NAMES.
 */
export const DEFAULT_ENABLED_TOOLS = [
  "get_business_information",
  "get_services",
  "check_availability",
  "book_appointment",
  "cancel_appointment",
] as const;

/** Mon–Fri 09:00–17:00, Sat 09:00–13:00. Sunday closed. */
export const DEFAULT_HOURS: HoursInput[] = [
  { weekday: 1, openTime: "09:00", closeTime: "17:00" },
  { weekday: 2, openTime: "09:00", closeTime: "17:00" },
  { weekday: 3, openTime: "09:00", closeTime: "17:00" },
  { weekday: 4, openTime: "09:00", closeTime: "17:00" },
  { weekday: 5, openTime: "09:00", closeTime: "17:00" },
  { weekday: 6, openTime: "09:00", closeTime: "13:00" },
];

/**
 * Common practice-opening timezones offered in the form. Anything IANA-valid
 * is accepted; this is just the short list so nobody has to type one.
 */
export const TIMEZONE_CHOICES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
] as const;

// ---------------------------------------------------------------------------

/** A sensible default price currency for a new practice; owners can change it later. */
export function currencyForTimeZone(timeZone: string): string {
  if (timeZone === "Europe/London") return "GBP";
  if (timeZone.startsWith("America/")) return "USD";
  if (timeZone.startsWith("Europe/")) return "EUR";
  return "GBP";
}

// Validation (pure)
// ---------------------------------------------------------------------------

export const MAX_NAME_LENGTH = 80;
/** Matches services_name_not_blank and businesses_name_not_blank. */
export function normalizePracticeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, MAX_NAME_LENGTH).trim() || null;
}

/** The schema only requires "contains a slash", but the column is used for
 *  real date arithmetic, so verify the runtime can format with it too. */
export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !tz.includes("/")) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Turns what a dentist types into the exact Origin string the backend compares
 * against. The widget sends Origin, which is scheme + host + port — never a
 * path, never a trailing slash.
 *
 *   "brightsmile.co.uk"                     -> https://brightsmile.co.uk
 *   "https://www.brightsmile.co.uk/prices"  -> https://www.brightsmile.co.uk
 *   "http://localhost:5501/"                -> http://localhost:5501
 *   "" / nonsense                           -> null
 */
export function normalizeOrigin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let value = raw.trim().toLowerCase();
  if (!value) return null;

  // A bare domain gets https, which is what almost every real site uses.
  // Local development is the exception: localhost/127.0.0.1 serve plain http,
  // and guessing wrong here means the widget is silently rejected on-device.
  if (!/^https?:\/\//.test(value)) {
    if (!/^[a-z0-9.-]+(:\d+)?(\/|$)/.test(value)) return null;
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(value);
    value = `${isLocal ? "http" : "https"}://${value}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || !url.hostname.includes(".") && url.hostname !== "localhost") return null;
    // Origin, not href: drops path, query, hash and any credentials.
    return url.origin;
  } catch {
    return null;
  }
}

/** "09:00" or "09:00:00" -> "09:00". Rejects anything that is not a real time. */
/**
 * A practice's site is usually reachable at both brightsmile.co.uk and
 * www.brightsmile.co.uk, and the browser sends whichever the visitor is on.
 * Allow the pair so a redirect between them cannot silently kill the widget.
 * localhost, IP addresses and IPv6 literals are left exactly as given.
 */
export function expandOrigins(origin: string | null): string[] {
  if (!origin) return [];
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host === "localhost" || /^[\d.]+$/.test(host) || host.startsWith("[")) return [origin];
    const twin = host.startsWith("www.") ? host.slice(4) : `www.${host}`;
    const port = url.port ? `:${url.port}` : "";
    return [origin, `${url.protocol}//${twin}${port}`];
  } catch {
    return [origin];
  }
}

export function normalizeTime(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const match = /^(\d{2}):(\d{2})(?::00)?$/.exec(raw.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return `${match[1]}:${match[2]}`;
}

/**
 * Cleans the services list. Drops anything unusable rather than failing the
 * whole signup; falls back to DEFAULT_SERVICES when nothing survives.
 * De-duplicates by name because (business_id, name) is unique.
 */
export function normalizeServices(input: unknown): ServiceInput[] {
  if (!Array.isArray(input)) return DEFAULT_SERVICES;

  const seen = new Set<string>();
  const out: ServiceInput[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim().slice(0, 120) : "";
    if (!name || seen.has(name.toLowerCase())) continue;

    const price = Number(row.priceCents);
    const duration = Number(row.durationMin);
    out.push({
      name,
      description:
        typeof row.description === "string" && row.description.trim()
          ? row.description.trim().slice(0, 400)
          : null,
      priceCents: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
      durationMin: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 30,
    });
    seen.add(name.toLowerCase());
    if (out.length >= 40) break;
  }
  return out.length ? out : DEFAULT_SERVICES;
}

/** Cleans the weekly template. Invalid or inverted rows are dropped. */
export function normalizeHours(input: unknown): HoursInput[] {
  if (!Array.isArray(input)) return DEFAULT_HOURS;

  const byDay = new Map<number, HoursInput>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const weekday = Number(row.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) continue;
    const open = normalizeTime(row.openTime);
    const close = normalizeTime(row.closeTime);
    if (!open || !close || close <= open) continue;
    byDay.set(weekday, { weekday, openTime: open, closeTime: close });
  }
  return byDay.size ? [...byDay.values()].sort((a, b) => a.weekday - b.weekday) : DEFAULT_HOURS;
}

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

/**
 * 32 lowercase hex chars, matching businesses_site_key_format
 * (^[A-Za-z0-9_-]{16,64}$) and 128 bits of entropy.
 */
export function generateSiteKey(random: (n: number) => Buffer = crypto.randomBytes): string {
  return random(16).toString("hex");
}

/**
 * The 5-line tag a practice pastes into their site. `apiUrl` is the backend
 * that answers /api/chat; `widgetUrl` is where the script itself is served.
 */
export function buildSnippet(options: {
  widgetUrl: string;
  apiUrl: string;
  siteKey: string;
  title: string;
}): string {
  return [
    `<script src="${options.widgetUrl}"`,
    `        data-site-key="${options.siteKey}"`,
    `        data-api-url="${options.apiUrl}"`,
    `        data-title="${options.title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}"></script>`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Provisioning (talks to the database)
// ---------------------------------------------------------------------------

/**
 * Creates a tenant and returns it. Throws on failure, having cleaned up.
 *
 * `clock` is injectable only so tests can assert on created_at handling.
 */
export async function provisionBusiness(
  admin: AdminLike,
  input: ProvisionInput,
): Promise<Provisioned> {
  const name = normalizePracticeName(input.name);
  if (!name) throw new Error("Escribe el nombre de el negocio.");
  if (!isValidTimeZone(input.timezone)) throw new Error("That timezone is not recognised.");
  if (!input.ownerUserId) throw new Error("Falta la cuenta del propietario.");

  const services = normalizeServices(input.services);
  const hours = normalizeHours(input.hours);
  const siteKey = generateSiteKey();
  const origin = normalizeOrigin(input.origin);

  const contact: Record<string, string> = {};
  for (const key of ["phone", "email", "address", "tagline"] as const) {
    const value = input.contact?.[key];
    if (typeof value === "string" && value.trim()) contact[key] = value.trim().slice(0, 200);
  }

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      name,
      site_key: siteKey,
      timezone: input.timezone,
      currency: currencyForTimeZone(input.timezone),
      // Empty list = the widget will refuse until the site is connected. The
      // dashboard offers a one-click "allow my website" once they know the URL.
      allowed_origins: expandOrigins(origin),
      contact,
      enabled_tools: [...DEFAULT_ENABLED_TOOLS],
    })
    .select("id,name,site_key,calendar_token,timezone")
    .single();

  if (businessError || !business) {
    throw new Error(`No hemos podido crear el negocio: ${businessError?.message ?? "error desconocido"}`);
  }

  const businessId = business.id as string;

  try {
    const { error: servicesError } = await admin.from("services").insert(
      services.map((service) => ({
        business_id: businessId,
        name: service.name,
        description: service.description ?? null,
        price_cents: service.priceCents,
        duration_min: service.durationMin,
        active: true,
      })),
    );
    if (servicesError) throw new Error(`services: ${servicesError.message}`);

    const { error: hoursError } = await admin.from("opening_hours").insert(
      hours.map((row) => ({
        business_id: businessId,
        weekday: row.weekday,
        open_time: row.openTime,
        close_time: row.closeTime,
      })),
    );
    if (hoursError) throw new Error(`opening_hours: ${hoursError.message}`);

    const { error: memberError } = await admin.from("business_members").insert({
      business_id: businessId,
      user_id: input.ownerUserId,
      role: "owner",
    });
    if (memberError) throw new Error(`business_members: ${memberError.message}`);
  } catch (error) {
    // Leave nothing behind. Children cascade from the business row.
    await admin.from("businesses").delete().eq("id", businessId);
    throw error instanceof Error ? error : new Error(String(error));
  }

  return {
    businessId,
    name: business.name as string,
    siteKey: business.site_key as string,
    calendarToken: (business.calendar_token as string | null) ?? null,
    timezone: business.timezone as string,
    origin: origin,
    servicesCreated: services.length,
    hoursCreated: hours.length,
  };
}

/** The paste-in tag, built from the PUBLIC addresses (same names as the backend .env). */
export function widgetTag(siteKey: string, title: string): string {
  const configured = process.env.PUBLIC_API_URL;
  if (!configured && process.env.NODE_ENV === "production") {
    // ASSISTANT_API_URL is the console's private route to the backend; it must
    // never be printed on a customer's public page.
    throw new Error("PUBLIC_API_URL must be set in production");
  }
  const apiUrl = (configured || backendUrl("")).replace(/\/+$/, "");
  return buildSnippet({
    widgetUrl: process.env.PUBLIC_WIDGET_URL || `${apiUrl}/api/widget/widget.js`,
    apiUrl,
    siteKey,
    title,
  });
}
