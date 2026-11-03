import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
